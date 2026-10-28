# 37th Street Housing: 37thstreethousing.com

Marketing site for five furnished apartments at 1158–1160 W 37th St, Los Angeles (University Park, near USC).

Content is stored in **Supabase** (shared project, isolated `housing` schema) and edited by the owner at **`/admin`**. The contact form saves inquiries to the database. How it works: [`docs/PHASE_2_BACKEND.md`](docs/PHASE_2_BACKEND.md). Database setup: [`supabase/README.md`](supabase/README.md).

> ⚠️ **Before launch:** set up email (Resend) and spam protection (Turnstile). See the backend doc.

## Stack

Next.js 16 (App Router, Cache Components, every page statically prerendered) · TypeScript (strict) · Tailwind CSS 4 · GSAP (ScrollTrigger, SplitText) + Lenis · Motion (lightbox only) · React Hook Form + Zod · MDX (legal pages) · `next/font` (Fraunces + Manrope, self-hosted) · `next/image` (AVIF/WebP, blur placeholders) · Vitest · Playwright + axe-core.

No analytics, cookies or third-party scripts. The Google map loads only when a visitor clicks "Load interactive map".

## Design & motion system

**Typography.** *Fraunces* (display) with *Manrope* (body/UI). Fraunces is a high-contrast "soft serif" with an optical-size axis. At display sizes it tightens into an editorial, slightly warm face, and its italic gives the one accent phrase per headline ("Miles from ordinary.") a hand-set feel that suits a sunlit LA monograph. Manrope is a clean geometric-humanist sans: open apertures for small UI text and steady numerals for prices. Both are self-hosted via `next/font` with `display: swap`, and both display faces are preloaded.

- Fluid `clamp()` scale in `globals.css`: `text-mega` (home hero, ~48px phones → ~113px at 1440 → 136px max), `text-hero` (page titles), `text-display` (section headings), `text-title`, `text-lede`, `text-body`.
- Headlines use tight tracking (−0.025 to −0.04em) and leading (0.92–1.02); body text uses 1.5–1.65 leading at ≤65ch. `text-wrap: balance` on headings, `pretty` on paragraphs, curly quotes and en/em dashes throughout.

**Motion tokens** (CSS variables in `globals.css`, mirrored in `src/lib/motion.ts`):

| Token | Value | Use |
|---|---|---|
| `--ease-entrance` | `cubic-bezier(0.22, 1, 0.36, 1)` | anything arriving |
| `--ease-transition` | `cubic-bezier(0.65, 0, 0.35, 1)` | state changes; also Tailwind's default transition curve |
| `--dur-micro` / `--dur-ui` / `--dur-reveal` | 200 / 400 / 900ms (images 1.1s) | hovers · UI changes · reveals |
| `--stagger` | 60ms | grouped items |
| `--space-section` / `--space-block` | fluid | vertical rhythm between and within sections |

**Where the motion lives**

| Piece | File | Notes |
|---|---|---|
| Branded intro | `components/motion/intro.tsx` | CSS only, ≈1.3s, first page of a session, pointer-transparent, skipped under reduced motion |
| Load headline reveal | `components/motion/split-headline.tsx` | each word rises from a mask in reading order; CSS only, so it never waits for JS; supporting copy follows in a stagger (`.load-rise`) |
| Scroll reveals | `components/motion/motion-director.tsx` | data attributes: `data-split` (SplitText line masks), `data-reveal`, `data-image-reveal` (clip-path wipe + 1.15→1), `data-parallax`. Each plays once; content is visible without JS |
| Smooth scroll | `components/motion/smooth-scroll.tsx` | Lenis on GSAP's ticker, synced with ScrollTrigger; anchor links offset for the header |
| Signature moment | `components/home/interiors-showcase.tsx` | pinned horizontal interiors gallery on desktop; swipeable scroll-snap rail on phones and under reduced motion |
| Marquee | `components/motion/marquee.tsx` | speed follows scroll velocity and reverses with direction |
| Cursor / magnetic CTAs | `custom-cursor.tsx`, `magnetic.tsx` | fine pointers only; label via `data-cursor="View" / "Open" / "Scroll"` |

GSAP, its plugins and Lenis load after hydration (`loadMotion()`), so they stay off the critical path. **Reduced motion:** no intro, smooth scroll, parallax, pinning, marquee movement, cursor or magnetic pull; reveals become simple fades.

## Getting started

Requires Node 20.9+ (developed on Node 22).

```bash
npm install
npm run dev            # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run typecheck` | Regenerate route types, then `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests (pricing, photo assignment, inquiry schema and stub) |
| `npm run test:e2e` | Playwright: axe on every page plus the lightbox, mobile menu and form error states; keyboard flows, data, SEO and headers in Chromium, Firefox and WebKit (desktop and mobile). Run `npm run build` first; it starts its own `next start` on port 3200 with `INQUIRY_DRY_RUN=1`, so tests never save inquiries. |
| `npm run check` | typecheck + lint + unit tests |
| `npm run db:seed` | One-time copy of `src/content` into Supabase (refuses if already seeded) |
| `npm run media:meta` | Regenerate image sizes and blur placeholders after adding or replacing photos in `public/media/` |

First e2e run: `npx playwright install chromium firefox webkit`.

## Project layout

```
src/
  app/(site)/             public routes (home, residences, gallery, contact, legal pages)
  app/admin/              owner admin (login, inquiries, apartments, photos, text, FAQs, settings)
  app/                    root layout,
                          not-found, error, sitemap, robots, OG images, icons)
  components/             UI, grouped by area (home, units, gallery, contact, layout, motion, ui)
  content/                ← all site content (typed; mirrors the future CMS schema)
    units.ts  media.ts  site.ts  home.ts  faqs.ts  legal/*.mdx
  lib/
    data/                 repository layer: components read content only through here
    pricing.ts            advertised price (always includes mandatory fees), per-bedroom illustration
    inquiry-schema.ts     shared Zod schema (form + server action)
    inquiry-action.ts     saves inquiries (validation, rate limit, email)
    supabase/             Supabase clients and row mappers
    inquiry.ts            offline email fallback when Supabase isn’t configured
public/media/             processed photos (originals untouched in the owner's files)
docs/MEDIA_INVENTORY.md   review of every photo/video and why it was used or excluded
PLACEHOLDERS.md           everything the owner still needs to confirm
```

## Editing content

The owner edits everything at **`/admin`** (apartments, photos, homepage text, FAQs, contact details, inquiries). See [`docs/PHASE_2_BACKEND.md`](docs/PHASE_2_BACKEND.md).

- **Assigning photos to an apartment:** `/admin` → Photos → Edit → "Shows". Only assign a photo when the owner has confirmed which apartment it shows. That apartment's card and page then use it, and a per-unit section appears in the gallery.
- **Developer-only:** legal pages (`src/content/legal/*.mdx`, attorney-reviewed) and which photos the homepage features (`home_page.content` → `hero.mediaId`, `intro.mediaId`, `interiors.mediaIds`, `features.mediaIds`).
- `src/content/*` is the fallback used when Supabase isn't configured, and the seed for `npm run db:seed`.

## Deploying

The site needs a Node.js host that supports Next.js 16 (Cache Components needs the Node runtime). **Vercel** is the simplest choice. Per the services agreement, the client owns and pays for the hosting and domain accounts.

1. Create the project under the **client's** Vercel account and import the repository. Defaults work (`npm run build`).
2. Add `37thstreethousing.com` and `www.37thstreethousing.com` under **Project → Settings → Domains**, and set `www` to redirect to the apex.
3. **DNS** at the registrar: use the exact records Vercel displays for the domain. Typically that's an `A` record for `@` pointing to Vercel's IP and a `CNAME` for `www` pointing to Vercel's DNS target, or switch the nameservers to Vercel. Remove conflicting `A`/`AAAA`/`CNAME` records. HTTPS is issued automatically once DNS resolves.
4. The canonical URL is hard-coded as `https://37thstreethousing.com` (`src/lib/seo.tsx`, `src/content/site.ts`). Change both if the domain ever changes.
5. The HSTS header includes `preload`. Only submit the domain to hstspreload.org once HTTPS works on the apex and every subdomain.

## Launch checklist

**Blocking**
- [ ] Email (Resend) and spam protection (Turnstile) configured and tested: owner notified, auto-reply sent.
- [ ] Hosting has the same environment variables as `.env.local` (Supabase URL, anon key, service key, rate-limit salt, email keys).
- [ ] Contact email (and ideally phone) filled in. See `PLACEHOLDERS.md`.
- [ ] Owner confirms mandatory monthly fees (or none) and the application fee.
- [ ] Owner verifies every walk/transit time in Google Maps and sets `verified: true`.
- [ ] **A California attorney reviews all four legal pages** (each MDX file starts with a developer note saying so), and all `[BRACKETED]` placeholders are replaced.
- [ ] Owner confirms the right to publish the photos and approves all content (Agreement §7).
- [ ] Owner confirms square footages (they differ from the old floor plans) and furniture wording.

**Before or at launch**
- [ ] Run `npm run check`, `npm run build` and `npm run test:e2e`. All green.
- [ ] Run PageSpeed Insights (mobile) on Home, Residences, a unit page, Gallery and Contact against the deployed URL.
- [ ] Validate structured data with Google's Rich Results Test on Home and a unit page.
- [ ] Manually check in Safari (macOS and iOS), Chrome and Firefox at 320, 768, 1024, 1440 and 1920px.

**Off-site SEO (baseline setup, Agreement §5)**
- [ ] Create or verify a **Google Business Profile** for the property (the address must match the site exactly).
- [ ] Verify the domain in **Google Search Console** and submit `https://37thstreethousing.com/sitemap.xml`. Optionally do the same in Bing Webmaster Tools.
- [ ] List the property on **USC-area off-campus housing listing services** and major rental portals (Zillow, Apartments.com, etc.), linking back to the site and using the same name, address and prices.

## Decisions made (where the brief left room)

Following the brief's rule: when ambiguous, choose the more accessible, more privacy-protective, simpler-to-maintain option.

- **Hero layout.** The only exterior photo is 970px wide, so a full-bleed desktop hero would look soft. Phones get a full-bleed photo with the headline over a gradient. Desktop gets an editorial split: type on plaster, photo at near-native size. Higher-resolution originals would allow a true full-bleed desktop hero.
- **No video.** The only video is a Google Earth flyover with Google watermarks (not republishable) that also shows the USC campus. See `docs/MEDIA_INVENTORY.md`.
- **Floor plans excluded.** They carry Tripalink branding and list different square footages from the owner's.
- **No analytics** in Phase 1 (most privacy-protective, so no cookie banner). Add a cookieless option such as Vercel Analytics or Plausible later and update the Privacy Policy first.
- **Google Maps behind a click-to-load facade.** No third-party requests until the visitor opts in.
- **Security deposit** has its own field. `oneTimeCharges` holds other one-time charges (application fee, once confirmed) so the deposit has a single source of truth.
- **Walk times** are shown as owner-to-verify estimates with an "approximate" disclaimer. They are flagged as launch-blocking in `PLACEHOLDERS.md`.
- **Select option names.** Apartment options in the form carry spoken `aria-label`s ("Apartment 1158 and a quarter"). Elsewhere, unit names use a visually hidden span, which screen readers support more reliably than `aria-label`.
- **CSP without nonces.** Every page is statically prerendered, and nonces would force request-time rendering. There are no third-party scripts. Zod runs in `jitless` mode so the CSP needs no `unsafe-eval`.
- **Load-time headline reveals are CSS, scroll reveals are GSAP.** Above-the-fold titles animate from first paint (no JavaScript dependency, no flicker, LCP not held hostage to hydration); below-the-fold headings use SplitText line masks. Anything already on screen when JavaScript arrives is left alone.
- **Header hides on scroll down** (as requested), so on desktop a floating Inquire pill appears while it is tucked away, keeping the main action on screen. Phones keep the sticky bottom Inquire bar.
- **Native cursor stays over form fields, the map and inside dialogs**; the custom cursor only replaces it elsewhere on fine pointers.
- **Legal pages** describe the site as it will work once Phase 2 is live (the launch state). WCAG target is 2.2 AA as the brief requires; note the services agreement references 2.1 AA.

## Known limitations at handoff

- **Lighthouse performance (local).** Measured on this machine (2017 Intel i5, benchmark index ≈1300) with Lighthouse's standard 4× CPU slowdown and motion on (as real visitors see it), mobile performance after the design/motion pass scored 93 on Contact, 84 on Gallery, 79–82 on Residences and 65–81 on Home across repeated runs. Run-to-run variance on this machine is about ±15 points. Accessibility, Best Practices and SEO were 100 on every page, and CLS was 0. Re-measure with PageSpeed Insights after deploying.
- **Playwright is pinned to 1.48.2** because newer releases no longer ship browsers for macOS 13. `npm audit` therefore reports a high-severity advisory (GHSA-7mvr-c777-76hp: browser downloads don't verify SSL certificates). It affects **dev tooling only** and nothing shipped to the site. On macOS 14+ or in CI, remove the pin and the `overrides` block in `package.json` to clear it. `npm audit --omit=dev --omit=optional --omit=peer` reports 0 vulnerabilities. The 3 entries plain `npm audit` lists are this same Playwright advisory, reached through Next's optional test-runner peer.
- **Visual check in real Safari/Firefox** was done through Playwright's WebKit and Firefox engines. A final manual pass on real devices is on the launch checklist.
