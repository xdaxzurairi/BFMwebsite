-- ============================================================
-- Baseball Federation Malaysia (BFM) — Database Schema (Postgres/Supabase)
-- Ported from schema.sql (MySQL/MariaDB reference) per README's
-- "Porting the schema to Supabase/Postgres" section.
-- ============================================================

-- ------------------------------------------------------------
-- 0. Enum types
-- ------------------------------------------------------------
create type user_role as enum ('user','club_manager','admin','technical_admin');
create type club_category as enum ('club','school');
create type tournament_type as enum ('round_robin','single_elim','double_elim');
create type tournament_level as enum ('local','regional','national','international');
create type tournament_category as enum ('youth','adult','senior');
create type tournament_status as enum ('upcoming','ongoing','completed','cancelled');
create type registration_status as enum ('pending','approved','rejected','withdrawn');
create type payment_method as enum ('bank_transfer','fpx','cash','cheque');
create type payment_status as enum ('pending','completed','failed','refunded');
create type match_status as enum ('scheduled','live','completed','postponed','cancelled');
create type match_type as enum ('group','semifinal','final');

-- ------------------------------------------------------------
-- helper: keep updated_at current on every UPDATE
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 1. CLUBS / SCHOOLS
-- ============================================================
create table clubs (
  club_id       bigint generated always as identity primary key,
  club_name     varchar(150)  not null,
  state         varchar(50)   not null,
  club_category club_category not null default 'club',
  manager_name  varchar(120)  not null,
  phone         varchar(30)   null,
  email         varchar(150)  null,
  color         char(7)       null default '#1f6f43',
  logo_url      varchar(255)  null,
  is_active     boolean       not null default true,
  created_at    timestamptz   not null default now(),
  updated_at    timestamptz   not null default now()
);
create index idx_clubs_state on clubs (state);
create index idx_clubs_category on clubs (club_category);
create trigger trg_clubs_updated_at before update on clubs
  for each row execute function set_updated_at();

-- ============================================================
-- 2. USERS & ROLES
-- auth_user_id bridges to Supabase Auth (auth.users.id)
-- ============================================================
create table users (
  user_id        bigint generated always as identity primary key,
  auth_user_id   uuid          null unique references auth.users(id) on delete cascade,
  full_name      varchar(150)  not null,
  email          varchar(150)  not null unique,
  password_hash  varchar(255)  null,     -- unused when auth is handled by Supabase Auth
  role           user_role     not null default 'user',
  club_id        bigint        null references clubs(club_id) on delete set null,
  phone          varchar(30)   null,
  is_active      boolean       not null default true,
  created_at     timestamptz   not null default now(),
  updated_at     timestamptz   not null default now()
);
create index idx_users_club on users (club_id);
create trigger trg_users_updated_at before update on users
  for each row execute function set_updated_at();

-- ============================================================
-- 3. OFFICIALS (club staff: managers, coaches, physios, …)
-- ============================================================
create table officials (
  official_id  bigint generated always as identity primary key,
  club_id      bigint        not null references clubs(club_id) on delete cascade,
  first_name   varchar(80)   not null,
  last_name    varchar(80)   not null,
  position     varchar(80)   not null,
  role         varchar(80)   null,
  phone        varchar(30)   null,
  email        varchar(150)  null,
  is_active    boolean       not null default true,
  created_at   timestamptz   not null default now(),
  updated_at   timestamptz   not null default now()
);
create index idx_officials_club on officials (club_id);
create trigger trg_officials_updated_at before update on officials
  for each row execute function set_updated_at();

-- ============================================================
-- 4. PLAYERS
-- ============================================================
create table players (
  player_id          bigint generated always as identity primary key,
  club_id            bigint        not null references clubs(club_id) on delete cascade,
  jersey_number      smallint      not null check (jersey_number >= 0),
  first_name         varchar(80)   not null,
  last_name          varchar(80)   not null,
  date_of_birth      date          null,
  position           varchar(40)   not null,
  email              varchar(150)  null,
  phone              varchar(30)   null,
  medical_clearance  boolean       not null default false,
  is_active          boolean       not null default true,
  created_at         timestamptz   not null default now(),
  updated_at         timestamptz   not null default now(),
  unique (club_id, jersey_number)
);
create index idx_players_club on players (club_id);
create trigger trg_players_updated_at before update on players
  for each row execute function set_updated_at();

-- ============================================================
-- 5. TOURNAMENTS
-- ============================================================
create table tournaments (
  tournament_id       bigint generated always as identity primary key,
  tournament_name     varchar(180)  not null,
  description         text          null,
  tournament_type     tournament_type     not null default 'round_robin',
  tournament_level    tournament_level    not null default 'local',
  tournament_category tournament_category not null default 'adult',
  currency            char(3)       not null default 'MYR',
  start_date          date          not null,
  end_date            date          not null,
  registration_start  date          null,
  registration_end    date          null,
  max_teams           smallint      not null default 8 check (max_teams >= 0),
  entry_fee           numeric(10,2) not null default 0.00,
  prize_pool          numeric(10,2) not null default 0.00,
  location            varchar(200)  null,
  status              tournament_status not null default 'upcoming',
  created_by          bigint        null references users(user_id) on delete set null,
  created_at          timestamptz   not null default now(),
  updated_at          timestamptz   not null default now()
);
create index idx_tournaments_status on tournaments (status);
create index idx_tournaments_dates on tournaments (start_date, end_date);
create trigger trg_tournaments_updated_at before update on tournaments
  for each row execute function set_updated_at();

-- ============================================================
-- 6. REGISTRATIONS (club <-> tournament, priority CRUD flow)
-- ============================================================
create table registrations (
  registration_id   bigint generated always as identity primary key,
  tournament_id     bigint        not null references tournaments(tournament_id) on delete cascade,
  club_id           bigint        not null references clubs(club_id) on delete cascade,
  registration_date timestamptz   not null default now(),
  status            registration_status not null default 'pending',
  notes             text          null,
  registered_by     bigint        null references users(user_id) on delete set null,
  created_at        timestamptz   not null default now(),
  updated_at        timestamptz   not null default now(),
  unique (tournament_id, club_id)
);
create index idx_reg_status on registrations (status);
create trigger trg_registrations_updated_at before update on registrations
  for each row execute function set_updated_at();

-- ============================================================
-- 7. PAYMENTS (tournament entry fees)
-- ============================================================
create table payments (
  payment_id        bigint generated always as identity primary key,
  tournament_id     bigint        not null references tournaments(tournament_id) on delete cascade,
  club_id           bigint        not null references clubs(club_id) on delete cascade,
  payment_amount    numeric(10,2) not null,
  payment_method    payment_method not null default 'bank_transfer',
  payment_reference varchar(100)  null,
  payment_date      date          not null,
  payment_status    payment_status not null default 'completed',
  notes             text          null,
  created_at        timestamptz   not null default now(),
  updated_at        timestamptz   not null default now()
);
create index idx_pay_status on payments (payment_status);
create trigger trg_payments_updated_at before update on payments
  for each row execute function set_updated_at();

-- ============================================================
-- 8. MATCHES (schedule & results)
-- ============================================================
create table matches (
  match_id      bigint generated always as identity primary key,
  tournament_id bigint        not null references tournaments(tournament_id) on delete cascade,
  match_number  varchar(20)   not null,
  home_team_id  bigint        not null references clubs(club_id),
  away_team_id  bigint        not null references clubs(club_id),
  match_date    timestamptz   not null,
  venue         varchar(200)  null,
  home_score    smallint      null check (home_score is null or home_score >= 0),
  away_score    smallint      null check (away_score is null or away_score >= 0),
  status        match_status  not null default 'scheduled',
  match_type    match_type    not null default 'group',
  round_name    varchar(60)   null,
  created_at    timestamptz   not null default now(),
  updated_at    timestamptz   not null default now(),
  constraint chk_matches_diff_teams check (home_team_id <> away_team_id)
);
create index idx_matches_tournament on matches (tournament_id);
create index idx_matches_status on matches (status);
create index idx_matches_date on matches (match_date);
create trigger trg_matches_updated_at before update on matches
  for each row execute function set_updated_at();

-- ============================================================
-- 9. PLAYER MATCH STATS (per-game batting log -> rolled up into averages)
-- ============================================================
create table player_match_stats (
  stat_id     bigint generated always as identity primary key,
  player_id   bigint        not null references players(player_id) on delete cascade,
  match_id    bigint        null references matches(match_id) on delete set null,
  at_bats     smallint      not null default 0 check (at_bats >= 0),
  hits        smallint      not null default 0 check (hits >= 0),
  runs        smallint      not null default 0 check (runs >= 0),
  rbi         smallint      not null default 0 check (rbi >= 0),
  created_at  timestamptz   not null default now(),
  constraint chk_stats_hits_le_ab check (hits <= at_bats)
);
create index idx_stats_player on player_match_stats (player_id);

-- ============================================================
-- 10. NEWS / ANNOUNCEMENTS (bilingual: BM + EN)
-- ============================================================
create table news (
  news_id        bigint generated always as identity primary key,
  title_bm       varchar(200)  not null,
  title_en       varchar(200)  not null,
  category_bm    varchar(60)   not null default 'Pengumuman',
  category_en    varchar(60)   not null default 'Announcement',
  body_bm        text          not null,
  body_en        text          not null,
  cover_image    varchar(255)  null,
  published_date date          not null,
  created_by     bigint        null references users(user_id) on delete set null,
  created_at     timestamptz   not null default now(),
  updated_at     timestamptz   not null default now()
);
create index idx_news_date on news (published_date);
create trigger trg_news_updated_at before update on news
  for each row execute function set_updated_at();

-- ============================================================
-- 11. VIEW: league standings (derived from completed matches)
-- ============================================================
create view v_standings
with (security_invoker = true) as
select
  t.tournament_id,
  c.club_id,
  c.club_name,
  count(*)                                                          as mp,
  sum(case when winner = c.club_id then 1 else 0 end)               as w,
  sum(case when loser  = c.club_id then 1 else 0 end)               as l,
  sum(case when winner is null then 1 else 0 end)                   as d,
  sum(rf)              as runs_for,
  sum(ra)              as runs_against,
  sum(rf) - sum(ra)    as run_diff,
  sum(pts)             as points
from (
  select m.tournament_id, m.home_team_id as club_id,
         m.home_score as rf, m.away_score as ra,
         case when m.home_score > m.away_score then m.home_team_id
              when m.home_score < m.away_score then m.away_team_id end as winner,
         case when m.home_score < m.away_score then m.home_team_id
              when m.home_score > m.away_score then m.away_team_id end as loser,
         case when m.home_score = m.away_score then 1
              when m.home_score > m.away_score then 3 else 0 end as pts
  from matches m where m.status = 'completed'
  union all
  select m.tournament_id, m.away_team_id as club_id,
         m.away_score as rf, m.home_score as ra,
         case when m.home_score > m.away_score then m.home_team_id
              when m.home_score < m.away_score then m.away_team_id end as winner,
         case when m.home_score < m.away_score then m.home_team_id
              when m.home_score > m.away_score then m.away_team_id end as loser,
         case when m.home_score = m.away_score then 1
              when m.away_score > m.home_score then 3 else 0 end as pts
  from matches m where m.status = 'completed'
) rows_
join tournaments t on t.tournament_id = rows_.tournament_id
join clubs c on c.club_id = rows_.club_id
group by t.tournament_id, c.club_id, c.club_name;

-- ============================================================
-- 12. VIEW: player career batting stats (rolled up)
-- ============================================================
create view v_player_stats
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
left join player_match_stats s on s.player_id = p.player_id
where p.is_active = true
group by p.player_id, p.club_id, p.first_name, p.last_name, p.jersey_number, p.position;

-- ============================================================
-- 13. Supabase Auth bridge: auto-create a `users` row on signup
-- ============================================================
create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into users (auth_user_id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    'user'
  )
  on conflict (email) do update set auth_user_id = excluded.auth_user_id;
  return new;
end;
$$;

create trigger trg_handle_new_auth_user
  after insert on auth.users
  for each row execute function handle_new_auth_user();

-- ============================================================
-- 14. RLS helper functions
-- ============================================================
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from users u
    where u.auth_user_id = auth.uid()
      and u.role in ('admin', 'technical_admin')
  );
$$;

create or replace function my_club_id()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select u.club_id from users u
  where u.auth_user_id = auth.uid()
    and u.role = 'club_manager'
  limit 1;
$$;

-- ============================================================
-- 15. Row Level Security
-- ============================================================
alter table clubs enable row level security;
alter table users enable row level security;
alter table officials enable row level security;
alter table players enable row level security;
alter table tournaments enable row level security;
alter table registrations enable row level security;
alter table payments enable row level security;
alter table matches enable row level security;
alter table player_match_stats enable row level security;
alter table news enable row level security;

-- clubs: public read, admin write
create policy clubs_select_public on clubs for select using (true);
create policy clubs_admin_write on clubs for all using (is_admin()) with check (is_admin());

-- tournaments: public read, admin write
create policy tournaments_select_public on tournaments for select using (true);
create policy tournaments_admin_write on tournaments for all using (is_admin()) with check (is_admin());

-- matches: public read, admin write
create policy matches_select_public on matches for select using (true);
create policy matches_admin_write on matches for all using (is_admin()) with check (is_admin());

-- news: public read, admin write
create policy news_select_public on news for select using (true);
create policy news_admin_write on news for all using (is_admin()) with check (is_admin());

-- players: public read; owning club manager or admin write
create policy players_select_public on players for select using (true);
create policy players_write_own_club_or_admin on players for all
  using (club_id = my_club_id() or is_admin())
  with check (club_id = my_club_id() or is_admin());

-- officials: public read; owning club manager or admin write
create policy officials_select_public on officials for select using (true);
create policy officials_write_own_club_or_admin on officials for all
  using (club_id = my_club_id() or is_admin())
  with check (club_id = my_club_id() or is_admin());

-- player_match_stats: public read (needed for leaderboards); owning club manager or admin write
create policy stats_select_public on player_match_stats for select using (true);
create policy stats_write_own_club_or_admin on player_match_stats for all
  using (
    exists (select 1 from players p where p.player_id = player_match_stats.player_id
            and (p.club_id = my_club_id() or is_admin()))
  )
  with check (
    exists (select 1 from players p where p.player_id = player_match_stats.player_id
            and (p.club_id = my_club_id() or is_admin()))
  );

-- registrations: club manager sees/creates own club's rows; admin sees/manages all.
-- Managers may self-service a withdrawal (status -> 'withdrawn'); approve/reject is admin-only.
create policy registrations_select on registrations for select
  using (club_id = my_club_id() or is_admin());
create policy registrations_insert on registrations for insert
  with check (club_id = my_club_id());
create policy registrations_update on registrations for update
  using (club_id = my_club_id() or is_admin())
  with check (is_admin() or (club_id = my_club_id() and status = 'withdrawn'));
create policy registrations_delete_admin on registrations for delete
  using (is_admin());

-- payments: owning club or admin can read; admin-only write
create policy payments_select on payments for select
  using (club_id = my_club_id() or is_admin());
create policy payments_admin_write on payments for all
  using (is_admin()) with check (is_admin());

-- users: see/update own row or admin; admin manages create/delete
create policy users_select_own_or_admin on users for select
  using (auth_user_id = auth.uid() or is_admin());
create policy users_update_own_or_admin on users for update
  using (auth_user_id = auth.uid() or is_admin())
  with check (auth_user_id = auth.uid() or is_admin());
create policy users_insert_admin on users for insert
  with check (is_admin());
create policy users_delete_admin on users for delete
  using (is_admin());
