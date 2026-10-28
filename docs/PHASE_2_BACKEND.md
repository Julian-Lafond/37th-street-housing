# Backend (Supabase): how it works

**Status: built.** The site reads its content from Supabase and the contact form saves inquiries there.
Owner editing lives at `/admin`.

## Shared project, isolated data

This site shares a Supabase project with another website. Everything it owns is in the **`housing`
schema** and the **`housing-media` bucket**; nothing else in the project is touched. Setup, security
rules and rollback: [`supabase/README.md`](../supabase/README.md).

## How content flows

1. `src/lib/data/index.ts` loads all public content (apartments, photos, FAQs, site settings,
   homepage text) in one cached read, tagged `housing-content`. Public pages are still prerendered
   static HTML.
2. When an admin saves in `/admin`, the server action calls `updateTag("housing-content")`. The next
   visitor gets freshly rendered pages, so changes show within seconds.
3. Without `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` (CI, tests on another machine) the site falls back to
   the files in `src/content`.

Legal pages stay in the reviewed MDX files in `src/content/legal` and aren't editable in the admin.

## Admin (`/admin`)

| Page | What the owner can do |
|---|---|
| Overview | Counts of new inquiries, apartments, photos, unanswered FAQs |
| Inquiries | Read, set status (new/contacted/toured/closed), private notes, delete, download CSV |
| Apartments | Rent, deposit, required/optional fees, one-time charges, status, availability, details, text, SEO, show/hide |
| Photos | Upload (resized, metadata incl. GPS stripped), description, caption, assign to an apartment, cover, focus point, order, show/hide, delete |
| Homepage text | Every heading and paragraph, neighborhood travel times, "What's included" items |
| FAQs | Add, edit, show/hide (only with an answer), delete |
| Contact & settings | Phone, email, hours, tours, leasing banner, inquiry notification emails |

Access: Supabase Auth email + password, plus membership in `housing.admins`. Every server action
re-checks admin status, and RLS enforces it again in the database. Password reset emails land on
`/admin/auth/callback` → `/admin/reset`.

**Add another admin:** create the user in Supabase → Authentication → Users, then run
`insert into housing.admins (user_id, email) select id, email from auth.users where email = '…';`

## Inquiry pipeline (`src/lib/inquiry-action.ts`)

Validate with the shared Zod schema → honeypot → rate limit (5/hour per salted IP hash, via
`housing.hit_rate_limit`) → Turnstile (when `TURNSTILE_SECRET_KEY` is set) → insert with the service
role → owner notification + visitor auto-reply via Resend (when configured; failures never lose the
inquiry). Inquiries older than 24 months are purged when the owner opens `/admin`.

## Still to do before launch

- **Email:** create a Resend account, verify `37thstreethousing.com` (needs the domain), set
  `RESEND_API_KEY`, `INQUIRY_FROM_EMAIL` and the notification address.
- **Turnstile:** create a free widget in Cloudflare, set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and
  `TURNSTILE_SECRET_KEY`. The form widget and CSP entries for `challenges.cloudflare.com` still need
  adding at that point; the server-side check is already in place.
- **Hosting:** set the same environment variables in the host's dashboard.
