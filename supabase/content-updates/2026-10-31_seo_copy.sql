-- ============================================================================
-- 37th Street Housing: search (SEO) copy update, 2026-10-31
--
-- Run once in Supabase → SQL editor. Safe to re-run.
--   * Apartment SEO title/description: cleared ONLY where they still hold the
--     original launch text, so the site builds them from each apartment's live
--     details (price incl. mandatory fees, availability). Anything the owner
--     has since written in /admin is left alone.
--   * Home page eyebrow: updated ONLY if it is still the original text.
-- Touches nothing outside the "housing" schema. Content refreshes on the next
-- admin save (or redeploy), because public pages are cached.
-- ============================================================================

begin;

update housing.units set seo_title = '' where slug = 'apt-1158' and seo_title = 'Furnished 5-Bedroom Apartment Near USC | Apt 1158';
update housing.units set seo_description = '' where slug = 'apt-1158' and seo_description = 'Apt 1158 at 37th Street Housing: 5 bedrooms with 5 private baths, 1,720 sq ft, fully furnished with in-unit laundry, about a 5-minute walk to USC. $8,750/month, available August 2027.';
update housing.units set seo_title = '' where slug = 'apt-1158-quarter' and seo_title = 'Furnished 3-Bedroom Apartment Near USC | Apt 1158 ¼';
update housing.units set seo_description = '' where slug = 'apt-1158-quarter' and seo_description = 'Apt 1158 ¼ at 37th Street Housing: 3 bedrooms with 3 private baths, 1,042 sq ft, fully furnished with in-unit laundry, steps from USC. $5,100/month, available August 2027.';
update housing.units set seo_title = '' where slug = 'apt-1158-half' and seo_title = 'Furnished 3-Bedroom Apartment Near USC | Apt 1158 ½';
update housing.units set seo_description = '' where slug = 'apt-1158-half' and seo_description = 'Apt 1158 ½ at 37th Street Housing: 3 bedrooms with 3 private baths, 1,045 sq ft, furnished with in-unit washer and dryer, near USC. $5,100/month, available August 2027.';
update housing.units set seo_title = '' where slug = 'apt-1158-three-quarter' and seo_title = 'Furnished 4-Bedroom Apartment Near USC | Apt 1158 ¾';
update housing.units set seo_description = '' where slug = 'apt-1158-three-quarter' and seo_description = 'Apt 1158 ¾ at 37th Street Housing: 4 bedrooms with 4 private baths, 1,411 sq ft, fully furnished with in-unit laundry, about 5 minutes from USC. $6,800/month, available August 2027.';
update housing.units set seo_title = '' where slug = 'apt-1160' and seo_title = 'Furnished 5-Bedroom Apartment Near USC | Apt 1160';
update housing.units set seo_description = '' where slug = 'apt-1160' and seo_description = 'Apt 1160 at 37th Street Housing: 5 bedrooms with 5 private baths, 1,809 sq ft, fully furnished with in-unit laundry, about a 5-minute walk to USC. $8,875/month, available August 2027.';

update housing.home_page
   set content = jsonb_set(content, '{hero,eyebrow}', to_jsonb('Furnished apartments near USC · University Park, Los Angeles'::text))
 where id = 1 and content #>> '{hero,eyebrow}' = 'University Park · Los Angeles';

commit;
