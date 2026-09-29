/* Row shapes matching supabase/migrations/20260710000000_initial_schema.sql */

export type Club = {
  club_id: number;
  club_name: string;
  state: string;
  club_category: 'club' | 'school';
  manager_name: string;
  phone: string | null;
  email: string | null;
  color: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type UserRole = 'user' | 'club_manager' | 'admin' | 'technical_admin';

export type AppUserRow = {
  user_id: number;
  auth_user_id: string | null;
  full_name: string;
  email: string;
  role: UserRole;
  club_id: number | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Official = {
  official_id: number;
  club_id: number;
  first_name: string;
  last_name: string;
  position: string;
  role: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Player = {
  player_id: number;
  club_id: number;
  jersey_number: number;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  position: string;
  email: string | null;
  phone: string | null;
  medical_clearance: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export type Tournament = {
  tournament_id: number;
  tournament_name: string;
  description: string | null;
  tournament_type: 'round_robin' | 'single_elim' | 'double_elim';
  tournament_level: 'local' | 'regional' | 'national' | 'international';
  tournament_category: 'youth' | 'adult' | 'senior';
  currency: string;
  start_date: string;
  end_date: string;
  registration_start: string | null;
  registration_end: string | null;
  max_teams: number;
  entry_fee: number;
  prize_pool: number;
  location: string | null;
  status: TournamentStatus;
  created_by: number | null;
  created_at: string;
  updated_at: string;
};

export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

export type Registration = {
  registration_id: number;
  tournament_id: number;
  club_id: number;
  registration_date: string;
  status: RegistrationStatus;
  notes: string | null;
  registered_by: number | null;
  created_at: string;
  updated_at: string;
};

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type Payment = {
  payment_id: number;
  tournament_id: number;
  club_id: number;
  payment_amount: number;
  payment_method: 'bank_transfer' | 'fpx' | 'cash' | 'cheque';
  payment_reference: string | null;
  payment_date: string;
  payment_status: PaymentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type MatchStatus = 'scheduled' | 'live' | 'completed' | 'postponed' | 'cancelled';

export type Match = {
  match_id: number;
  tournament_id: number;
  match_number: string;
  home_team_id: number;
  away_team_id: number;
  match_date: string;
  venue: string | null;
  home_score: number | null;
  away_score: number | null;
  status: MatchStatus;
  match_type: 'group' | 'semifinal' | 'final';
  round_name: string | null;
  away_lob: number | null;
  home_lob: number | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
};

/* Batting, fielding and participation counts on one stat line (DakStats stat sheet columns). */
export type BattingCounts = {
  at_bats: number;
  runs: number;
  hits: number;
  doubles: number;
  triples: number;
  home_runs: number;
  rbi: number;
  sac_hits: number;
  sac_flies: number;
  walks: number;
  hit_by_pitch: number;
  reached_on_error: number;
  strikeouts_swinging: number;
  strikeouts_looking: number;
  stolen_bases: number;
  caught_stealing: number;
  putouts: number;
  assists: number;
  errors: number;
  runners_caught_stealing: number;
  stolen_bases_allowed: number;
  passed_balls: number;
};

export type PlayerMatchStat = BattingCounts & {
  stat_id: number;
  player_id: number;
  match_id: number | null;
  started: boolean;
  batting_order: number | null;
  position_played: string | null;
  created_at: string;
};

export type PitchingDecision = 'win' | 'loss' | 'save';

export type PitchingCounts = {
  outs: number;
  at_bats: number;
  hits: number;
  earned_runs: number;
  unearned_runs: number;
  walks: number;
  strikeouts_swinging: number;
  strikeouts_looking: number;
  wild_pitches: number;
  balks: number;
};

export type PitchingLine = PitchingCounts & {
  pitch_id: number;
  match_id: number;
  player_id: number;
  pitch_order: number;
  started: boolean;
  decision: PitchingDecision | null;
  created_at: string;
};

/* Runs in one inning; null = half inning not played ("X"). */
export type InningLine = { match_id: number; inning: number; away_runs: number | null; home_runs: number | null };

export type News = {
  news_id: number;
  title_bm: string;
  title_en: string;
  category_bm: string;
  category_en: string;
  body_bm: string;
  body_en: string;
  cover_image: string | null;
  published_date: string;
  created_by: number | null;
  created_at: string;
  updated_at: string;
};

export type StandingRow = {
  tournament_id: number;
  club_id: number;
  club_name: string;
  mp: number;
  w: number;
  l: number;
  d: number;
  runs_for: number;
  runs_against: number;
  run_diff: number;
  points: number;
};

export type PlayerStatRow = {
  player_id: number;
  club_id: number;
  first_name: string;
  last_name: string;
  jersey_number: number;
  position: string;
  total_matches: number;
  total_at_bats: number;
  total_hits: number;
  total_runs: number;
  total_rbi: number;
  batting_average: number;
};

export type StatReviewStatus = 'pending' | 'approved' | 'disputed';

export type StatReview = {
  match_id: number;
  club_id: number;
  status: StatReviewStatus;
  submitted_by: number | null;
  submitted_at: string;
  reviewed_by: number | null;
  reviewed_at: string | null;
  review_note: string | null;
};
