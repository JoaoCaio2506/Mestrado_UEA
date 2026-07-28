# Supabase setup

1. Create a project at supabase.com (region: São Paulo).
2. Dashboard → SQL Editor → New query → paste the contents of `schema.sql` → Run.
3. Dashboard → Authentication → Providers → enable Email and Google.
4. Dashboard → Settings → API → copy the Project URL and anon public key
   into the app's `.env` as `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
5. Dashboard → Authentication → URL Configuration → set Site URL to the
   production domain (and add `http://localhost:5173` as a redirect URL
   for local dev).
