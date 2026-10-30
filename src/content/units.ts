import type { Unit } from "./types";

// Confirmed by the owner. Rent is for the whole apartment per calendar month.
// Fees and one-time charges are empty until confirmed (see PLACEHOLDERS.md).

const shared = {
  pricingMode: "whole_unit",
  mandatoryFees: [],
  optionalFees: [],
  oneTimeCharges: [],
  showPerBedroomHelper: true,
  status: "available",
  availableFrom: "2027-08-01",
  leaseTermMonths: 12,
  furnished: true,
  inUnitLaundry: true,
} as const satisfies Partial<Unit>;

export const units: Unit[] = [
  {
    ...shared,
    slug: "apt-1158",
    displayName: "Apt 1158",
    shortName: "1158",
    accessibleName: "Apartment 1158",
    order: 1,
    bedrooms: 5,
    bathrooms: 5,
    squareFeet: 1720,
    monthlyRent: 8750,
    securityDeposit: 8750,
    summary:
      "Five bedrooms, each with its own private bathroom, across 1,720 square feet. Leased fully furnished with a washer and dryer in the apartment.",
    description:
      "Apt 1158 is a 1,720-square-foot, five-bedroom residence on West 37th Street in University Park, about a five-minute walk from the USC campus. Every bedroom has its own private bathroom, the apartment comes fully furnished, and a washer and dryer are in the unit. It leases as a whole apartment on a 12-month term starting August 2027.",
    features: [
      "5 bedrooms, 5 private bathrooms",
      "1,720 sq ft",
      "Fully furnished",
      "In-unit washer & dryer",
      "12-month lease",
      "Available August 2027",
    ],
    // Blank: built from the details above (see unitSeo in src/lib/seo.tsx).
    seo: { title: "", description: "" },
  },
  {
    ...shared,
    slug: "apt-1158-quarter",
    displayName: "Apt 1158 ¼",
    shortName: "1158 ¼",
    accessibleName: "Apartment 1158 and a quarter",
    order: 2,
    bedrooms: 3,
    bathrooms: 3,
    squareFeet: 1042,
    monthlyRent: 5100,
    securityDeposit: 5100,
    summary:
      "Three bedrooms, three private bathrooms and 1,042 square feet, furnished, with a washer and dryer in the apartment.",
    description:
      "Apt 1158 ¼ is a 1,042-square-foot, three-bedroom residence on West 37th Street, about a five-minute walk from USC. Each bedroom has its own private bathroom, and the apartment is leased fully furnished with an in-unit washer and dryer. It leases as a whole apartment on a 12-month term starting August 2027.",
    features: [
      "3 bedrooms, 3 private bathrooms",
      "1,042 sq ft",
      "Fully furnished",
      "In-unit washer & dryer",
      "12-month lease",
      "Available August 2027",
    ],
    // Blank: built from the details above (see unitSeo in src/lib/seo.tsx).
    seo: { title: "", description: "" },
  },
  {
    ...shared,
    slug: "apt-1158-half",
    displayName: "Apt 1158 ½",
    shortName: "1158 ½",
    accessibleName: "Apartment 1158 and a half",
    order: 3,
    bedrooms: 3,
    bathrooms: 3,
    squareFeet: 1045,
    monthlyRent: 5100,
    securityDeposit: 5100,
    summary:
      "Three bedrooms, each with a private bathroom, in 1,045 square feet. Furnished, with in-unit laundry.",
    description:
      "Apt 1158 ½ is a 1,045-square-foot, three-bedroom residence in University Park, about a five-minute walk from the USC campus. Every bedroom has a private bathroom, the apartment is fully furnished, and there’s a washer and dryer in the unit. It leases as a whole apartment on a 12-month term starting August 2027.",
    features: [
      "3 bedrooms, 3 private bathrooms",
      "1,045 sq ft",
      "Fully furnished",
      "In-unit washer & dryer",
      "12-month lease",
      "Available August 2027",
    ],
    // Blank: built from the details above (see unitSeo in src/lib/seo.tsx).
    seo: { title: "", description: "" },
  },
  {
    ...shared,
    slug: "apt-1158-three-quarter",
    displayName: "Apt 1158 ¾",
    shortName: "1158 ¾",
    accessibleName: "Apartment 1158 and three quarters",
    order: 4,
    bedrooms: 4,
    bathrooms: 4,
    squareFeet: 1411,
    monthlyRent: 6800,
    securityDeposit: 6800,
    summary:
      "Four bedrooms and four private bathrooms across 1,411 square feet, leased furnished with a washer and dryer in the apartment.",
    description:
      "Apt 1158 ¾ is a 1,411-square-foot, four-bedroom residence on West 37th Street, about a five-minute walk from USC. Each of the four bedrooms has its own private bathroom, and the apartment comes fully furnished with an in-unit washer and dryer. It leases as a whole apartment on a 12-month term starting August 2027.",
    features: [
      "4 bedrooms, 4 private bathrooms",
      "1,411 sq ft",
      "Fully furnished",
      "In-unit washer & dryer",
      "12-month lease",
      "Available August 2027",
    ],
    // Blank: built from the details above (see unitSeo in src/lib/seo.tsx).
    seo: { title: "", description: "" },
  },
  {
    ...shared,
    slug: "apt-1160",
    displayName: "Apt 1160",
    shortName: "1160",
    accessibleName: "Apartment 1160",
    order: 5,
    bedrooms: 5,
    bathrooms: 5,
    squareFeet: 1809,
    monthlyRent: 8875,
    securityDeposit: 8875,
    summary:
      "The building’s largest residence: five bedrooms, five private bathrooms and 1,809 square feet, furnished, with in-unit laundry.",
    description:
      "Apt 1160 is the largest residence in the building, a 1,809-square-foot, five-bedroom apartment on West 37th Street, about a five-minute walk from the USC campus. Every bedroom has a private bathroom, it’s leased fully furnished, and a washer and dryer are in the unit. It leases as a whole apartment on a 12-month term starting August 2027.",
    features: [
      "5 bedrooms, 5 private bathrooms",
      "1,809 sq ft",
      "Fully furnished",
      "In-unit washer & dryer",
      "12-month lease",
      "Available August 2027",
    ],
    // Blank: built from the details above (see unitSeo in src/lib/seo.tsx).
    seo: { title: "", description: "" },
  },
];
