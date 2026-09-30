-- ============================================================
-- Official scoresheet (box score) — modelled on the DakStats
-- "Baseball - Softball Stats Sheet".
--
-- * player_match_stats gains the full batting, fielding and
--   participation columns. Existing rows default to 0, so current
--   leaderboards and the managers' quick stats form keep working.
-- * match_pitching_stats holds one line per pitcher per match.
-- * match_innings holds the line score (runs per half inning).
--
-- Pitching lines and the line score are written by admins only
-- (the official scorer); everyone can read them.
-- ============================================================

-- ---------- 1. Batting / fielding / participation ----------
alter table player_match_stats
  add column doubles                  smallint not null default 0 check (doubles >= 0),
  add column triples                  smallint not null default 0 check (triples >= 0),
  add column home_runs                smallint not null default 0 check (home_runs >= 0),
  add column sac_hits                 smallint not null default 0 check (sac_hits >= 0),
  add column sac_flies                smallint not null default 0 check (sac_flies >= 0),
  add column walks                    smallint not null default 0 check (walks >= 0),
  add column hit_by_pitch             smallint not null default 0 check (hit_by_pitch >= 0),
  add column reached_on_error         smallint not null default 0 check (reached_on_error >= 0),
  add column strikeouts_swinging      smallint not null default 0 check (strikeouts_swinging >= 0),
  add column strikeouts_looking       smallint not null default 0 check (strikeouts_looking >= 0),
  add column stolen_bases             smallint not null default 0 check (stolen_bases >= 0),
  add column caught_stealing          smallint not null default 0 check (caught_stealing >= 0),
  add column putouts                  smallint not null default 0 check (putouts >= 0),
  add column assists                  smallint not null default 0 check (assists >= 0),
  add column errors                   smallint not null default 0 check (errors >= 0),
  -- catcher only
  add column runners_caught_stealing  smallint not null default 0 check (runners_caught_stealing >= 0),
  add column stolen_bases_allowed     smallint not null default 0 check (stolen_bases_allowed >= 0),
  add column passed_balls             smallint not null default 0 check (passed_balls >= 0),
  -- participation
  add column started                  boolean  not null default false,
  add column batting_order            smallint null check (batting_order between 1 and 20),
  add column position_played          varchar(10) null,
  add constraint chk_stats_xbh_le_hits check (doubles + triples + home_runs <= hits);

-- ---------- 2. Pitching lines ----------
create type pitching_decision as enum ('win', 'loss', 'save');

create table match_pitching_stats (
  pitch_id             bigint generated always as identity primary key,
  match_id             bigint   not null references matches(match_id) on delete cascade,
  player_id            bigint   not null references players(player_id) on delete cascade,
  pitch_order          smallint not null default 1 check (pitch_order between 1 and 20),
  started              boolean  not null default false,
  outs                 smallint not null default 0 check (outs between 0 and 150),   -- TM PO; IP = outs / 3
  at_bats              smallint not null default 0 check (at_bats >= 0),
  hits                 smallint not null default 0 check (hits >= 0),
  earned_runs          smallint not null default 0 check (earned_runs >= 0),
  unearned_runs        smallint not null default 0 check (unearned_runs >= 0),
  walks                smallint not null default 0 check (walks >= 0),
  strikeouts_swinging  smallint not null default 0 check (strikeouts_swinging >= 0),
  strikeouts_looking   smallint not null default 0 check (strikeouts_looking >= 0),
  wild_pitches         smallint not null default 0 check (wild_pitches >= 0),
  balks                smallint not null default 0 check (balks >= 0),
  decision             pitching_decision null,
  created_at           timestamptz not null default now(),
  constraint uq_pitching_match_player unique (match_id, player_id),
  constraint chk_pitching_hits_le_ab check (hits <= at_bats)
);
create index idx_pitching_player on match_pitching_stats (player_id);

alter table match_pitching_stats enable row level security;
create policy pitching_select_public on match_pitching_stats for select using (true);
-- Separate write policies so SELECT is covered by one permissive policy only.
create policy pitching_admin_insert on match_pitching_stats for insert with check (private.is_admin());
create policy pitching_admin_update on match_pitching_stats for update using (private.is_admin()) with check (private.is_admin());
create policy pitching_admin_delete on match_pitching_stats for delete using (private.is_admin());

-- ---------- 3. Line score ----------
-- A null run value means the half inning was not played (the "X" in a line score).
create table match_innings (
  match_id   bigint   not null references matches(match_id) on delete cascade,
  inning     smallint not null check (inning between 1 and 30),
  away_runs  smallint null check (away_runs between 0 and 99),
  home_runs  smallint null check (home_runs between 0 and 99),
  primary key (match_id, inning)
);

alter table match_innings enable row level security;
create policy innings_select_public on match_innings for select using (true);
create policy innings_admin_insert on match_innings for insert with check (private.is_admin());
create policy innings_admin_update on match_innings for update using (private.is_admin()) with check (private.is_admin());
create policy innings_admin_delete on match_innings for delete using (private.is_admin());

-- ---------- 4. Scoresheet header ----------
-- Left on base per team, and the end time (start time is matches.match_date).
alter table matches
  add column away_lob  smallint    null check (away_lob between 0 and 99),
  add column home_lob  smallint    null check (home_lob between 0 and 99),
  add column ended_at  timestamptz null;
