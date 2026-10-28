-- ============================================================================
-- 37th Street Housing: backend schema (shared Supabase project)
--
-- SAFETY
--   * Everything is created inside a NEW schema, "housing". Nothing in "public"
--     or any other existing schema is created, altered or dropped.
--   * The script STOPS (and changes nothing) if a "housing" schema or a
--     "housing-media" storage bucket already exists.
--   * The only objects outside "housing" are: one storage bucket
--     ("housing-media") and four storage policies that apply ONLY to that
--     bucket (every policy checks bucket_id = 'housing-media'). Other buckets
--     and their policies are unaffected.
--   * Runs in a single transaction: any error rolls everything back.
--   * To undo: supabase/rollback/housing_rollback.sql
--
-- AFTER RUNNING (dashboard settings, no SQL):
--   1. Settings → API → Data API → "Exposed schemas": add  housing
--   2. Authentication → URL Configuration → Redirect URLs: add
--        http://localhost:3000/**  and  https://37thstreethousing.com/**
-- ============================================================================

begin;

-- ── Guards ──────────────────────────────────────────────────────────────────
do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'housing') then
    raise exception 'Schema "housing" already exists. Nothing was changed.';
  end if;
  if exists (select 1 from storage.buckets where id = 'housing-media') then
    raise exception 'Storage bucket "housing-media" already exists. Nothing was changed.';
  end if;
end
$$;

create schema housing;
comment on schema housing is '37th Street Housing website (37thstreethousing.com). Isolated from other sites in this project.';

grant usage on schema housing to anon, authenticated, service_role;

-- ── Helpers ─────────────────────────────────────────────────────────────────

-- Admins: the ONLY users allowed to edit this site. Auth users are shared with
-- the other site in this project, so "logged in" is never enough on its own.
create table housing.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

create function housing.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from housing.admins where user_id = auth.uid());
$$;
revoke all on function housing.is_admin() from public;
grant execute on function housing.is_admin() to anon, authenticated, service_role;

create function housing.touch_updated()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

-- ── Content ─────────────────────────────────────────────────────────────────

-- Single-row globals (SiteSettings, HomePage). Content is JSON shaped exactly
-- like src/content/types.ts so the site's components don't change.
create table housing.site_settings (
  id         smallint primary key default 1 check (id = 1),
  content    jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table housing.home_page (
  id         smallint primary key default 1 check (id = 1),
  content    jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table housing.units (
  slug                    text primary key check (slug ~ '^[a-z0-9-]+$'),
  display_name            text not null,
  short_name              text not null,
  accessible_name         text not null,
  sort_order              integer not null default 0,
  bedrooms                integer not null check (bedrooms between 1 and 12),
  bathrooms               integer not null check (bathrooms between 1 and 12),
  square_feet             integer not null check (square_feet > 0),
  pricing_mode            text not null default 'whole_unit'
                            check (pricing_mode in ('whole_unit', 'per_bedroom', 'on_request')),
  monthly_rent            integer not null check (monthly_rent >= 0),
  security_deposit        integer not null check (security_deposit >= 0),
  mandatory_fees          jsonb not null default '[]'::jsonb check (jsonb_typeof(mandatory_fees) = 'array'),
  optional_fees           jsonb not null default '[]'::jsonb check (jsonb_typeof(optional_fees) = 'array'),
  one_time_charges        jsonb not null default '[]'::jsonb check (jsonb_typeof(one_time_charges) = 'array'),
  show_per_bedroom_helper boolean not null default true,
  status                  text not null default 'available'
                            check (status in ('available', 'limited', 'waitlist', 'leased')),
  available_from          date not null,
  lease_term_months       integer not null default 12 check (lease_term_months between 1 and 60),
  furnished               boolean not null default true,
  in_unit_laundry         boolean not null default true,
  summary                 text not null,
  description             text not null,
  features                text[] not null default '{}',
  seo_title               text not null,
  seo_description         text not null,
  published               boolean not null default true,
  updated_at              timestamptz not null default now(),
  updated_by              uuid
);

create table housing.media (
  id             text primary key check (id ~ '^[a-z0-9-]+$'),
  kind           text not null default 'image' check (kind in ('image', 'video')),
  -- Path inside the housing-media bucket, or a /media/... path for the original photos.
  src            text not null,
  alt            text not null check (length(trim(alt)) >= 10),
  caption        text,
  category       text not null check (category in ('exterior', 'interior')),
  room           text not null
                   check (room in ('living', 'kitchen', 'hallway', 'bedroom', 'bathroom', 'laundry', 'exterior')),
  -- NULL = shared building gallery. Set only when the owner confirms which apartment a photo shows.
  assigned_unit  text references housing.units (slug) on update cascade on delete set null,
  is_cover       boolean not null default false,
  focal_x        smallint not null default 50 check (focal_x between 0 and 100),
  focal_y        smallint not null default 50 check (focal_y between 0 and 100),
  sort_order     integer not null default 0,
  width          integer not null check (width > 0),
  height         integer not null check (height > 0),
  blur_data_url  text not null,
  poster         text,
  captions_src   text,
  published      boolean not null default true,
  updated_at     timestamptz not null default now(),
  updated_by     uuid
);
create index media_assigned_unit_idx on housing.media (assigned_unit);

create table housing.faqs (
  id         text primary key check (id ~ '^[a-z0-9-]+$'),
  question   text not null,
  answer     text not null default '',
  sort_order integer not null default 0,
  published  boolean not null default false,
  -- An FAQ can't be published without an answer.
  check (not published or length(trim(answer)) > 0),
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table housing.legal_pages (
  slug        text primary key check (slug in ('privacy', 'terms', 'accessibility', 'fair-housing')),
  title       text not null,
  description text not null,
  body_md     text not null,
  effective   date not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid
);

create trigger site_settings_touch before update on housing.site_settings for each row execute function housing.touch_updated();
create trigger home_page_touch     before update on housing.home_page     for each row execute function housing.touch_updated();
create trigger units_touch         before update on housing.units         for each row execute function housing.touch_updated();
create trigger media_touch         before update on housing.media         for each row execute function housing.touch_updated();
create trigger faqs_touch          before update on housing.faqs          for each row execute function housing.touch_updated();
create trigger legal_pages_touch   before update on housing.legal_pages   for each row execute function housing.touch_updated();

-- ── Inquiries (personal data) ───────────────────────────────────────────────
-- Inserted ONLY by the website's server (service role, after validation, spam
-- check and rate limit). Never readable by the public. Fair Housing: never add
-- columns for protected characteristics.
create table housing.inquiries (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  full_name       text not null check (length(full_name) between 1 and 120),
  email           text not null check (length(email) between 3 and 254),
  phone           text check (phone is null or length(phone) <= 30),
  unit_slug       text not null,               -- a unit slug, or 'any'
  move_in         text check (move_in in ('august-2027', 'other')),
  move_in_other   text check (move_in_other is null or length(move_in_other) <= 80),
  group_size      smallint check (group_size between 1 and 5),
  contact_method  text not null check (contact_method in ('email', 'phone', 'text')),
  message         text check (message is null or length(message) <= 2000),
  consent         boolean not null check (consent),
  sms_consent     boolean not null default false,
  status          text not null default 'new' check (status in ('new', 'contacted', 'toured', 'closed')),
  notes           text,
  updated_at      timestamptz not null default now(),
  updated_by      uuid
);
create index inquiries_created_at_idx on housing.inquiries (created_at desc);
create trigger inquiries_touch before update on housing.inquiries for each row execute function housing.touch_updated();

-- Deletes inquiries older than the retention period (default 24 months).
-- Called by the website on a schedule; returns the number deleted.
create function housing.purge_old_inquiries(retention_months integer default 24)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted integer;
begin
  delete from housing.inquiries where created_at < now() - make_interval(months => retention_months);
  get diagnostics deleted = row_count;
  return deleted;
end;
$$;
revoke all on function housing.purge_old_inquiries(integer) from public, anon, authenticated;
grant execute on function housing.purge_old_inquiries(integer) to service_role;

-- ── Rate limiting for the inquiry form ──────────────────────────────────────
-- Keys are salted hashes (never raw IP addresses). Service role only.
create table housing.rate_limits (
  key          text primary key,
  window_start timestamptz not null default now(),
  hits         integer not null default 0
);

-- Returns true if the request is allowed, false if the limit is exceeded.
create function housing.hit_rate_limit(limit_key text, max_hits integer, window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_hits integer;
begin
  insert into housing.rate_limits as r (key, window_start, hits)
  values (limit_key, now(), 1)
  on conflict (key) do update
    set hits         = case when r.window_start < now() - make_interval(secs => window_seconds) then 1 else r.hits + 1 end,
        window_start = case when r.window_start < now() - make_interval(secs => window_seconds) then now() else r.window_start end
  returning hits into current_hits;
  -- Opportunistic cleanup of stale keys.
  delete from housing.rate_limits where window_start < now() - interval '1 day';
  return current_hits <= max_hits;
end;
$$;
revoke all on function housing.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function housing.hit_rate_limit(text, integer, integer) to service_role;

-- ── Row-level security ──────────────────────────────────────────────────────
alter table housing.admins        enable row level security;
alter table housing.site_settings enable row level security;
alter table housing.home_page     enable row level security;
alter table housing.units         enable row level security;
alter table housing.media         enable row level security;
alter table housing.faqs          enable row level security;
alter table housing.legal_pages   enable row level security;
alter table housing.inquiries     enable row level security;
alter table housing.rate_limits   enable row level security;

-- Admins can see the admin list; nobody can change it through the API
-- (admins are added with SQL by the project owner).
create policy "admins: admins can read" on housing.admins
  for select to authenticated using ((select housing.is_admin()));

-- Public site content: anyone may read published rows; only admins may write.
create policy "site_settings: public read" on housing.site_settings for select to anon, authenticated using (true);
create policy "site_settings: admin update" on housing.site_settings for update to authenticated
  using ((select housing.is_admin())) with check ((select housing.is_admin()));

create policy "home_page: public read" on housing.home_page for select to anon, authenticated using (true);
create policy "home_page: admin update" on housing.home_page for update to authenticated
  using ((select housing.is_admin())) with check ((select housing.is_admin()));

create policy "legal_pages: public read" on housing.legal_pages for select to anon, authenticated using (true);
create policy "legal_pages: admin update" on housing.legal_pages for update to authenticated
  using ((select housing.is_admin())) with check ((select housing.is_admin()));

create policy "units: public read published" on housing.units for select to anon, authenticated
  using (published or (select housing.is_admin()));
create policy "units: admin write" on housing.units for all to authenticated
  using ((select housing.is_admin())) with check ((select housing.is_admin()));

create policy "media: public read published" on housing.media for select to anon, authenticated
  using (published or (select housing.is_admin()));
create policy "media: admin write" on housing.media for all to authenticated
  using ((select housing.is_admin())) with check ((select housing.is_admin()));

create policy "faqs: public read published" on housing.faqs for select to anon, authenticated
  using (published or (select housing.is_admin()));
create policy "faqs: admin write" on housing.faqs for all to authenticated
  using ((select housing.is_admin())) with check ((select housing.is_admin()));

-- Inquiries: admins read, update status/notes and delete. No public access at all;
-- inserts come only from the server with the service role (which bypasses RLS).
create policy "inquiries: admin read" on housing.inquiries for select to authenticated
  using ((select housing.is_admin()));
create policy "inquiries: admin update" on housing.inquiries for update to authenticated
  using ((select housing.is_admin())) with check ((select housing.is_admin()));
create policy "inquiries: admin delete" on housing.inquiries for delete to authenticated
  using ((select housing.is_admin()));

-- rate_limits: RLS on with no policies = service role only.

-- ── Table privileges (RLS still applies on top of these) ───────────────────
grant select on housing.site_settings, housing.home_page, housing.legal_pages,
                housing.units, housing.media, housing.faqs
  to anon, authenticated;
grant update on housing.site_settings, housing.home_page, housing.legal_pages to authenticated;
grant insert, update, delete on housing.units, housing.media, housing.faqs to authenticated;
grant select on housing.admins to authenticated;
grant select, update, delete on housing.inquiries to authenticated;
grant all on all tables in schema housing to service_role;

-- ── Storage: one bucket for this site's photos ─────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('housing-media', 'housing-media', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

-- Every policy below is limited to bucket_id = 'housing-media'.
create policy "housing-media: public read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'housing-media');
create policy "housing-media: admin upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'housing-media' and (select housing.is_admin()));
create policy "housing-media: admin update" on storage.objects for update to authenticated
  using (bucket_id = 'housing-media' and (select housing.is_admin()))
  with check (bucket_id = 'housing-media' and (select housing.is_admin()));
create policy "housing-media: admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'housing-media' and (select housing.is_admin()));

commit;
