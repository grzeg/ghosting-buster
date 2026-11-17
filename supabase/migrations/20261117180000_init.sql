-- Ghosting Buster: initial schema (slice 1)
-- Tables: offers, applications, stage_events. RLS on every table: a user sees only their own rows.

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  url text not null,
  title text not null check (char_length(title) between 1 and 200),
  company text not null check (char_length(company) between 1 and 200),
  notes text check (notes is null or char_length(notes) <= 5000),
  created_at timestamptz not null default now()
);

create index offers_user_id_idx on public.offers (user_id);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  offer_id uuid not null unique references public.offers (id) on delete cascade,
  stage text not null default 'saved'
    check (stage in ('saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'ghosted')),
  applied_at timestamptz,
  -- User-set ghost deadline: after this date the application is flagged as quiet.
  follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index applications_user_id_idx on public.applications (user_id);
create index applications_follow_up_idx on public.applications (follow_up_at)
  where stage in ('applied', 'screening', 'interview');

create table public.stage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  application_id uuid not null references public.applications (id) on delete cascade,
  from_stage text,
  to_stage text not null,
  created_at timestamptz not null default now()
);

create index stage_events_application_idx on public.stage_events (application_id, created_at);

-- Keep updated_at fresh and log every stage change.
create function public.applications_track_changes() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.stage_events (user_id, application_id, from_stage, to_stage)
    values (new.user_id, new.id, null, new.stage);
    return new;
  end if;

  new.updated_at = now();
  if new.stage is distinct from old.stage then
    insert into public.stage_events (user_id, application_id, from_stage, to_stage)
    values (new.user_id, new.id, old.stage, new.stage);
  end if;
  return new;
end;
$$;

create trigger applications_insert_event
  after insert on public.applications
  for each row execute function public.applications_track_changes();

create trigger applications_update_track
  before update on public.applications
  for each row execute function public.applications_track_changes();

-- Row Level Security
alter table public.offers enable row level security;
alter table public.applications enable row level security;
alter table public.stage_events enable row level security;

create policy "offers: own rows" on public.offers
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "applications: own rows" on public.applications
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Events are normally written by the trigger above (which runs as the calling user, hence the
-- insert policy). Legal stage transitions are enforced in packages/core, not in the database.
create policy "stage_events: read own rows" on public.stage_events
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "stage_events: insert own rows" on public.stage_events
  for insert to authenticated
  with check (user_id = (select auth.uid()));
