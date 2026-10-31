import "server-only";

/**
 * Transactional email via Resend's HTTP API (no SDK). Silently skipped until
 * RESEND_API_KEY and INQUIRY_FROM_EMAIL are set, so inquiries still save.
 */
export async function sendEmail(message: { to: string[]; subject: string; text: string; html?: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.INQUIRY_FROM_EMAIL;
  if (!key || !from || message.to.length === 0) return { sent: false as const, reason: "not-configured" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      ...(message.html && { html: message.html }),
      reply_to: message.replyTo,
      // A unique ID per email stops Gmail from grouping separate emails into one conversation.
      headers: { "X-Entity-Ref-ID": crypto.randomUUID() },
    }),
  });
  if (res.ok) return { sent: true as const };
  // Resend explains rejections (e.g. an invalid address) in a short JSON message.
  const detail = await res
    .json()
    .then((b: { message?: string }) => b.message ?? "")
    .catch(() => "");
  return { sent: false as const, reason: `resend-${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}` };
}
