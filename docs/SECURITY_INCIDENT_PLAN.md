# If something goes wrong: security incident plan

A short checklist for the owner, written before anything happens. This is practical guidance, not legal advice. Confirm the notification rules with the property's California attorney.

## What the site holds

| Data | Where | Sensitivity |
|---|---|---|
| Inquiries: name, email, optional phone, apartment, move-in timing, group size, contact method, message, private notes | Supabase, `housing.inquiries` | Personal contact details. The form never asks for Social Security numbers, ID, financial or health information, but a visitor could type anything into the message field. |
| Owner/admin logins | Supabase Auth (passwords stored hashed by Supabase) | High: an admin login can read every inquiry. |
| Rate-limit counters | Supabase, `housing.rate_limits` | Low: one-way scrambled codes (hashes) of IP addresses and login emails, cleared within a day. |
| Photos and site text | Supabase storage and tables | Public anyway. |

Inquiries are deleted automatically after 24 months (when the owner opens `/admin`).

## Signs something is wrong

- An admin login you don't recognize, or a password-reset email you didn't request
- Rent, text or photos changed without you doing it
- Supabase or Netlify emails about unusual activity
- Inquirers telling you they got strange emails that seemed to come from you

## First hour: contain it

1. **Reset the owner password** (Supabase → Authentication → Users → the owner → send password recovery, or reset it from the login page). Do the same for any other admin.
2. **Remove unknown admins**: Supabase → SQL editor → `select * from housing.admins;`. Delete any row you don't recognize.
3. **Rotate the secret keys** if there's any chance they leaked:
   - Supabase → Project Settings → API Keys: create a new secret (service role) key and revoke the old one.
   - Update `SUPABASE_SERVICE_ROLE_KEY` in Netlify → Environment variables, then redeploy (Deploys → Trigger deploy).
   - Replace `RATE_LIMIT_SALT`, and the Resend and Turnstile secrets if they're set up, the same way.
   - Note that this Supabase project is shared with another website. A new secret key must also be updated wherever that site uses it.
4. **Don't delete evidence.** Before changing data, export the inquiries (`/admin/inquiries` → Download CSV) and save Supabase's logs (Logs → Auth, API).

## Within a few days: understand it

- **Which data was exposed, and for how long?** Supabase API and Auth logs show requests.
- **Whose data was it?** The CSV export lists the affected inquirers, with their email addresses for contacting them.
- **Write down a timeline**: when it started, when you noticed and what you did. Regulators and lawyers will ask for it.

## Notifying people

- **California** (Civil Code §1798.82) requires notice "in the most expedient time possible and without unreasonable delay" when certain personal information is exposed. That covers a name together with something like a Social Security, driver's license or financial account number, medical information, or an email address plus its password. If more than 500 California residents are notified, a sample of the notice also goes to the California Attorney General.
- **Names, emails and phone numbers alone** usually don't trigger California's legal requirement. Messages could contain anything, though, and inquirers may live in other states with different rules and fixed deadlines. **Call the attorney first.** They decide whether, whom and how quickly to notify.
- Even when notice isn't legally required, a short, honest email to affected inquirers is good practice.
- If an admin password was exposed, Supabase and Netlify support can help confirm what was accessed.

## Contacts (fill in)

| Who | Contact |
|---|---|
| Owner | [NAME / PHONE] |
| Developer | [NAME / EMAIL] |
| Attorney | [NAME / PHONE] |
| Supabase support | supabase.com/support |
| Netlify support | netlify.com/support |
