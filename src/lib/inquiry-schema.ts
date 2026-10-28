import { z } from "zod";

// Zod's JIT compiles validators with `new Function`, which the site's
// Content-Security-Policy (no 'unsafe-eval') blocks. Jitless mode avoids it.
z.config({ jitless: true });

/**
 * Shared inquiry schema. The contact form validates with it now; the Phase 2
 * server action will import the same factory and validate again server-side.
 *
 * Fair Housing: never add fields about criminal history, immigration status,
 * source of income, age, familial or marital status, disability, or any other
 * protected characteristic. No credit/SSN, payments or uploads.
 */

export const ANY_UNIT = "any";
export const MOVE_IN_OPTIONS = ["", "august-2027", "other"] as const;
export const CONTACT_METHODS = ["email", "phone", "text"] as const;

const phonePattern = /^\+?[\d\s().-]{7,20}$/;

export function createInquirySchema(unitSlugs: readonly string[]) {
  const unitValues = new Set<string>([ANY_UNIT, ...unitSlugs]);

  return z
    .object({
      fullName: z.string().trim().min(1, "Enter your full name.").max(120, "Name must be 120 characters or fewer."),
      email: z
        .string()
        .trim()
        .min(1, "Enter your email address.")
        .pipe(z.email("Enter a valid email address, like name@example.com.")),
      phone: z
        .string()
        .trim()
        .max(30, "Phone number must be 30 characters or fewer.")
        .refine((v) => v === "" || phonePattern.test(v), "Enter a valid phone number, like (213) 555-0123."),
      unit: z.string().refine((v) => unitValues.has(v), "Choose an apartment, or “Not sure yet”."),
      moveIn: z.enum(MOVE_IN_OPTIONS),
      moveInOther: z.string().trim().max(80, "Keep this under 80 characters."),
      groupSize: z
        .string()
        .refine((v) => v === "" || /^[1-5]$/.test(v), "Enter a number from 1 to 5."),
      contactMethod: z.enum(CONTACT_METHODS),
      message: z.string().trim().max(2000, "Message must be 2,000 characters or fewer."),
      consent: z.boolean().refine((v) => v, "Check this box so we can contact you about your inquiry."),
      smsConsent: z.boolean(),
      /** Honeypot. Humans never see or fill it. */
      website: z.string(),
    })
    .superRefine((data, ctx) => {
      if ((data.contactMethod === "phone" || data.contactMethod === "text") && data.phone === "") {
        ctx.addIssue({
          code: "custom",
          path: ["phone"],
          message: "Enter a phone number so we can reach you by phone or text.",
        });
      }
      if (data.contactMethod === "text" && !data.smsConsent) {
        ctx.addIssue({
          code: "custom",
          path: ["smsConsent"],
          message: "Check this box to agree to text messages, or choose another contact method.",
        });
      }
      if (data.moveIn === "other" && data.moveInOther === "") {
        ctx.addIssue({ code: "custom", path: ["moveInOther"], message: "Tell us your preferred move-in timing." });
      }
    });
}

export type InquiryInput = z.input<ReturnType<typeof createInquirySchema>>;

export const inquiryDefaults: InquiryInput = {
  fullName: "",
  email: "",
  phone: "",
  unit: "",
  moveIn: "",
  moveInOther: "",
  groupSize: "",
  contactMethod: "email",
  message: "",
  consent: false,
  smsConsent: false,
  website: "",
};
