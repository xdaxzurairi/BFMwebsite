import { createClient } from '@/lib/supabase/server';
import type { Club, Player, Tournament, Match, News, StandingRow, PlayerStatRow, PlayerMatchStat, PitchingLine, InningLine, StatReview, Official, Registration, Payment, AppUserRow } from './types';

export async function getClubs() {
  const supabase = await createClient();
  const { data } = await supabase.from('clubs').select('*').eq('is_active', true).order('club_name');
  return (data || []) as Club[];
}

export async function getClub(id: number) {
  const supabase = await createClient();
  const { data } = await supabase.from('clubs').select('*').eq('club_id', id).single();
  return data as Club | null;
}

export async function getPlayersOfClub(clubId: number) {
  const supabase = await createClient();
  const { data } = await supabase.from('players').select('*').eq('club_id', clubId).eq('is_active', true).order('jersey_number');
  return (data || []) as Player[];
}

export async function getOfficialsOfClub(clubId: number) {
  const supabase = await createClient();
  const { data } = await supabase.from('officials').select('*').eq('club_id', clubId).eq('is_active', true);
  return (data || []) as Official[];
}

export async function getPlayerStats(playerId?: number) {
  const supabase = await createClient();
  let q = supabase.from('v_player_stats').select('*');
  if (playerId) q = q.eq('player_id', playerId);
  const { data } = await q;
  return (data || []) as PlayerStatRow[];
}

export async function getPlayer(id: number) {
  const supabase = await createClient();
  const { data } = await supabase.from('players').select('*').eq('player_id', id).single();
  return data as Player | null;
}

export async function getTournaments() {
  const supabase = await createClient();
  const { data } = await supabase.from('tournaments').select('*').order('start_date', { ascending: false });
  return (data || []) as Tournament[];
}

export async function getTournament(id: number) {
  const supabase = await createClient();
  const { data } = await supabase.from('tournaments').select('*').eq('tournament_id', id).single();
  return data as Tournament | null;
}

export async function getUpcomingTournament() {
  const supabase = await createClient();
  const { data } = await supabase.from('tournaments').select('*').eq('status', 'upcoming').order('start_date').limit(1);
  return (data?.[0] || null) as Tournament | null;
}

export async function getRegistrationsForTournament(tournamentId: number) {
  const supabase = await createClient();
  const { data } = await supabase.from('registrations').select('*').eq('tournament_id', tournamentId).neq('status', 'withdrawn');
  return (data || []) as Registration[];
}

export async function getMatches(tournamentId?: number) {
  const supabase = await createClient();
  let q = supabase.from('matches').select('*').order('match_date');
  if (tournamentId) q = q.eq('tournament_id', tournamentId);
  const { data } = await q;
  return (data || []) as Match[];
}

export async function getStandings(tournamentId: number) {
  const supabase = await createClient();
  const { data } = await supabase.from('v_standings').select('*').eq('tournament_id', tournamentId).order('points', { ascending: false }).order('run_diff', { ascending: false });
  return (data || []) as StandingRow[];
}

export async function getAllStandings() {
  const supabase = await createClient();
  const { data } = await supabase.from('v_standings').select('*').order('tournament_id').order('points', { ascending: false }).order('run_diff', { ascending: false });
  return (data || []) as StandingRow[];
}

export async function getTournamentsWithCompletedMatches() {
  const supabase = await createClient();
  const { data: tournaments } = await supabase.from('tournaments').select('tournament_id, tournament_name');
  const { data: completed } = await supabase.from('matches').select('tournament_id').eq('status', 'completed');
  const idsWithMatches = new Set((completed || []).map((m) => m.tournament_id));
  return (tournaments || []).filter((t) => idsWithMatches.has(t.tournament_id));
}

export async function getNews() {
  const supabase = await createClient();
  const { data } = await supabase.from('news').select('*').order('published_date', { ascending: false });
  return (data || []) as News[];
}

export async function getRegistrationsForClub(clubId: number) {
  const supabase = await createClient();
  const { data } = await supabase.from('registrations').select('*').eq('club_id', clubId).order('registration_date', { ascending: false });
  return (data || []) as Registration[];
}

export async function getAllRegistrations() {
  const supabase = await createClient();
  const { data } = await supabase.from('registrations').select('*').order('registration_date', { ascending: false });
  return (data || []) as Registration[];
}

export async function getAllPayments() {
  const supabase = await createClient();
  const { data } = await supabase.from('payments').select('*').order('payment_date', { ascending: false });
  return (data || []) as Payment[];
}

export async function getUsers() {
  const supabase = await createClient();
  const { data } = await supabase.from('users').select('*').order('full_name');
  return (data || []) as AppUserRow[];
}

export async function getCounts() {
  const supabase = await createClient();
  const [clubs, players, matches, states] = await Promise.all([
    supabase.from('clubs').select('club_id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('players').select('player_id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('matches').select('match_id', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('clubs').select('state').eq('is_active', true),
  ]);
  const stateSet = new Set((states.data || []).map((c) => c.state));
  return {
    clubs: clubs.count || 0,
    players: players.count || 0,
    matches: matches.count || 0,
    states: stateSet.size,
  };
}

export async function getMatch(id: number) {
  const supabase = await createClient();
  const { data } = await supabase.from('matches').select('*').eq('match_id', id).single();
  return data as Match | null;
}

export async function getMatchBoxScore(matchId: number) {
  const supabase = await createClient();
  const { data: stats } = await supabase.from('player_match_stats').select('*').eq('match_id', matchId);
  const rows = (stats || []) as PlayerMatchStat[];
  if (!rows.length) return [];
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .in('player_id', rows.map((r) => r.player_id));
  const byId = new Map(((players || []) as Player[]).map((p) => [p.player_id, p]));
  return rows.flatMap((r) => {
    const player = byId.get(r.player_id);
    return player ? [{ ...r, player }] : [];
  });
}

export async function getMatchPitching(matchId: number) {
  const supabase = await createClient();
  const { data: lines } = await supabase.from('match_pitching_stats').select('*').eq('match_id', matchId).order('pitch_order');
  const rows = (lines || []) as PitchingLine[];
  if (!rows.length) return [];
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .in('player_id', rows.map((r) => r.player_id));
  const byId = new Map(((players || []) as Player[]).map((p) => [p.player_id, p]));
  return rows.flatMap((r) => {
    const player = byId.get(r.player_id);
    return player ? [{ ...r, player }] : [];
  });
}

export async function getMatchInnings(matchId: number) {
  const supabase = await createClient();
  const { data } = await supabase.from('match_innings').select('*').eq('match_id', matchId).order('inning');
  return (data || []) as InningLine[];
}

export async function getHeadToHead(clubA: number, clubB: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'completed')
    .or(`and(home_team_id.eq.${clubA},away_team_id.eq.${clubB}),and(home_team_id.eq.${clubB},away_team_id.eq.${clubA})`)
    .order('match_date', { ascending: false });
  return (data || []) as Match[];
}

export async function getNewsItem(id: number) {
  const supabase = await createClient();
  const { data } = await supabase.from('news').select('*').eq('news_id', id).single();
  return data as News | null;
}

export async function getStatReviews(matchId?: number) {
  const supabase = await createClient();
  let q = supabase.from('match_stat_reviews').select('*');
  if (matchId) q = q.eq('match_id', matchId);
  const { data } = await q;
  return (data || []) as StatReview[];
}
