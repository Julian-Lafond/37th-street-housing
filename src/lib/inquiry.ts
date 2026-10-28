import type { InquiryInput } from "./inquiry-schema";

export interface InquiryContact {
  email: string | null;
  phone: string | null;
}

export type InquiryResult =
  | {
      status: "unavailable";
      message: string;
      /** Prefilled mailto: link, or null when no contact email is configured yet. */
      mailtoHref: string | null;
    }
  | { status: "received" }
  | { status: "error"; message: string };

export interface InquiryContext {
  contact: InquiryContact;
  /** Human-readable apartment label for the email body. */
  unitLabel: string;
  moveInLabel: string;
}

/**
 * Offline fallback used when the backend isn't configured (no Supabase keys):
 * nothing is sent or stored; the visitor gets a prefilled email instead.
 * With the backend configured, the form calls sendInquiry() (inquiry-action.ts).
 */
export async function submitInquiry(data: InquiryInput, context: InquiryContext): Promise<InquiryResult> {
  // Honeypot filled: a bot. Show the same message and do nothing.
  if (data.website.trim() !== "") {
    return { status: "unavailable", message: COMING_SOON, mailtoHref: null };
  }

  return {
    status: "unavailable",
    message: COMING_SOON,
    mailtoHref: context.contact.email ? buildMailto(context.contact.email, data, context) : null,
  };
}

const COMING_SOON = "Online inquiries are coming soon. Please email or call us.";

export function buildMailto(to: string, data: InquiryInput, context: InquiryContext): string {
  const lines = [
    `Name: ${data.fullName}`,
    `Email: ${data.email}`,
    data.phone && `Phone: ${data.phone}`,
    `Apartment of interest: ${context.unitLabel}`,
    context.moveInLabel && `Desired move-in: ${context.moveInLabel}`,
    data.groupSize && `Group size: ${data.groupSize}`,
    `Preferred contact: ${data.contactMethod}`,
    data.message && `\n${data.message}`,
  ].filter(Boolean);

  const subject = `Inquiry: ${context.unitLabel}`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
}
