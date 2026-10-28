-- ============================================================================
-- 37th Street Housing: ROLLBACK
-- Removes ONLY what supabase/migrations/20261027000001_housing_schema.sql created:
--   * the "housing" schema and everything inside it
--   * the four storage policies named "housing-media: …"
--   * the "housing-media" bucket (only if it's empty; delete its files first
--     in Storage → housing-media if needed)
-- Nothing in "public" or any other schema is touched.
-- WARNING: this permanently deletes this site's content and inquiries.
-- ============================================================================

begin;

do $$
begin
  if exists (select 1 from storage.objects where bucket_id = 'housing-media') then
    raise exception 'Bucket "housing-media" still has files. Empty it in the dashboard first. Nothing was changed.';
  end if;
end
$$;

drop policy if exists "housing-media: public read"  on storage.objects;
drop policy if exists "housing-media: admin upload" on storage.objects;
drop policy if exists "housing-media: admin update" on storage.objects;
drop policy if exists "housing-media: admin delete" on storage.objects;
delete from storage.buckets where id = 'housing-media';

drop schema if exists housing cascade;

commit;
