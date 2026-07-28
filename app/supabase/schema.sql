-- Run this once in the Supabase project's SQL Editor (Dashboard > SQL Editor > New query).
-- Safe to re-run: every statement is idempotent (create-if-not-exists / create-or-replace).

-- ============================================================
-- inferences: one row per completed diagnosis, owned by the user who ran it
-- ============================================================
create table if not exists public.inferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  file_name text,
  image_path text,
  diag text not null check (diag in ('tb', 'normal')),
  pct integer not null check (pct >= 0 and pct <= 100),
  agent_name text,
  created_at timestamptz not null default now()
);

alter table public.inferences enable row level security;

drop policy if exists "Users can view own inferences" on public.inferences;
create policy "Users can view own inferences"
  on public.inferences for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own inferences" on public.inferences;
create policy "Users can insert own inferences"
  on public.inferences for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- Storage bucket for the uploaded/analyzed images, one folder per user
-- (path convention: <user_id>/<filename>)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('inference-images', 'inference-images', false)
on conflict (id) do nothing;

drop policy if exists "Users can read own inference images" on storage.objects;
create policy "Users can read own inference images"
  on storage.objects for select
  using (bucket_id = 'inference-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can upload own inference images" on storage.objects;
create policy "Users can upload own inference images"
  on storage.objects for insert
  with check (bucket_id = 'inference-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- profiles: one row per signed-up user, auto-populated on signup.
-- Kept separate from auth.users because the client can't query that
-- table directly — this is the supported way to expose a display name.
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Authenticated users can view all profiles" on public.profiles;
create policy "Authenticated users can view all profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- get_user_directory(): what the "Usuários" tab reads.
-- SECURITY DEFINER so it can join auth.users (not directly queryable by
-- clients), but only ever returns the handful of columns listed below —
-- never passwords or other sensitive auth.users fields.
-- ============================================================
create or replace function public.get_user_directory()
returns table (
  id uuid,
  full_name text,
  email text,
  last_sign_in_at timestamptz,
  provider text,
  created_at timestamptz,
  inference_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.full_name,
    p.email,
    u.last_sign_in_at,
    u.raw_app_meta_data->>'provider' as provider,
    p.created_at,
    (select count(*) from public.inferences i where i.user_id = p.id)
  from public.profiles p
  join auth.users u on u.id = p.id
  order by u.last_sign_in_at desc nulls last;
$$;

grant execute on function public.get_user_directory() to authenticated;
