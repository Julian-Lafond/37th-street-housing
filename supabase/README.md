# Supabase setup: 37th Street Housing (shared project)

This site shares a Supabase project with another website. Everything it owns lives in its own
**`housing` schema** and **`housing-media` storage bucket**. No table, bucket or policy belonging to
the other site is created, altered or dropped.

| File | What it does |
|---|---|
| `migrations/20261027000001_housing_schema.sql` | Creates the `housing` schema (9 tables, 4 functions, row-level security), the `housing-media` bucket and 4 storage policies scoped to that bucket. Stops without changing anything if either already exists. Runs as one transaction. |
| `rollback/housing_rollback.sql` | Removes exactly those objects. Refuses to run while the bucket still has files. |

Both were tested against a local Postgres with stand-ins for Supabase's `auth`/`storage` schemas
plus fake "other site" tables, a bucket and a policy. A checksum of the other site's data, tables,
buckets and policies was identical before the migration, after it, after a blocked second run, and
after the rollback.

## Run it (once)

1. Supabase dashboard → **SQL Editor** → New query → paste the whole migration file → **Run**.
   Expected result: "Success. No rows returned."
2. **Settings → API → Data API → Exposed schemas**: add `housing` (keep the existing entries).
3. **Authentication → URL Configuration → Redirect URLs**: add `http://localhost:3000/**` and
   `https://37thstreethousing.com/**` (keep the other site's entries).
4. Create Safa's login: **Authentication → Users → Add user** (email + password, or send an invite).
   Then in the SQL Editor:
   ```sql
   insert into housing.admins (user_id, email)
   select id, email from auth.users where email = 'SAFA_EMAIL_HERE';
   ```
   Only users listed in `housing.admins` can edit this site. Logging in alone is not enough,
   because logins are shared with the other site.

## Who can do what

| | Public visitors | Logged-in users from the other site | Admins (`housing.admins`) | Website server (service role) |
|---|---|---|---|---|
| Read published content | ✓ | ✓ | ✓ (and drafts) | ✓ |
| Edit content / upload photos | ✗ | ✗ | ✓ (`housing-media` only) | ✓ |
| Read inquiries | ✗ | ✗ | ✓ | ✓ |
| Create inquiries | ✗ | ✗ | ✗ | ✓ (after validation, spam check, rate limit) |
| Add admins | ✗ | ✗ | ✗ | SQL Editor only |

## Shared-project notes

- Auth email templates and the "Site URL" are project-wide. Password-reset emails for Safa will use
  the project's templates, so keep their wording generic.
- Free-tier quotas (500 MB database, 1 GB storage, 5 GB egress) are shared with the other site.
  This site's photos total about 2 MB.
