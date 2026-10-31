"use server";

import { createHash } from "node:crypto";
import { clientIp } from "@/lib/client-ip";
import { getSiteSettings, getUnits } from "@/lib/data";
import { sendEmail } from "@/lib/email";
import { createInquirySchema, type InquiryInput } from "@/lib/inquiry-schema";
import type { InquiryResult } from "@/lib/inquiry";
import { createServiceClient, isServiceConfigured } from "@/lib/supabase/service";

const MAX_PER_HOUR = 5;

/**
 * Saves an inquiry. Re-validates with the same schema as the form, drops bot
 * submissions (honeypot), rate-limits by a salted hash of the visitor's IP
 * (the raw IP is never stored), verifies Turnstile when configured, then
 * stores it and notifies the owner. Submission contents are never logged.
 */
export async function sendInquiry(input: InquiryInput): Promise<InquiryResult> {
  if (!isServiceConfigured()) {
    return { status: "error", message: "Online inquiries aren’t available right now. Please email or call us." };
  }

  // Honeypot filled: pretend success so bots learn nothing.
  if (typeof input?.website === "string" && input.website.trim() !== "") return { status: "received" };

  const units = await getUnits();
  const parsed = createInquirySchema(units.map((u) => u.slug)).safeParse(input);
  if (!parsed.success) return { status: "error", message: "Some details look incomplete. Please check the form and try again." };
  const data = parsed.data;

  // Automated tests run with INQUIRY_DRY_RUN=1: full validation, nothing saved or sent.
  if (process.env.INQUIRY_DRY_RUN === "1") return { status: "received" };

  const ip = await clientIp();
  const db = createServiceClient();

  const salt = process.env.RATE_LIMIT_SALT ?? "";
  const key = `inquiry:${createHash("sha256").update(salt + ip).digest("hex")}`;
  const { data: allowed, error: rateError } = await db.rpc("hit_rate_limit", {
    limit_key: key,
    max_hits: MAX_PER_HOUR,
    window_seconds: 3600,
  });
  if (rateError) return { status: "error", message: "Something went wrong. Please try again or email us." };
  if (!allowed) {
    return { status: "error", message: "You’ve sent several inquiries in a short time. Please wait an hour or email us directly." };
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    const token = (input as { turnstileToken?: string }).turnstileToken ?? "";
    const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: turnstileSecret, response: token, remoteip: ip }),
    }).then((r) => r.json() as Promise<{ success: boolean }>);
    if (!verify.success) return { status: "error", message: "We couldn’t verify the form. Please try again." };
  }

  const { error } = await db.from("inquiries").insert({
    full_name: data.fullName,
    email: data.email,
    phone: data.phone || null,
    unit_slug: data.unit,
    move_in: data.moveIn || null,
    move_in_other: data.moveIn === "other" ? data.moveInOther || null : null,
    group_size: data.groupSize ? Number(data.groupSize) : null,
    contact_method: data.contactMethod,
    message: data.message || null,
    consent: data.consent,
    sms_consent: data.contactMethod === "text" && data.smsConsent,
  });
  if (error) return { status: "error", message: "Something went wrong saving your inquiry. Please try again or email us." };

  // Email failures never fail the inquiry: it's already saved for the owner.
  const site = await getSiteSettings();
  const unitName = units.find((u) => u.slug === data.unit)?.displayName ?? "Not sure yet";
  const notify = (process.env.INQUIRY_NOTIFY_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .concat(site.notificationEmails)
    .filter(Boolean);
  await Promise.allSettled([
    sendEmail({
      to: notify,
      replyTo: data.email,
      subject: `New inquiry: ${unitName}`,
      text: [
        `Name: ${data.fullName}`,
        `Email: ${data.email}`,
        data.phone && `Phone: ${data.phone}`,
        `Apartment: ${unitName}`,
        data.moveIn && `Move-in: ${data.moveIn === "august-2027" ? "August 2027" : data.moveInOther}`,
        data.groupSize && `Group size: ${data.groupSize}`,
        `Preferred contact: ${data.contactMethod}${data.contactMethod === "text" ? " (agreed to texts)" : ""}`,
        data.message && `\n${data.message}`,
        `\nManage inquiries: ${site.url}/admin/inquiries`,
      ]
        .filter(Boolean)
        .join("\n"),
    }),
    sendEmail({
      to: [data.email],
      // The sending address has no mailbox, so a reply to the confirmation goes to the owner instead.
      replyTo: notify[0],
      subject: "We received your inquiry | 37th Street Housing",
      text: [
        `Hi ${data.fullName.split(" ")[0]},`,
        "",
        `Thanks for your interest in ${unitName === "Not sure yet" ? "37th Street Housing" : unitName}. We received your inquiry and will be in touch soon by ${data.contactMethod}.`,
        "",
        "37th Street Housing",
        `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`,
        "",
        "Equal Housing Opportunity. 37th Street Housing is privately owned and is not affiliated with or endorsed by the University of Southern California.",
      ].join("\n"),
    }),
  ]);

  return { status: "received" };
}
