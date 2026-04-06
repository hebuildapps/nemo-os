create table if not exists public.alpha_waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  note text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists alpha_waitlist_email_unique on public.alpha_waitlist (lower(email));

create or replace function public.alpha_waitlist_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_alpha_waitlist_updated_at on public.alpha_waitlist;
create trigger trg_alpha_waitlist_updated_at
before update on public.alpha_waitlist
for each row
execute function public.alpha_waitlist_touch_updated_at();

alter table public.alpha_waitlist enable row level security;

drop policy if exists "alpha_waitlist_insert_anon" on public.alpha_waitlist;
create policy "alpha_waitlist_insert_anon"
on public.alpha_waitlist
for insert
to anon, authenticated
with check (true);

drop policy if exists "alpha_waitlist_select_authenticated" on public.alpha_waitlist;
create policy "alpha_waitlist_select_authenticated"
on public.alpha_waitlist
for select
to authenticated
using (true);
