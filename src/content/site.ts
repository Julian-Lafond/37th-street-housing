import type { SiteSettings } from "./types";

const addressQuery = encodeURIComponent("1158 W 37th St, Los Angeles, CA 90007");

export const siteSettings: SiteSettings = {
  legalName: "37th Street Housing",
  wordmark: "37th Street",
  descriptor: "Housing near USC",
  url: "https://37thstreethousing.com",
  address: {
    street: "1158–1160 W 37th St",
    city: "Los Angeles",
    neighborhood: "University Park",
    region: "CA",
    postalCode: "90007",
    country: "US",
  },
  // PLACEHOLDER: confirm coordinates from Google Maps (right-click the building → copy coordinates).
  geo: null,
  googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${addressQuery}`,
  mapEmbedUrl: `https://www.google.com/maps?q=${addressQuery}&output=embed`,
  // PLACEHOLDERS: hidden on the site until filled in.
  phone: null,
  email: null,
  officeHours: null,
  tourHours: null,
  social: [],
  leasingBanner: { enabled: true, text: "Now leasing for August 2027" },
  notificationEmails: [],
  contentUpdatedAt: "2026-10-26",
};
