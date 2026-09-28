-- ============================================================
-- Opposing-club approval of player match stats.
--
-- Each (match, club) stat submission gets a review row. When a club
-- manager writes their players' stats, the row goes back to 'pending'
-- and the opposing club's manager must approve (or dispute) it before
-- those stats count on public leaderboards. Admin writes are trusted
-- and approved immediately. The trigger runs on every write to
-- player_match_stats, so the rule holds even for direct API calls
-- that skip the app's server actions.
-- ============================================================

create type stats_review_status as enum ('pending', 'approved', 'disputed');

create table match_stat_reviews (
  match_id      bigint              not null references matches(match_id) on delete cascade,
  club_id       bigint              not null references clubs(club_id) on delete cascade,
  status        stats_review_status not null default 'pending',
  submitted_by  bigint              null references users(user_id) on delete set null,
  submitted_at  timestamptz         not null default now(),
  reviewed_by   bigint              null references users(user_id) on delete set null,
  reviewed_at   timestamptz         null,
  review_note   text                null,
  primary key (match_id, club_id)
);
create index idx_stat_reviews_club on match_stat_reviews (club_id);
create index idx_stat_reviews_submitted_by on match_stat_reviews (submitted_by);
create index idx_stat_reviews_reviewed_by on match_stat_reviews (reviewed_by);

alter table match_stat_reviews enable row level security;
-- Public read: the Match Centre and leaderboards need to know what's approved.
create policy stat_reviews_select_public on match_stat_reviews for select using (true);
-- Direct writes are admin-only; managers go through the trigger and review_match_stats().
create policy stat_reviews_admin_insert on match_stat_reviews for insert with check (private.is_admin());
create policy stat_reviews_admin_update on match_stat_reviews for update using (private.is_admin()) with check (private.is_admin());
create policy stat_reviews_admin_delete on match_stat_reviews for delete using (private.is_admin());

create function private.my_user_id()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select u.user_id from users u where u.auth_user_id = auth.uid() limit 1;
$$;

-- Records that a club's stats for a match changed. Non-admin writers must be
-- entering stats for a live/completed match their club played; their
-- submission resets to 'pending'. Admins (and server-side SQL with no auth
-- user, e.g. the dashboard SQL editor) are trusted and approve directly.
create function private.mark_stats_changed(p_match_id bigint, p_player_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_club_id bigint;
  v_match matches%rowtype;
  v_trusted boolean := private.is_admin() or auth.uid() is null;
  v_me bigint := private.my_user_id();
begin
  if p_match_id is null then
    return;
  end if;

  select club_id into v_club_id from players where player_id = p_player_id;
  select * into v_match from matches where match_id = p_match_id;
  if v_club_id is null or v_match.match_id is null then
    return;
  end if;

  if not v_trusted then
    if v_club_id not in (v_match.home_team_id, v_match.away_team_id) then
      raise exception 'This player''s club did not play in match %.', p_match_id;
    end if;
    if v_match.status not in ('live', 'completed') then
      raise exception 'Stats can only be entered once the match is live or completed.';
    end if;
  end if;

  if not exists (select 1 from player_match_stats s join players p on p.player_id = s.player_id
                 where s.match_id = p_match_id and p.club_id = v_club_id) then
    -- Every stat line for this club was removed; nothing left to review.
    delete from match_stat_reviews where match_id = p_match_id and club_id = v_club_id;
    return;
  end if;

  insert into match_stat_reviews as r (match_id, club_id, status, submitted_by, submitted_at, reviewed_by, reviewed_at, review_note)
  values (
    p_match_id, v_club_id,
    case when v_trusted then 'approved'::stats_review_status else 'pending'::stats_review_status end,
    v_me, now(),
    case when v_trusted then v_me end,
    case when v_trusted then now() end,
    null
  )
  on conflict (match_id, club_id) do update set
    status = excluded.status,
    submitted_by = excluded.submitted_by,
    submitted_at = excluded.submitted_at,
    reviewed_by = excluded.reviewed_by,
    reviewed_at = excluded.reviewed_at,
    review_note = null;
end;
$$;

create function private.trg_stats_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    perform private.mark_stats_changed(old.match_id, old.player_id);
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    perform private.mark_stats_changed(new.match_id, new.player_id);
  end if;
  return null;
end;
$$;

-- AFTER trigger: row-level security on player_match_stats has already passed.
create trigger trg_player_match_stats_review
  after insert or update or delete on player_match_stats
  for each row execute function private.trg_stats_changed();

-- Approve or dispute another club's stats. Callable by the opposing club's
-- manager (only while pending or disputed) or by an admin (any time).
create function public.review_match_stats(p_match_id bigint, p_club_id bigint, p_approve boolean, p_note text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match matches%rowtype;
  v_review match_stat_reviews%rowtype;
  v_admin boolean := private.is_admin();
  v_my_club bigint := private.my_club_id();
begin
  if auth.uid() is null then
    raise exception 'Not authenticated.';
  end if;

  select * into v_match from matches where match_id = p_match_id;
  select * into v_review from match_stat_reviews where match_id = p_match_id and club_id = p_club_id;
  if v_match.match_id is null or v_review.match_id is null then
    raise exception 'No stats have been submitted for this club in this match.';
  end if;

  if not v_admin then
    if v_my_club is null
       or v_my_club not in (v_match.home_team_id, v_match.away_team_id)
       or v_my_club = p_club_id then
      raise exception 'Only the opposing club or an admin can review these stats.';
    end if;
    if v_review.status = 'approved' then
      raise exception 'These stats are already approved.';
    end if;
  end if;

  if not p_approve and coalesce(trim(p_note), '') = '' then
    raise exception 'Please say what is wrong with the stats.';
  end if;

  update match_stat_reviews set
    status = case when p_approve then 'approved'::stats_review_status else 'disputed'::stats_review_status end,
    reviewed_by = private.my_user_id(),
    reviewed_at = now(),
    review_note = case when p_approve then null else left(trim(p_note), 500) end
  where match_id = p_match_id and club_id = p_club_id;
end;
$$;

revoke all on function public.review_match_stats(bigint, bigint, boolean, text) from public, anon;
grant execute on function public.review_match_stats(bigint, bigint, boolean, text) to authenticated;

-- Stats recorded before this migration were entered under the old rules; keep them live.
insert into match_stat_reviews (match_id, club_id, status, reviewed_at)
select distinct s.match_id, p.club_id, 'approved'::stats_review_status, now()
from player_match_stats s
join players p on p.player_id = s.player_id
join matches m on m.match_id = s.match_id
on conflict do nothing;

-- Leaderboards and player pages only count approved stats (plus legacy lines with no match).
create or replace view v_player_stats
with (security_invoker = true) as
select
  p.player_id,
  p.club_id,
  p.first_name,
  p.last_name,
  p.jersey_number,
  p.position,
  count(s.stat_id)              as total_matches,
  coalesce(sum(s.at_bats), 0)   as total_at_bats,
  coalesce(sum(s.hits), 0)      as total_hits,
  coalesce(sum(s.runs), 0)      as total_runs,
  coalesce(sum(s.rbi), 0)       as total_rbi,
  case when coalesce(sum(s.at_bats), 0) > 0
       then round(sum(s.hits)::numeric / sum(s.at_bats), 3)
       else 0 end               as batting_average
from players p
left join player_match_stats s
  on s.player_id = p.player_id
 and (s.match_id is null or exists (
       select 1 from match_stat_reviews r
       where r.match_id = s.match_id and r.club_id = p.club_id and r.status = 'approved'))
where p.is_active = true
group by p.player_id, p.club_id, p.first_name, p.last_name, p.jersey_number, p.position;
