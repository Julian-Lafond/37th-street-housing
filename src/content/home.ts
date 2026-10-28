import type { HomePageContent } from "./types";

// Copy rules (Fair Housing advertising): describe the property, never the ideal
// tenant; no unverifiable superlatives; proximity statements are fine.

export const homePage: HomePageContent = {
  hero: {
    eyebrow: "University Park · Los Angeles",
    headline: "Five minutes from campus.",
    headlineAccent: "Miles from ordinary.",
    subline:
      "Five furnished apartments on West 37th Street, each bedroom with its own private bathroom, about a five-minute walk to USC.",
    mediaId: "exterior-front-day",
  },
  intro: {
    eyebrow: "The building",
    heading: "A classic house on 37th Street, made for sharing well.",
    body: [
      "37th Street Housing is a two-storey house in University Park, divided into five apartments of three to five bedrooms. Inside it’s bright and modern: wood-look floors, white shaker kitchens with gas ranges, and big windows in nearly every room.",
      "Every bedroom has its own private bathroom. Each apartment comes fully furnished, has a washer and dryer in the unit, and leases as a whole on a 12-month term, so a group can sign together and move in ready.",
    ],
    mediaId: "interior-dining-bay-window",
    stats: [
      { value: 5, label: "Residences" },
      { value: null, text: "3–5", label: "Bedrooms each" },
      { value: null, text: "1:1", label: "A private bath for every bedroom" },
      { value: null, text: "Furnished", label: "Move-in ready" },
      { value: null, text: "In-unit", label: "Washer & dryer" },
      { value: 5, prefix: "~", suffix: " min", label: "Walk to USC" },
    ],
  },
  residences: {
    eyebrow: "Residences",
    heading: "Five apartments. One address.",
    body: "Three, four and five-bedroom apartments, all furnished and available August 2027. Prices are for the whole apartment per month.",
  },
  interiors: {
    eyebrow: "Inside 37th Street",
    heading: "Light, wood and clean lines.",
    body: "A look inside the building, from shared kitchens to private bathrooms.",
    mediaIds: [
      "interior-kitchen-peninsula",
      "interior-bedroom-01",
      "interior-bathroom-01",
      "interior-bedroom-05",
      "interior-dining-bay-window",
      "interior-bedroom-03",
    ],
  },
  neighborhood: {
    eyebrow: "Neighborhood",
    heading: "Close to campus, close to the city.",
    body: "The building sits on a residential stretch of West 37th Street in University Park, with campus, groceries, Exposition Park and the Metro E Line within walking distance.",
    // PLACEHOLDER: owner must confirm every time in Google Maps, then set verified: true.
    highlights: [
      { place: "USC University Park campus", mode: "walk", minutes: 5, verified: false },
      { place: "USC Village shops & groceries", mode: "walk", minutes: 10, verified: false },
      { place: "Metro E Line, Expo/Vermont station", mode: "walk", minutes: 10, verified: false },
      { place: "Exposition Park & museums", mode: "walk", minutes: 15, verified: false },
      { place: "Downtown Los Angeles", mode: "transit", minutes: 20, verified: false },
    ],
    disclaimer: "Times are approximate and vary by route.",
  },
  features: {
    eyebrow: "What’s included",
    heading: "Everything you need, already inside.",
    items: [
      {
        icon: "sofa",
        title: "Fully furnished",
        body: "Bedrooms come with a bed, desk and chair, and the shared spaces are furnished too.",
        confirmed: true,
      },
      {
        icon: "washer",
        title: "In-unit washer & dryer",
        body: "Laundry is inside the apartment. No coins, no trips downstairs.",
        confirmed: true,
      },
      {
        icon: "bath",
        title: "A private bathroom for every bedroom",
        body: "No sharing a bathroom. Every bedroom has its own.",
        confirmed: true,
      },
      {
        icon: "calendar",
        title: "12-month lease",
        body: "Leases run 12 months, starting August 2027.",
        confirmed: true,
      },
      // PLACEHOLDERS: hidden until the owner confirms.
      { icon: "wifi", title: "Utilities", body: "", confirmed: false },
      { icon: "car", title: "Parking", body: "", confirmed: false },
      { icon: "paw", title: "Pets", body: "", confirmed: false },
    ],
    mediaIds: ["interior-kitchen-peninsula", "interior-bedroom-laundry-view", "interior-bedroom-03"],
  },
  faq: { eyebrow: "FAQ", heading: "Good questions." },
  cta: {
    heading: "August 2027 leasing is open.",
    body: "Tell us which apartment you’re interested in and we’ll be in touch with availability and next steps.",
  },
};
