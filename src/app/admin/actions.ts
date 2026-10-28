"use server";

import { randomBytes } from "node:crypto";
import { refresh, updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import sharp from "sharp";
import type { ActionResult } from "@/components/admin/form-kit";
import type { HomePageContent, LocationHighlight, OneTimeCharge, RecurringFee, SiteSettings } from "@/content/types";
import { CONTENT_TAG } from "@/lib/data";
import { BUCKET } from "@/lib/supabase/env";
import { createSessionClient, getAdmin } from "@/lib/supabase/server";

// ── helpers ─────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) throw new Error("Not authorized");
  return admin;
}

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const optional = (fd: FormData, key: string) => str(fd, key) || null;
const bool = (fd: FormData, key: string) => fd.get(key) === "on";
function int(fd: FormData, key: string, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const n = Number(str(fd, key));
  if (!Number.isInteger(n) || n < min || n > max) throw new UserError(`“${key.replace(/_/g, " ")}” must be a whole number between ${min} and ${max}.`);
  return n;
}
const lines = (value: string) =>
  value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

class UserError extends Error {}

/** Runs an admin mutation, refreshes the public site, and turns errors into a friendly message. */
async function mutate(work: () => Promise<string>): Promise<ActionResult> {
  try {
    const message = await work();
    updateTag(CONTENT_TAG);
    // Re-render the admin page so lists reflect the change (e.g. a deleted item disappears).
    refresh();
    return { ok: true, message };
  } catch (e) {
    if (e instanceof UserError) return { ok: false, message: e.message };
    if (e instanceof Error && e.message === "Not authorized") return { ok: false, message: "Your session has ended. Please log in again." };
    return { ok: false, message: "Couldn’t save. Please check the values and try again." };
  }
}

function check(error: { message: string } | null) {
  if (error) throw new UserError(`Couldn’t save: ${error.message}`);
}

/** "Trash & sewer: 45" per line → fees. */
function parseFees(value: string): RecurringFee[] {
  return lines(value).map((line) => {
    const m = line.match(/^(.+?):\s*\$?\s*(\d+)\s*$/);
    if (!m) throw new UserError(`Fee “${line}” should look like “Name: 45”.`);
    return { name: m[1].trim(), monthlyAmount: Number(m[2]) };
  });
}

/** "Application fee: 50" or "Key deposit: 100 (refundable)" per line. */
function parseCharges(value: string): OneTimeCharge[] {
  return lines(value).map((line) => {
    const m = line.match(/^(.+?):\s*\$?\s*(\d+)\s*(\(refundable\))?\s*$/i);
    if (!m) throw new UserError(`Charge “${line}” should look like “Application fee: 50” or “Key deposit: 100 (refundable)”.`);
    return { name: m[1].trim(), amount: Number(m[2]), refundable: Boolean(m[3]) };
  });
}

// ── auth ────────────────────────────────────────────────────────────────────

export async function signIn(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email: str(fd, "email"), password: String(fd.get("password") ?? "") });
  if (error) return { ok: false, message: "That email and password don’t match. Please try again." };
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    return { ok: false, message: "This account doesn’t have access to the 37th Street Housing admin." };
  }
  redirect("/admin");
}

export async function requestPasswordReset(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
  const supabase = await createSessionClient();
  await supabase.auth.resetPasswordForEmail(str(fd, "email"), { redirectTo: `${origin}/admin/auth/callback?next=/admin/reset` });
  // Same answer whether or not the account exists.
  return { ok: true, message: "If that email has an account, a reset link is on its way." };
}

export async function updatePassword(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const password = String(fd.get("password") ?? "");
  if (password.length < 12) return { ok: false, message: "Use at least 12 characters." };
  if (password !== String(fd.get("confirm") ?? "")) return { ok: false, message: "The two passwords don’t match." };
  const supabase = await createSessionClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, message: "That reset link has expired. Request a new one from the login page." };
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ── apartments ──────────────────────────────────────────────────────────────

export async function saveUnit(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return mutate(async () => {
    const { supabase } = await requireAdmin();
    const slug = str(fd, "slug");
    const availableFrom = str(fd, "available_from");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(availableFrom)) throw new UserError("Choose an available-from date.");
    const { error } = await supabase
      .from("units")
      .update({
        bedrooms: int(fd, "bedrooms", { min: 1, max: 12 }),
        bathrooms: int(fd, "bathrooms", { min: 1, max: 12 }),
        square_feet: int(fd, "square_feet", { min: 1, max: 20000 }),
        monthly_rent: int(fd, "monthly_rent", { max: 100000 }),
        security_deposit: int(fd, "security_deposit", { max: 100000 }),
        mandatory_fees: parseFees(str(fd, "mandatory_fees")),
        optional_fees: parseFees(str(fd, "optional_fees")),
        one_time_charges: parseCharges(str(fd, "one_time_charges")),
        show_per_bedroom_helper: bool(fd, "show_per_bedroom_helper"),
        status: str(fd, "status"),
        available_from: availableFrom,
        lease_term_months: int(fd, "lease_term_months", { min: 1, max: 60 }),
        furnished: bool(fd, "furnished"),
        in_unit_laundry: bool(fd, "in_unit_laundry"),
        summary: str(fd, "summary"),
        description: str(fd, "description"),
        features: lines(str(fd, "features")),
        seo_title: str(fd, "seo_title"),
        seo_description: str(fd, "seo_description"),
        published: bool(fd, "published"),
      })
      .eq("slug", slug);
    check(error);
    return "Saved. The website updates within a few seconds.";
  });
}

// ── site settings & homepage text ───────────────────────────────────────────

export async function saveSiteSettings(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return mutate(async () => {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase.from("site_settings").select("content").eq("id", 1).single();
    check(error);
    const current = data!.content as SiteSettings;
    const email = optional(fd, "email");
    if (email && !/^\S+@\S+\.\S+$/.test(email)) throw new UserError("Enter a valid contact email.");
    const next: SiteSettings = {
      ...current,
      phone: optional(fd, "phone"),
      email,
      officeHours: optional(fd, "office_hours"),
      tourHours: optional(fd, "tour_hours"),
      leasingBanner: { enabled: bool(fd, "banner_enabled"), text: str(fd, "banner_text") || current.leasingBanner.text },
      notificationEmails: str(fd, "notification_emails")
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean),
    };
    const { error: saveError } = await supabase.from("site_settings").update({ content: next }).eq("id", 1);
    check(saveError);
    return "Saved. The website updates within a few seconds.";
  });
}

const MODES = ["walk", "bike", "transit", "drive"] as const;

/** "USC University Park campus | walk | 5 | verified" per line. */
function parseHighlights(value: string): LocationHighlight[] {
  return lines(value).map((line) => {
    const [place, mode, minutes, verified] = line.split("|").map((p) => p.trim());
    if (!place || !MODES.includes(mode as (typeof MODES)[number]) || !/^\d+$/.test(minutes ?? "")) {
      throw new UserError(`Neighborhood line “${line}” should look like “Place | walk | 5 | verified”.`);
    }
    return { place, mode: mode as LocationHighlight["mode"], minutes: Number(minutes), verified: verified?.toLowerCase() === "verified" };
  });
}

export async function saveHomePage(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return mutate(async () => {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase.from("home_page").select("content").eq("id", 1).single();
    check(error);
    const c = data!.content as HomePageContent;
    const paragraphs = str(fd, "intro_body")
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\s+/g, " ").trim())
      .filter(Boolean);
    const next: HomePageContent = {
      ...c,
      hero: { ...c.hero, eyebrow: str(fd, "hero_eyebrow"), headline: str(fd, "hero_headline"), headlineAccent: str(fd, "hero_accent"), subline: str(fd, "hero_subline") },
      intro: { ...c.intro, eyebrow: str(fd, "intro_eyebrow"), heading: str(fd, "intro_heading"), body: paragraphs },
      residences: { eyebrow: str(fd, "res_eyebrow"), heading: str(fd, "res_heading"), body: str(fd, "res_body") },
      interiors: { ...c.interiors, eyebrow: str(fd, "int_eyebrow"), heading: str(fd, "int_heading"), body: str(fd, "int_body") },
      neighborhood: {
        eyebrow: str(fd, "nb_eyebrow"),
        heading: str(fd, "nb_heading"),
        body: str(fd, "nb_body"),
        highlights: parseHighlights(str(fd, "nb_highlights")),
        disclaimer: str(fd, "nb_disclaimer"),
      },
      features: {
        ...c.features,
        eyebrow: str(fd, "feat_eyebrow"),
        heading: str(fd, "feat_heading"),
        items: c.features.items.map((item, i) => ({
          ...item,
          title: str(fd, `feat_${i}_title`) || item.title,
          body: str(fd, `feat_${i}_body`),
          confirmed: bool(fd, `feat_${i}_confirmed`),
        })),
      },
      faq: { eyebrow: str(fd, "faq_eyebrow"), heading: str(fd, "faq_heading") },
      cta: { heading: str(fd, "cta_heading"), body: str(fd, "cta_body") },
    };
    for (const item of next.features.items) {
      if (item.confirmed && !item.body) throw new UserError(`Add a description for “${item.title}” before showing it.`);
    }
    const { error: saveError } = await supabase.from("home_page").update({ content: next }).eq("id", 1);
    check(saveError);
    return "Saved. The website updates within a few seconds.";
  });
}

// ── FAQs ────────────────────────────────────────────────────────────────────

export async function saveFaq(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return mutate(async () => {
    const { supabase } = await requireAdmin();
    const answer = str(fd, "answer");
    const published = bool(fd, "published");
    if (published && !answer) throw new UserError("Write an answer before showing this question.");
    const { error } = await supabase
      .from("faqs")
      .update({ question: str(fd, "question"), answer, published, sort_order: int(fd, "sort_order", { max: 999 }) })
      .eq("id", str(fd, "id"));
    check(error);
    return published ? "Saved and visible on the website." : "Saved (hidden from the website).";
  });
}

export async function createFaq(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return mutate(async () => {
    const { supabase } = await requireAdmin();
    const question = str(fd, "question");
    if (question.length < 5) throw new UserError("Write the question first.");
    const id = `${question.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40)}-${randomBytes(2).toString("hex")}`;
    const { count } = await supabase.from("faqs").select("id", { count: "exact", head: true });
    const { error } = await supabase.from("faqs").insert({ id, question, answer: "", published: false, sort_order: (count ?? 0) + 1 });
    check(error);
    return "Added (hidden until you write an answer and check “Show on website”).";
  });
}

export async function deleteFaq(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return mutate(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("faqs").delete().eq("id", str(fd, "id"));
    check(error);
    return "Deleted.";
  });
}

// ── photos ──────────────────────────────────────────────────────────────────

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function uploadPhoto(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return mutate(async () => {
    const { supabase } = await requireAdmin();
    const file = fd.get("file");
    if (!(file instanceof File) || file.size === 0) throw new UserError("Choose a photo to upload.");
    if (!IMAGE_TYPES.includes(file.type)) throw new UserError("Upload a JPEG, PNG or WebP photo.");
    if (file.size > 10 * 1024 * 1024) throw new UserError("That photo is over 10 MB. Please use a smaller one.");
    const alt = str(fd, "alt");
    if (alt.length < 10) throw new UserError("Describe the photo in a sentence (at least 10 characters) for visitors using screen readers.");

    // Re-encode: fixes orientation, caps size, and strips all metadata (including GPS location).
    let output: { data: Buffer; info: { width: number; height: number } };
    try {
      output = await sharp(Buffer.from(await file.arrayBuffer()))
        .rotate()
        .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer({ resolveWithObject: true });
    } catch {
      throw new UserError("That file couldn’t be read as a photo. Try exporting it as a JPEG.");
    }
    const blur = await sharp(output.data).resize(12).jpeg({ quality: 50 }).toBuffer();

    const base = (str(fd, "caption") || file.name.replace(/\.[^.]+$/, ""))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "photo";
    const id = `${base}-${randomBytes(3).toString("hex")}`;
    const path = `uploads/${id}.webp`;

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, output.data, { contentType: "image/webp", upsert: false });
    check(uploadError);

    const { data: last } = await supabase.from("media").select("sort_order").order("sort_order", { ascending: false }).limit(1);
    const { error } = await supabase.from("media").insert({
      id,
      kind: "image",
      src: path,
      alt,
      caption: optional(fd, "caption"),
      category: str(fd, "category") === "exterior" ? "exterior" : "interior",
      room: str(fd, "room") || "bedroom",
      assigned_unit: optional(fd, "assigned_unit"),
      width: output.info.width,
      height: output.info.height,
      blur_data_url: `data:image/jpeg;base64,${blur.toString("base64")}`,
      sort_order: (last?.[0]?.sort_order ?? 0) + 1,
      published: true,
    });
    if (error) {
      await supabase.storage.from(BUCKET).remove([path]);
      check(error);
    }
    return "Uploaded. It’s now in the gallery.";
  });
}

export async function savePhoto(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return mutate(async () => {
    const { supabase } = await requireAdmin();
    const id = str(fd, "id");
    const alt = str(fd, "alt");
    if (alt.length < 10) throw new UserError("The description needs at least 10 characters.");
    const assigned = optional(fd, "assigned_unit");
    const isCover = bool(fd, "is_cover") && Boolean(assigned);
    if (isCover) {
      // Only one cover photo per apartment.
      const { error } = await supabase.from("media").update({ is_cover: false }).eq("assigned_unit", assigned!).neq("id", id);
      check(error);
    }
    const { error } = await supabase
      .from("media")
      .update({
        alt,
        caption: optional(fd, "caption"),
        category: str(fd, "category") === "exterior" ? "exterior" : "interior",
        room: str(fd, "room"),
        assigned_unit: assigned,
        is_cover: isCover,
        focal_x: int(fd, "focal_x", { max: 100 }),
        focal_y: int(fd, "focal_y", { max: 100 }),
        sort_order: int(fd, "sort_order", { max: 9999 }),
        published: bool(fd, "published"),
      })
      .eq("id", id);
    check(error);
    return "Saved.";
  });
}

export async function deletePhoto(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return mutate(async () => {
    const { supabase } = await requireAdmin();
    const id = str(fd, "id");
    const { data: home } = await supabase.from("home_page").select("content").eq("id", 1).single();
    const c = home?.content as HomePageContent | undefined;
    const usedOnHome = c && [c.hero.mediaId, c.intro.mediaId, ...c.interiors.mediaIds, ...c.features.mediaIds].includes(id);
    if (usedOnHome) throw new UserError("This photo is used on the homepage. Hide it instead, or ask your developer to swap it first.");
    const { data: row, error: readError } = await supabase.from("media").select("src").eq("id", id).single();
    check(readError);
    const { error } = await supabase.from("media").delete().eq("id", id);
    check(error);
    if (row?.src.startsWith("uploads/")) await supabase.storage.from(BUCKET).remove([row.src]);
    return "Deleted.";
  });
}

// ── inquiries (not public content: no cache refresh needed, but harmless) ───

const STATUSES = ["new", "contacted", "toured", "closed"];

export async function saveInquiry(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return mutate(async () => {
    const { supabase } = await requireAdmin();
    const status = str(fd, "status");
    if (!STATUSES.includes(status)) throw new UserError("Choose a status.");
    const { error } = await supabase.from("inquiries").update({ status, notes: optional(fd, "notes") }).eq("id", str(fd, "id"));
    check(error);
    return "Saved.";
  });
}

export async function deleteInquiry(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return mutate(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("inquiries").delete().eq("id", str(fd, "id"));
    check(error);
    return "Deleted.";
  });
}
