# Placeholders: what the owner still needs to confirm

Everything below is unknown today. Unknown values are `null`, empty or `published: false` in the content files, and **stay hidden on the site until filled in**. Bracketed placeholders in the legal pages (for example `[CONTACT EMAIL]`) are visible on those pages, so they must be replaced before launch.

| # | Item | Where to fill it in | Hidden until filled? | Blocks launch? |
|---|---|---|---|---|
| 1 | **Contact email** | `src/content/site.ts` → `email` | Yes (footer, contact page, mailto link) | **Yes.** The stub form's prefilled email link and the legal pages depend on it. |
| 2 | **Contact phone** | `src/content/site.ts` → `phone` | Yes | Strongly recommended |
| 3 | Office hours | `src/content/site.ts` → `officeHours` | Yes | No |
| 4 | Tour hours / how tours work | `src/content/site.ts` → `tourHours`; FAQ `tours` in `src/content/faqs.ts` | Yes | No |
| 5 | **Utilities included or not** | FAQ `utilities`; feature `Utilities` in `src/content/home.ts` (set `confirmed: true` and write the body) | Yes | No, but expect the question |
| 6 | **Mandatory monthly fees** (trash, utilities flat fee, etc.) | Each unit's `mandatoryFees` in `src/content/units.ts` | Nothing shows until added. Once added, they are **automatically included in every advertised price** and itemized under "Price details". | **Yes, the owner must confirm "none" or list them.** California advertising rules require the advertised price to include mandatory fees. |
| 7 | Optional monthly fees (parking, storage) | Each unit's `optionalFees` | Yes | No |
| 8 | **Application / screening fee** | Each unit's `oneTimeCharges` (e.g. `{ name: "Application fee", amount: 50, refundable: false }`); FAQ `application` | Yes | Recommended |
| 9 | Parking | FAQ `parking`; feature `Parking` | Yes | No |
| 10 | Pet policy | FAQ `pets`; feature `Pets` | Yes | No |
| 11 | Social media links | `src/content/site.ts` → `social` | Yes | No |
| 12 | **Walk / transit times** | `src/content/home.ts` → `neighborhood.highlights` | **No, shown now as estimates** with "Times are approximate". Confirm each in Google Maps from the building's front door, correct the minutes and set `verified: true`. | **Yes** |
| 13 | Building coordinates | `src/content/site.ts` → `geo` | Yes (omitted from structured data) | No (improves local SEO) |
| 14 | **Legal entity name, mailing address, contact email/phone in legal pages** | `src/content/legal/*.mdx`: replace `[OWNER NAME / ENTITY]`, `[MAILING ADDRESS]`, `[CONTACT EMAIL]`, `[CONTACT PHONE]` | **No, visible** | **Yes** |
| 15 | Phase 2 service providers | `src/content/legal/privacy.mdx`: hosting (Netlify) and data storage (Supabase) are filled in. Still open: `[EMAIL PROVIDER]` (Resend, once set up) and `[SPAM-PROTECTION PROVIDER]` (Cloudflare Turnstile, once set up) | No, visible | **Yes** |
| 16 | Furnishing wording | `src/content/home.ts` feature "Fully furnished" and FAQ `furnished` say each bedroom has "a bed, desk and chair" (as the photos show). Confirm this is true for every bedroom. | Shown | Confirm |
| 17 | Which photos show which apartment | `src/content/media.ts` → `assignedTo` (all `"shared"` today) | Not applicable: unassigned photos stay in the shared gallery | No |
| 18 | Photo rights | The owner confirms they may publish the photos (filenames suggest a listing photographer). See `docs/MEDIA_INVENTORY.md`. | Not applicable | **Yes (confirmation only)** |
| 19 | Square footage source | The owner's figures are used. The Tripalink floor plans list 1,615 sq ft (1158) and 1,775 sq ft (1160). Confirm which is correct. | Not applicable | Confirm |
| 20 | Client name spelling | The brief says "Safa Al Alawi"; the agreement says "Safa Alawi". Used only in legal placeholders. | Not applicable | Confirm |
