import type { InquiryInput } from "@/lib/inquiry-schema";

/**
 * The owner's "new inquiry" email: every field the visitor filled in, as plain
 * text and simple HTML, so the owner can read and answer it without logging in.
 * Each subject is unique (name + time) so Gmail doesn't fold new inquiries into
 * one conversation and hide the details as "repeated" text.
 */
export function ownerInquiryEmail({
  data,
  unitName,
  adminUrl,
  receivedAt = new Date(),
}: {
  data: InquiryInput;
  unitName: string;
  adminUrl: string;
  receivedAt?: Date;
}) {
  const when = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(receivedAt);
  const firstName = data.fullName.split(" ")[0];
  const phoneHref = data.phone ? `tel:${data.phone.replace(/[^\d+]/g, "")}` : null;
  const contactMethod = { email: "Email", phone: "Phone call", text: "Text message" }[data.contactMethod];

  type Row = [label: string, value: string, href?: string | null];
  const candidates: (Row | null)[] = [
    ["Name", data.fullName],
    ["Email", data.email, `mailto:${data.email}`],
    data.phone ? ["Phone", data.phone, phoneHref] : null,
    ["Apartment", unitName],
    data.moveIn ? ["Move-in", data.moveIn === "august-2027" ? "August 2027" : data.moveInOther || "Other"] : null,
    data.groupSize ? ["Group size", String(data.groupSize)] : null,
    [
      "Preferred contact",
      contactMethod + (data.contactMethod === "text" ? (data.smsConsent ? " (agreed to texts)" : " (did not agree to texts)") : ""),
    ],
    ["Received", `${when} (Los Angeles time)`],
  ];
  const rows = candidates.filter((row): row is Row => row !== null);

  const subject = `New inquiry from ${data.fullName} (${unitName}) · ${when}`;

  const text = [
    `New inquiry from ${data.fullName}`,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Message:",
    data.message?.trim() || "(no message)",
    "",
    `Reply to this email to answer ${firstName} directly.`,
    `All inquiries: ${adminUrl}`,
  ].join("\n");

  const cell = "padding:8px 12px;border-bottom:1px solid #e2d6c3;vertical-align:top;font-size:15px";
  const html = `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1b1f1d;max-width:560px">
<h1 style="font-size:20px;margin:0 0 16px">New inquiry from ${escapeHtml(data.fullName)}</h1>
<table style="border-collapse:collapse;width:100%">
${rows
  .map(
    ([label, value, href]) =>
      `<tr><th align="left" style="${cell};color:#4a504c;font-weight:600;white-space:nowrap">${escapeHtml(label)}</th><td style="${cell}">${
        href ? `<a href="${escapeHtml(href)}" style="color:#b23e1f">${escapeHtml(value)}</a>` : escapeHtml(value)
      }</td></tr>`,
  )
  .join("\n")}
</table>
<h2 style="font-size:16px;margin:20px 0 8px">Message</h2>
<p style="margin:0;font-size:15px;line-height:1.5;white-space:pre-wrap">${escapeHtml(data.message?.trim() || "(no message)")}</p>
<p style="margin:24px 0 0;font-size:15px"><strong>Reply to this email</strong> to answer ${escapeHtml(firstName)} directly.${
    phoneHref ? ` Or <a href="${escapeHtml(phoneHref)}" style="color:#b23e1f">call ${escapeHtml(data.phone ?? "")}</a>.` : ""
  }</p>
<p style="margin:8px 0 0;font-size:13px;color:#4a504c"><a href="${escapeHtml(adminUrl)}" style="color:#4a504c">All inquiries in the admin</a></p>
</div>`;

  return { subject, text, html };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
