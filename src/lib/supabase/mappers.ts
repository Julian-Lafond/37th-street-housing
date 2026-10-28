import type { Faq, MediaItem, OneTimeCharge, RecurringFee, Unit, UnitSlug } from "@/content/types";
import { mediaUrl } from "./env";

// Row shapes of the housing schema (supabase/migrations/20261027000001_housing_schema.sql).

export interface UnitRow {
  slug: string;
  display_name: string;
  short_name: string;
  accessible_name: string;
  sort_order: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  pricing_mode: Unit["pricingMode"];
  monthly_rent: number;
  security_deposit: number;
  mandatory_fees: RecurringFee[];
  optional_fees: RecurringFee[];
  one_time_charges: OneTimeCharge[];
  show_per_bedroom_helper: boolean;
  status: Unit["status"];
  available_from: string;
  lease_term_months: number;
  furnished: boolean;
  in_unit_laundry: boolean;
  summary: string;
  description: string;
  features: string[];
  seo_title: string;
  seo_description: string;
  published: boolean;
}

export interface MediaRow {
  id: string;
  kind: MediaItem["kind"];
  src: string;
  alt: string;
  caption: string | null;
  category: MediaItem["category"];
  room: MediaItem["room"];
  assigned_unit: string | null;
  is_cover: boolean;
  focal_x: number;
  focal_y: number;
  sort_order: number;
  width: number;
  height: number;
  blur_data_url: string;
  poster: string | null;
  captions_src: string | null;
  published: boolean;
}

export interface FaqRow {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  published: boolean;
}

export const unitFromRow = (r: UnitRow): Unit => ({
  slug: r.slug as UnitSlug,
  displayName: r.display_name,
  shortName: r.short_name,
  accessibleName: r.accessible_name,
  order: r.sort_order,
  bedrooms: r.bedrooms,
  bathrooms: r.bathrooms,
  squareFeet: r.square_feet,
  pricingMode: r.pricing_mode,
  monthlyRent: r.monthly_rent,
  securityDeposit: r.security_deposit,
  mandatoryFees: r.mandatory_fees,
  optionalFees: r.optional_fees,
  oneTimeCharges: r.one_time_charges,
  showPerBedroomHelper: r.show_per_bedroom_helper,
  status: r.status,
  availableFrom: r.available_from,
  leaseTermMonths: r.lease_term_months,
  furnished: r.furnished,
  inUnitLaundry: r.in_unit_laundry,
  summary: r.summary,
  description: r.description,
  features: r.features,
  seo: { title: r.seo_title, description: r.seo_description },
});

export const unitToRow = (u: Unit, published = true): UnitRow => ({
  slug: u.slug,
  display_name: u.displayName,
  short_name: u.shortName,
  accessible_name: u.accessibleName,
  sort_order: u.order,
  bedrooms: u.bedrooms,
  bathrooms: u.bathrooms,
  square_feet: u.squareFeet,
  pricing_mode: u.pricingMode,
  monthly_rent: u.monthlyRent,
  security_deposit: u.securityDeposit,
  mandatory_fees: u.mandatoryFees,
  optional_fees: u.optionalFees,
  one_time_charges: u.oneTimeCharges,
  show_per_bedroom_helper: u.showPerBedroomHelper,
  status: u.status,
  available_from: u.availableFrom,
  lease_term_months: u.leaseTermMonths,
  furnished: u.furnished,
  in_unit_laundry: u.inUnitLaundry,
  summary: u.summary,
  description: u.description,
  features: u.features,
  seo_title: u.seo.title,
  seo_description: u.seo.description,
  published,
});

export const mediaFromRow = (r: MediaRow): MediaItem => ({
  id: r.id,
  kind: r.kind,
  src: mediaUrl(r.src),
  alt: r.alt,
  caption: r.caption,
  category: r.category,
  room: r.room,
  assignedTo: (r.assigned_unit ?? "shared") as MediaItem["assignedTo"],
  isCover: r.is_cover,
  focalPoint: { x: r.focal_x, y: r.focal_y },
  order: r.sort_order,
  width: r.width,
  height: r.height,
  blurDataURL: r.blur_data_url,
  ...(r.poster && { poster: mediaUrl(r.poster) }),
  ...(r.captions_src && { captionsSrc: mediaUrl(r.captions_src) }),
});

export const mediaToRow = (m: MediaItem, published = true): MediaRow => ({
  id: m.id,
  kind: m.kind,
  src: m.src,
  alt: m.alt,
  caption: m.caption,
  category: m.category,
  room: m.room,
  assigned_unit: m.assignedTo === "shared" ? null : m.assignedTo,
  is_cover: m.isCover,
  focal_x: m.focalPoint.x,
  focal_y: m.focalPoint.y,
  sort_order: m.order,
  width: m.width,
  height: m.height,
  blur_data_url: m.blurDataURL,
  poster: m.poster ?? null,
  captions_src: m.captionsSrc ?? null,
  published,
});

export const faqFromRow = (r: FaqRow): Faq => ({
  id: r.id,
  question: r.question,
  answer: r.answer,
  order: r.sort_order,
  published: r.published,
});

export const faqToRow = (f: Faq): FaqRow => ({
  id: f.id,
  question: f.question,
  answer: f.answer,
  sort_order: f.order,
  published: f.published,
});
