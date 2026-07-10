-- ============================================================
-- Baseball Federation Malaysia (BFM) — Database Schema
-- Engine: MySQL 8+ / MariaDB 10.4+
-- Charset: utf8mb4
-- Matches the data model used in the BFM prototype (app/data.js)
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS bfm_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bfm_db;

-- ============================================================
-- 1. USERS & ROLES
-- ============================================================
CREATE TABLE users (
  user_id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name       VARCHAR(150)  NOT NULL,
  email           VARCHAR(150)  NOT NULL UNIQUE,
  password_hash   VARCHAR(255)  NOT NULL,
  role            ENUM('user','club_manager','admin','technical_admin') NOT NULL DEFAULT 'user',
  club_id         INT UNSIGNED  NULL,               -- set when role = club_manager
  phone           VARCHAR(30)   NULL,
  is_active       TINYINT(1)    NOT NULL DEFAULT 1,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB CHARSET=utf8mb4;

-- ============================================================
-- 2. CLUBS / SCHOOLS
-- ============================================================
CREATE TABLE clubs (
  club_id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  club_name       VARCHAR(150)  NOT NULL,
  state           VARCHAR(50)   NOT NULL,
  club_category   ENUM('club','school') NOT NULL DEFAULT 'club',
  manager_name    VARCHAR(120)  NOT NULL,
  phone           VARCHAR(30)   NULL,
  email           VARCHAR(150)  NULL,
  color           CHAR(7)       NULL DEFAULT '#1f6f43',   -- hex brand color for UI
  logo_url        VARCHAR(255)  NULL,
  is_active       TINYINT(1)    NOT NULL DEFAULT 1,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_clubs_state (state),
  INDEX idx_clubs_category (club_category)
) ENGINE=InnoDB CHARSET=utf8mb4;

ALTER TABLE users
  ADD CONSTRAINT fk_users_club
  FOREIGN KEY (club_id) REFERENCES clubs(club_id) ON DELETE SET NULL;

-- ============================================================
-- 3. OFFICIALS (club staff: managers, coaches, physios, …)
-- ============================================================
CREATE TABLE officials (
  official_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  club_id         INT UNSIGNED  NOT NULL,
  first_name      VARCHAR(80)   NOT NULL,
  last_name       VARCHAR(80)   NOT NULL,
  position        VARCHAR(80)   NOT NULL,   -- e.g. Manager, Head Coach, Physio
  role            VARCHAR(80)   NULL,       -- e.g. Coaching, Medical
  phone           VARCHAR(30)   NULL,
  email           VARCHAR(150)  NULL,
  is_active       TINYINT(1)    NOT NULL DEFAULT 1,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_officials_club FOREIGN KEY (club_id) REFERENCES clubs(club_id) ON DELETE CASCADE,
  INDEX idx_officials_club (club_id)
) ENGINE=InnoDB CHARSET=utf8mb4;

-- ============================================================
-- 4. PLAYERS
-- ============================================================
CREATE TABLE players (
  player_id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  club_id             INT UNSIGNED  NOT NULL,
  jersey_number       TINYINT UNSIGNED NOT NULL,
  first_name          VARCHAR(80)   NOT NULL,
  last_name           VARCHAR(80)   NOT NULL,
  date_of_birth       DATE          NULL,
  position            VARCHAR(40)   NOT NULL,   -- Pitcher, Catcher, 1st Base, ...
  email               VARCHAR(150)  NULL,
  phone               VARCHAR(30)   NULL,
  medical_clearance   TINYINT(1)    NOT NULL DEFAULT 0,
  is_active           TINYINT(1)    NOT NULL DEFAULT 1,
  created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_players_club FOREIGN KEY (club_id) REFERENCES clubs(club_id) ON DELETE CASCADE,
  UNIQUE KEY uq_players_club_jersey (club_id, jersey_number),
  INDEX idx_players_club (club_id)
) ENGINE=InnoDB CHARSET=utf8mb4;

-- ============================================================
-- 5. TOURNAMENTS
-- ============================================================
CREATE TABLE tournaments (
  tournament_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tournament_name      VARCHAR(180)  NOT NULL,
  description          TEXT          NULL,
  tournament_type      ENUM('round_robin','single_elim','double_elim') NOT NULL DEFAULT 'round_robin',
  tournament_level      ENUM('local','regional','national','international') NOT NULL DEFAULT 'local',
  tournament_category   ENUM('youth','adult','senior') NOT NULL DEFAULT 'adult',
  currency             CHAR(3)       NOT NULL DEFAULT 'MYR',
  start_date           DATE          NOT NULL,
  end_date             DATE          NOT NULL,
  registration_start   DATE          NULL,
  registration_end     DATE          NULL,
  max_teams            SMALLINT UNSIGNED NOT NULL DEFAULT 8,
  entry_fee            DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  prize_pool           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  location             VARCHAR(200)  NULL,
  status               ENUM('upcoming','ongoing','completed','cancelled') NOT NULL DEFAULT 'upcoming',
  created_by           INT UNSIGNED  NULL,     -- users.user_id (admin who created it)
  created_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tournaments_creator FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_tournaments_status (status),
  INDEX idx_tournaments_dates (start_date, end_date)
) ENGINE=InnoDB CHARSET=utf8mb4;

-- ============================================================
-- 6. REGISTRATIONS (club <-> tournament, priority CRUD flow)
-- ============================================================
CREATE TABLE registrations (
  registration_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tournament_id     INT UNSIGNED  NOT NULL,
  club_id           INT UNSIGNED  NOT NULL,
  registration_date DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status            ENUM('pending','approved','rejected','withdrawn') NOT NULL DEFAULT 'pending',
  notes             TEXT          NULL,
  registered_by     INT UNSIGNED  NULL,     -- users.user_id (club manager)
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reg_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
  CONSTRAINT fk_reg_club       FOREIGN KEY (club_id)       REFERENCES clubs(club_id)             ON DELETE CASCADE,
  CONSTRAINT fk_reg_user       FOREIGN KEY (registered_by) REFERENCES users(user_id)             ON DELETE SET NULL,
  UNIQUE KEY uq_reg_tournament_club (tournament_id, club_id),
  INDEX idx_reg_status (status)
) ENGINE=InnoDB CHARSET=utf8mb4;

-- ============================================================
-- 7. PAYMENTS (tournament entry fees)
-- ============================================================
CREATE TABLE payments (
  payment_id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tournament_id       INT UNSIGNED  NOT NULL,
  club_id             INT UNSIGNED  NOT NULL,
  payment_amount      DECIMAL(10,2) NOT NULL,
  payment_method      ENUM('bank_transfer','fpx','cash','cheque') NOT NULL DEFAULT 'bank_transfer',
  payment_reference   VARCHAR(100)  NULL,
  payment_date        DATE          NOT NULL,
  payment_status      ENUM('pending','completed','failed','refunded') NOT NULL DEFAULT 'completed',
  notes               TEXT          NULL,
  created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pay_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
  CONSTRAINT fk_pay_club       FOREIGN KEY (club_id)       REFERENCES clubs(club_id)             ON DELETE CASCADE,
  INDEX idx_pay_status (payment_status)
) ENGINE=InnoDB CHARSET=utf8mb4;

-- ============================================================
-- 8. MATCHES (schedule & results)
-- ============================================================
CREATE TABLE matches (
  match_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tournament_id  INT UNSIGNED  NOT NULL,
  match_number   VARCHAR(20)   NOT NULL,     -- e.g. NC-01, EM-F
  home_team_id   INT UNSIGNED  NOT NULL,
  away_team_id   INT UNSIGNED  NOT NULL,
  match_date     DATETIME      NOT NULL,
  venue          VARCHAR(200)  NULL,
  home_score     SMALLINT UNSIGNED NULL,
  away_score     SMALLINT UNSIGNED NULL,
  status         ENUM('scheduled','live','completed','postponed','cancelled') NOT NULL DEFAULT 'scheduled',
  match_type     ENUM('group','semifinal','final') NOT NULL DEFAULT 'group',
  round_name     VARCHAR(60)   NULL,         -- e.g. "Group A", "Final"
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_matches_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
  CONSTRAINT fk_matches_home       FOREIGN KEY (home_team_id)  REFERENCES clubs(club_id),
  CONSTRAINT fk_matches_away       FOREIGN KEY (away_team_id)  REFERENCES clubs(club_id),
  CONSTRAINT chk_matches_diff_teams CHECK (home_team_id <> away_team_id),
  INDEX idx_matches_tournament (tournament_id),
  INDEX idx_matches_status (status),
  INDEX idx_matches_date (match_date)
) ENGINE=InnoDB CHARSET=utf8mb4;

-- ============================================================
-- 9. PLAYER MATCH STATS (per-game batting log -> rolled up into averages)
-- ============================================================
CREATE TABLE player_match_stats (
  stat_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  player_id    INT UNSIGNED  NOT NULL,
  match_id     INT UNSIGNED  NULL,      -- nullable: seed/demo rows may not map to a real match row
  at_bats      TINYINT UNSIGNED NOT NULL DEFAULT 0,
  hits         TINYINT UNSIGNED NOT NULL DEFAULT 0,
  runs         TINYINT UNSIGNED NOT NULL DEFAULT 0,
  rbi          TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_stats_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
  CONSTRAINT fk_stats_match  FOREIGN KEY (match_id)   REFERENCES matches(match_id)  ON DELETE SET NULL,
  CONSTRAINT chk_stats_hits_le_ab CHECK (hits <= at_bats),
  INDEX idx_stats_player (player_id)
) ENGINE=InnoDB CHARSET=utf8mb4;

-- ============================================================
-- 10. NEWS / ANNOUNCEMENTS (bilingual: BM + EN)
-- ============================================================
CREATE TABLE news (
  news_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title_bm     VARCHAR(200)  NOT NULL,
  title_en     VARCHAR(200)  NOT NULL,
  category_bm  VARCHAR(60)   NOT NULL DEFAULT 'Pengumuman',
  category_en  VARCHAR(60)   NOT NULL DEFAULT 'Announcement',
  body_bm      TEXT          NOT NULL,
  body_en      TEXT          NOT NULL,
  cover_image  VARCHAR(255)  NULL,
  published_date DATE        NOT NULL,
  created_by   INT UNSIGNED  NULL,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_news_creator FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_news_date (published_date)
) ENGINE=InnoDB CHARSET=utf8mb4;

-- ============================================================
-- 11. VIEW: league standings (derived from completed matches)
--     MariaDB/MySQL 8 both support this CTE-free correlated version.
-- ============================================================
CREATE OR REPLACE VIEW v_standings AS
SELECT
  t.tournament_id,
  c.club_id,
  c.club_name,
  COUNT(*)                                                                    AS mp,
  SUM(CASE WHEN winner = c.club_id THEN 1 ELSE 0 END)                          AS w,
  SUM(CASE WHEN loser  = c.club_id THEN 1 ELSE 0 END)                          AS l,
  SUM(CASE WHEN winner IS NULL THEN 1 ELSE 0 END)                              AS d,
  SUM(rf) AS runs_for,
  SUM(ra) AS runs_against,
  SUM(rf) - SUM(ra) AS run_diff,
  SUM(pts) AS points
FROM (
  SELECT m.tournament_id, m.home_team_id AS club_id,
         m.home_score AS rf, m.away_score AS ra,
         CASE WHEN m.home_score > m.away_score THEN m.home_team_id
              WHEN m.home_score < m.away_score THEN m.away_team_id END AS winner,
         CASE WHEN m.home_score < m.away_score THEN m.home_team_id
              WHEN m.home_score > m.away_score THEN m.away_team_id END AS loser,
         CASE WHEN m.home_score = m.away_score THEN 1
              WHEN m.home_score > m.away_score THEN 3 ELSE 0 END AS pts
  FROM matches m WHERE m.status = 'completed'
  UNION ALL
  SELECT m.tournament_id, m.away_team_id AS club_id,
         m.away_score AS rf, m.home_score AS ra,
         CASE WHEN m.home_score > m.away_score THEN m.home_team_id
              WHEN m.home_score < m.away_score THEN m.away_team_id END AS winner,
         CASE WHEN m.home_score < m.away_score THEN m.home_team_id
              WHEN m.home_score > m.away_score THEN m.away_team_id END AS loser,
         CASE WHEN m.home_score = m.away_score THEN 1
              WHEN m.away_score > m.home_score THEN 3 ELSE 0 END AS pts
  FROM matches m WHERE m.status = 'completed'
) rows_
JOIN tournaments t ON t.tournament_id = rows_.tournament_id
JOIN clubs c ON c.club_id = rows_.club_id
GROUP BY t.tournament_id, c.club_id, c.club_name;

-- ============================================================
-- 12. VIEW: player career batting stats (rolled up)
-- ============================================================
CREATE OR REPLACE VIEW v_player_stats AS
SELECT
  p.player_id,
  p.club_id,
  p.first_name,
  p.last_name,
  p.jersey_number,
  p.position,
  COUNT(s.stat_id)              AS total_matches,
  COALESCE(SUM(s.at_bats), 0)   AS total_at_bats,
  COALESCE(SUM(s.hits), 0)      AS total_hits,
  COALESCE(SUM(s.runs), 0)      AS total_runs,
  COALESCE(SUM(s.rbi), 0)       AS total_rbi,
  CASE WHEN COALESCE(SUM(s.at_bats), 0) > 0
       THEN ROUND(SUM(s.hits) / SUM(s.at_bats), 3)
       ELSE 0 END               AS batting_average
FROM players p
LEFT JOIN player_match_stats s ON s.player_id = p.player_id
WHERE p.is_active = 1
GROUP BY p.player_id, p.club_id, p.first_name, p.last_name, p.jersey_number, p.position;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- No seed/demo data — schema only. Populate via the app's
-- CRUD screens (Admin / Club Manager) or your own import.
-- ============================================================
