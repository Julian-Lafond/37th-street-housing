/**
 * Content types. Each type mirrors a Phase 2 CMS collection or global
 * field-for-field (see docs/PHASE_2_BACKEND.md), so swapping the local files
 * for a CMS only changes src/lib/data, never the components.
 *
 * Fields set to `null` are unknown and stay hidden on the site until filled.
 * Every one of them is listed in PLACEHOLDERS.md.
 */

export type UnitSlug =
  | "apt-1158"
  | "apt-1158-quarter"
  | "apt-1158-half"
  | "apt-1158-three-quarter"
  | "apt-1160";

export type PricingMode = "whole_unit" | "per_bedroom" | "on_request";

export type UnitStatus = "available" | "limited" | "waitlist" | "leased";

export interface RecurringFee {
  /** e.g. "Trash & sewer" */
  name: string;
  /** Monthly amount in whole US dollars. */
  monthlyAmount: number;
}

export interface OneTimeCharge {
  /** e.g. "Application fee" */
  name: string;
  amount: number;
  refundable: boolean;
}

/** CMS collection: Units */
export interface Unit {
  slug: UnitSlug;
  /** Visual name with fraction glyphs, e.g. "Apt 1158 ¾". Never used in URLs or IDs. */
  displayName: string;
  /** Large typographic name for cards, e.g. "1158 ¾". */
  shortName: string;
  /** Spoken name for assistive tech, e.g. "Apartment 1158 and three quarters". */
  accessibleName: string;
  order: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  pricingMode: PricingMode;
  /** Whole-unit rent per calendar month, in US dollars. */
  monthlyRent: number;
  securityDeposit: number;
  /** Included in the advertised monthly price. Empty until the owner confirms fees. */
  mandatoryFees: RecurringFee[];
  optionalFees: RecurringFee[];
  /** One-time charges other than the security deposit (which has its own field). */
  oneTimeCharges: OneTimeCharge[];
  showPerBedroomHelper: boolean;
  status: UnitStatus;
  /** ISO date the unit is available from. */
  availableFrom: string;
  leaseTermMonths: number;
  furnished: boolean;
  inUnitLaundry: boolean;
  /** 1–2 sentences for cards. */
  summary: string;
  /** Longer paragraph for the unit page. */
  description: string;
  features: string[];
  seo: {
    title: string;
    description: string;
  };
}

export type MediaCategory = "exterior" | "interior";

export type RoomType = "living" | "kitchen" | "hallway" | "bedroom" | "bathroom" | "laundry" | "exterior";

/** CMS collection: Media */
export interface MediaItem {
  id: string;
  kind: "image" | "video";
  /** Path under /public, e.g. "/media/exterior-front-day.jpg". */
  src: string;
  /** Required. Describes the photo, never a specific apartment unless assigned. */
  alt: string;
  caption: string | null;
  category: MediaCategory;
  room: RoomType;
  /** "shared" shows the item in the building-wide gallery only. A unit slug pairs it with that unit. */
  assignedTo: "shared" | UnitSlug;
  /** Marks the cover photo when assigned to a unit. */
  isCover: boolean;
  /** Percentages used for object-position when cropping. */
  focalPoint: { x: number; y: number };
  order: number;
  width: number;
  height: number;
  blurDataURL: string;
  /** Video only. */
  poster?: string;
  /** Video only: WebVTT captions file, required if the video has speech. */
  captionsSrc?: string;
}

export interface PostalAddress {
  street: string;
  city: string;
  neighborhood: string;
  region: string;
  postalCode: string;
  country: string;
}

/** CMS global: SiteSettings */
export interface SiteSettings {
  legalName: string;
  wordmark: string;
  descriptor: string;
  url: string;
  address: PostalAddress;
  /** null until confirmed from Google Maps; hidden from JSON-LD until then. */
  geo: { latitude: number; longitude: number } | null;
  googleMapsUrl: string;
  mapEmbedUrl: string;
  phone: string | null;
  email: string | null;
  officeHours: string | null;
  tourHours: string | null;
  social: { label: string; href: string }[];
  leasingBanner: { enabled: boolean; text: string };
  /** Phase 2: where inquiry notifications go. Not used by the front end. */
  notificationEmails: string[];
  /** Used for sitemap lastModified. Update when content changes. */
  contentUpdatedAt: string;
}

export interface LocationHighlight {
  place: string;
  mode: "walk" | "bike" | "transit" | "drive";
  minutes: number;
  /** Set true once the owner has checked the time in Google Maps. */
  verified: boolean;
}

export interface Stat {
  /** Numeric part animated by the count-up, if any. */
  value: number | null;
  prefix?: string;
  suffix?: string;
  /** Used when the stat isn't a number, e.g. "Fully furnished". */
  text?: string;
  label: string;
}

export type FeatureIcon = "sofa" | "washer" | "bath" | "calendar" | "wifi" | "car" | "paw";

export interface Feature {
  icon: FeatureIcon;
  title: string;
  body: string;
  /** Unconfirmed features stay hidden. */
  confirmed: boolean;
}

/** CMS global: HomePage */
export interface HomePageContent {
  hero: {
    eyebrow: string;
    headline: string;
    headlineAccent: string;
    subline: string;
    mediaId: string;
  };
  intro: {
    eyebrow: string;
    heading: string;
    body: string[];
    mediaId: string;
    stats: Stat[];
  };
  residences: { eyebrow: string; heading: string; body: string };
  interiors: { eyebrow: string; heading: string; body: string; mediaIds: string[] };
  neighborhood: {
    eyebrow: string;
    heading: string;
    body: string;
    highlights: LocationHighlight[];
    disclaimer: string;
  };
  features: {
    eyebrow: string;
    heading: string;
    items: Feature[];
    /** Photos shown alongside the feature grid, matched to the copy. */
    mediaIds: string[];
  };
  faq: { eyebrow: string; heading: string };
  cta: { heading: string; body: string };
}

/** CMS collection: FAQs */
export interface Faq {
  id: string;
  question: string;
  answer: string;
  order: number;
  /** Unanswered placeholders stay hidden. */
  published: boolean;
}

export type LegalSlug = "privacy" | "terms" | "accessibility" | "fair-housing";

/** CMS global: LegalPages */
export interface LegalPageMeta {
  slug: LegalSlug;
  title: string;
  description: string;
  /** ISO date shown as "Effective" / "Last reviewed". */
  updatedAt: string;
}
