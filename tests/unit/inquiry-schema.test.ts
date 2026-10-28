import { describe, expect, it } from "vitest";
import { createInquirySchema, inquiryDefaults, type InquiryInput } from "@/lib/inquiry-schema";
import { buildMailto, submitInquiry } from "@/lib/inquiry";

const schema = createInquirySchema(["apt-1158", "apt-1160"]);
const valid: InquiryInput = { ...inquiryDefaults, fullName: "Alex Rivera", email: "alex@example.com", unit: "apt-1158", consent: true };
const issues = (data: InquiryInput) => {
  const r = schema.safeParse(data);
  return r.success ? [] : r.error.issues.map((i) => i.path.join("."));
};

describe("inquiry schema", () => {
  it("accepts a minimal valid inquiry", () => {
    expect(issues(valid)).toEqual([]);
  });

  it("requires name, email, apartment and consent", () => {
    expect(issues(inquiryDefaults).sort()).toEqual(["consent", "email", "fullName", "unit"]);
  });

  it("rejects unknown apartments but allows 'not sure'", () => {
    expect(issues({ ...valid, unit: "apt-9999" })).toEqual(["unit"]);
    expect(issues({ ...valid, unit: "any" })).toEqual([]);
  });

  it("requires a phone for phone/text and SMS consent for text", () => {
    expect(issues({ ...valid, contactMethod: "phone" })).toEqual(["phone"]);
    expect(issues({ ...valid, contactMethod: "text", phone: "(213) 555-0123" })).toEqual(["smsConsent"]);
    expect(issues({ ...valid, contactMethod: "text", phone: "(213) 555-0123", smsConsent: true })).toEqual([]);
  });

  it("limits group size to 1–5", () => {
    expect(issues({ ...valid, groupSize: "6" })).toEqual(["groupSize"]);
    expect(issues({ ...valid, groupSize: "4" })).toEqual([]);
  });

  it("asks only fair-housing-safe questions", () => {
    const fields = Object.keys(inquiryDefaults).join(" ").toLowerCase();
    for (const banned of ["age", "birth", "income", "criminal", "citizen", "immigration", "children", "marital", "disab", "race", "religion", "gender", "ssn", "credit"]) {
      expect(fields).not.toMatch(new RegExp(`\\b${banned}`));
    }
  });
});

describe("submitInquiry stub", () => {
  const context = { contact: { email: "leasing@example.com", phone: null }, unitLabel: "Apt 1158", moveInLabel: "August 2027" };

  it("sends nothing and returns the coming-soon message with a prefilled mailto", async () => {
    const res = await submitInquiry(valid, context);
    expect(res.status).toBe("unavailable");
    if (res.status === "unavailable") {
      expect(res.message).toBe("Online inquiries are coming soon. Please email or call us.");
      expect(res.mailtoHref).toContain("mailto:leasing@example.com");
      expect(decodeURIComponent(res.mailtoHref!)).toContain("Alex Rivera");
    }
  });

  it("returns no mailto when no contact email is configured", async () => {
    const res = await submitInquiry(valid, { ...context, contact: { email: null, phone: null } });
    expect(res.status === "unavailable" && res.mailtoHref).toBeNull();
  });

  it("treats a filled honeypot as a bot without building an email", async () => {
    const res = await submitInquiry({ ...valid, website: "spam" }, context);
    expect(res.status === "unavailable" && res.mailtoHref).toBeNull();
  });

  it("builds a mailto with subject and body", () => {
    expect(buildMailto("a@b.co", valid, context)).toMatch(/^mailto:a@b\.co\?subject=Inquiry%3A%20Apt%201158&body=/);
  });
});
