import { describe, expect, it } from "vitest";
import { ownerInquiryEmail } from "@/lib/inquiry-email";
import type { InquiryInput } from "@/lib/inquiry-schema";

const data: InquiryInput = {
  fullName: "Jane Doe",
  email: "jane@example.com",
  phone: "(213) 555-0123",
  unit: "apt-1158",
  moveIn: "august-2027",
  moveInOther: "",
  groupSize: "4",
  contactMethod: "text",
  message: "Can we tour on Saturday?\nThere are four of us.",
  consent: true,
  smsConsent: true,
  website: "",
};
const email = ownerInquiryEmail({
  data,
  unitName: "Apt 1158",
  adminUrl: "https://37thstreethousing.com/admin/inquiries",
  receivedAt: new Date("2026-10-31T22:42:00Z"),
});

describe("owner inquiry email", () => {
  it("has a unique, descriptive subject so Gmail doesn't fold inquiries together", () => {
    expect(email.subject).toBe("New inquiry from Jane Doe (Apt 1158) · Oct 31, 3:42 PM");
  });

  it.each(["Jane Doe", "jane@example.com", "(213) 555-0123", "Apt 1158", "August 2027", "Group size: 4", "Text message (agreed to texts)", "Can we tour on Saturday?"])(
    "includes %s in the text version",
    (value) => expect(email.text).toContain(value),
  );

  it("links email and phone in the HTML version", () => {
    expect(email.html).toContain('href="mailto:jane@example.com"');
    expect(email.html).toContain('href="tel:2135550123"');
  });

  it("escapes anything a visitor types, so it can't inject HTML into the owner's inbox", () => {
    const evil = ownerInquiryEmail({
      data: { ...data, fullName: '<img src=x onerror="alert(1)">', message: "<script>alert(1)</script>" },
      unitName: "Apt 1158",
      adminUrl: "https://37thstreethousing.com/admin/inquiries",
    });
    expect(evil.html).not.toContain("<script>");
    expect(evil.html).not.toContain("<img");
    expect(evil.html).toContain("&lt;script&gt;");
  });
});
