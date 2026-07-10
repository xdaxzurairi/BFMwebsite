-- ============================================================
-- Performance advisor fixes:
-- 1) wrap auth.uid() in (select ...) so it's evaluated once per
--    query instead of once per row (auth_rls_initplan)
-- 2) replace "for all" admin-write policies with explicit
--    insert/update/delete policies so they stop duplicating the
--    public "select" policy on the same table (multiple_permissive_policies)
-- 3) add covering indexes for foreign keys the linter flagged as
--    unindexed
-- ============================================================

-- ---- 1) users: avoid per-row auth.uid() re-evaluation ----
drop policy users_select_own_or_admin on users;
drop policy users_update_own_or_admin on users;

create policy users_select_own_or_admin on users for select
  using (auth_user_id = (select auth.uid()) or private.is_admin());
create policy users_update_own_or_admin on users for update
  using (auth_user_id = (select auth.uid()) or private.is_admin())
  with check (auth_user_id = (select auth.uid()) or private.is_admin());

-- ---- 2) split "for all" write policies so SELECT isn't duplicated ----
drop policy clubs_admin_write on clubs;
create policy clubs_admin_insert on clubs for insert with check (private.is_admin());
create policy clubs_admin_update on clubs for update using (private.is_admin()) with check (private.is_admin());
create policy clubs_admin_delete on clubs for delete using (private.is_admin());

drop policy tournaments_admin_write on tournaments;
create policy tournaments_admin_insert on tournaments for insert with check (private.is_admin());
create policy tournaments_admin_update on tournaments for update using (private.is_admin()) with check (private.is_admin());
create policy tournaments_admin_delete on tournaments for delete using (private.is_admin());

drop policy matches_admin_write on matches;
create policy matches_admin_insert on matches for insert with check (private.is_admin());
create policy matches_admin_update on matches for update using (private.is_admin()) with check (private.is_admin());
create policy matches_admin_delete on matches for delete using (private.is_admin());

drop policy news_admin_write on news;
create policy news_admin_insert on news for insert with check (private.is_admin());
create policy news_admin_update on news for update using (private.is_admin()) with check (private.is_admin());
create policy news_admin_delete on news for delete using (private.is_admin());

drop policy players_write_own_club_or_admin on players;
create policy players_insert_own_club_or_admin on players for insert
  with check (club_id = private.my_club_id() or private.is_admin());
create policy players_update_own_club_or_admin on players for update
  using (club_id = private.my_club_id() or private.is_admin())
  with check (club_id = private.my_club_id() or private.is_admin());
create policy players_delete_own_club_or_admin on players for delete
  using (club_id = private.my_club_id() or private.is_admin());

drop policy officials_write_own_club_or_admin on officials;
create policy officials_insert_own_club_or_admin on officials for insert
  with check (club_id = private.my_club_id() or private.is_admin());
create policy officials_update_own_club_or_admin on officials for update
  using (club_id = private.my_club_id() or private.is_admin())
  with check (club_id = private.my_club_id() or private.is_admin());
create policy officials_delete_own_club_or_admin on officials for delete
  using (club_id = private.my_club_id() or private.is_admin());

drop policy stats_write_own_club_or_admin on player_match_stats;
create policy stats_insert_own_club_or_admin on player_match_stats for insert
  with check (exists (select 1 from players p where p.player_id = player_match_stats.player_id
              and (p.club_id = private.my_club_id() or private.is_admin())));
create policy stats_update_own_club_or_admin on player_match_stats for update
  using (exists (select 1 from players p where p.player_id = player_match_stats.player_id
         and (p.club_id = private.my_club_id() or private.is_admin())))
  with check (exists (select 1 from players p where p.player_id = player_match_stats.player_id
              and (p.club_id = private.my_club_id() or private.is_admin())));
create policy stats_delete_own_club_or_admin on player_match_stats for delete
  using (exists (select 1 from players p where p.player_id = player_match_stats.player_id
         and (p.club_id = private.my_club_id() or private.is_admin())));

drop policy payments_admin_write on payments;
create policy payments_admin_insert on payments for insert with check (private.is_admin());
create policy payments_admin_update on payments for update using (private.is_admin()) with check (private.is_admin());
create policy payments_admin_delete on payments for delete using (private.is_admin());

-- ---- 3) covering indexes for flagged foreign keys ----
create index idx_matches_home_team on matches (home_team_id);
create index idx_matches_away_team on matches (away_team_id);
create index idx_news_created_by on news (created_by);
create index idx_payments_club on payments (club_id);
create index idx_payments_tournament on payments (tournament_id);
create index idx_stats_match on player_match_stats (match_id);
create index idx_reg_club on registrations (club_id);
create index idx_reg_registered_by on registrations (registered_by);
create index idx_tournaments_created_by on tournaments (created_by);
