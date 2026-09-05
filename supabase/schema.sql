-- Would You Rather V1 vote store
-- Isolated table: no names, emails, profiles, or raw IP addresses.

create table if not exists public.wyr_votes (
  id bigint generated always as identity primary key,
  question_id text not null check (question_id ~ '^q[0-9]{3}$'),
  voter_token uuid not null,
  choice text not null check (choice in ('red', 'blue')),
  created_at timestamptz not null default now(),
  unique (question_id, voter_token)
);

alter table public.wyr_votes enable row level security;

-- The browser never talks to this table directly.
revoke all on table public.wyr_votes from anon, authenticated;
grant select, insert on table public.wyr_votes to service_role;

grant usage, select on sequence public.wyr_votes_id_seq to service_role;

create or replace function public.get_wyr_results(p_question_id text)
returns table(red_count bigint, blue_count bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select
    count(*) filter (where choice = 'red')::bigint as red_count,
    count(*) filter (where choice = 'blue')::bigint as blue_count
  from public.wyr_votes
  where question_id = p_question_id;
$$;

revoke all on function public.get_wyr_results(text) from public, anon, authenticated;
grant execute on function public.get_wyr_results(text) to service_role;
