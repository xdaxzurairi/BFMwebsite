"""Generates scoresheet-seed.sql: DEMO clubs, players and matches with one fully
balanced official scoresheet. Asserts the balance before writing.

    python scripts/demo/gen_scoresheet_seed.py
"""
from pathlib import Path

BAT = ['at_bats', 'runs', 'hits', 'rbi', 'doubles', 'triples', 'home_runs', 'sac_hits', 'sac_flies', 'walks',
       'hit_by_pitch', 'reached_on_error', 'strikeouts_swinging', 'strikeouts_looking', 'stolen_bases',
       'caught_stealing', 'putouts', 'assists', 'errors', 'runners_caught_stealing', 'stolen_bases_allowed', 'passed_balls']
PIT = ['outs', 'at_bats', 'hits', 'earned_runs', 'unearned_runs', 'walks', 'strikeouts_swinging',
       'strikeouts_looking', 'wild_pitches', 'balks']


def b(**k):
    return {c: k.get(c, 0) for c in BAT}


def p(**k):
    return {c: k.get(c, 0) for c in PIT}


# (jersey, first, last, roster position, batting order, position played, started, line or None = did not play)
AWAY = [
    (7, 'Ali', 'Hassan', 'CF', 1, 'CF', True, b(at_bats=5, runs=2, hits=3, rbi=1, doubles=1, strikeouts_swinging=1, stolen_bases=2, putouts=3)),
    (12, 'Wong', 'Kah Meng', 'SS', 2, 'SS', True, b(at_bats=4, runs=1, hits=2, rbi=2, home_runs=1, walks=1, putouts=2, assists=4, errors=1)),
    (21, 'Tan', 'Wei Jie', '1B', 3, '1B', True, b(at_bats=4, runs=1, hits=2, rbi=1, doubles=2, walks=1, stolen_bases=1, putouts=9)),
    (4, 'Rajesh', 'Kumar', 'C', 4, 'C', True, b(at_bats=4, runs=1, hits=1, rbi=2, walks=1, strikeouts_looking=1, putouts=7, assists=1, runners_caught_stealing=1, stolen_bases_allowed=1)),
    (15, 'Lim', 'Boon Hock', '3B', 5, '3B', True, b(at_bats=4, hits=1, rbi=1, strikeouts_swinging=1, putouts=1, assists=2)),
    (9, 'Hafiz', 'Rahman', 'LF', 6, 'LF', True, b(at_bats=4, runs=1, hits=1, walks=1, strikeouts_swinging=1, putouts=2)),
    (3, 'Daniel', 'Lee', '2B', 7, '2B', True, b(at_bats=4, hits=1, strikeouts_looking=1, putouts=2, assists=3)),
    (27, 'Arif', 'Zakaria', 'RF', 8, 'RF', True, b(at_bats=4, runs=1, strikeouts_swinging=1, putouts=1)),
    (33, 'Kumar', 'Selvam', 'DH', 9, 'DH', True, b(at_bats=4)),
    (18, 'Syafiq', 'Ismail', 'OF', 9, 'PH', False, b(at_bats=1)),
    (11, 'Ahmad', 'Zulkifli', 'P', None, 'P', True, b(assists=1)),
    (40, 'Lee', 'Chun Hao', 'P', None, 'P', False, b()),
    (22, 'Nabil', 'Farhan', 'IF', None, None, False, None),
]
HOME = [
    (2, 'Faris', 'Aiman', 'SS', 1, 'SS', True, b(at_bats=4, runs=1, hits=2, doubles=1, strikeouts_swinging=1, stolen_bases=1, putouts=2, assists=5, errors=1)),
    (6, 'Nicholas', 'Ong', '2B', 2, '2B', True, b(at_bats=4, hits=1, rbi=1, strikeouts_looking=1, putouts=3, assists=3)),
    (8, 'Irfan', 'Hakim', 'CF', 3, 'CF', True, b(at_bats=4, runs=1, hits=2, rbi=1, triples=1, strikeouts_swinging=1, putouts=4)),
    (25, 'Kenny', 'Chin', '1B', 4, '1B', True, b(at_bats=3, runs=1, hits=1, rbi=2, home_runs=1, walks=1, strikeouts_swinging=1, putouts=8, assists=1)),
    (10, 'Muthu', 'Raj', 'C', 5, 'C', True, b(at_bats=4, hits=1, doubles=1, strikeouts_looking=1, putouts=6, assists=1, stolen_bases_allowed=3, passed_balls=1)),
    (14, 'Amirul', 'Hakimi', '3B', 6, '3B', True, b(at_bats=3, runs=1, hits=1, walks=1, strikeouts_swinging=1, putouts=1, assists=2, errors=1)),
    (5, 'Jason', 'Yap', 'LF', 7, 'LF', True, b(at_bats=4, strikeouts_swinging=1, strikeouts_looking=1, putouts=2)),
    (19, 'Zulhilmi', 'Aziz', 'RF', 8, 'RF', True, b(at_bats=3, walks=1, strikeouts_swinging=1, putouts=1)),
    (30, 'Harith', 'Danial', 'DH', 9, 'DH', True, b(at_bats=4)),
    (17, 'Faizal', 'Rosli', 'P', None, 'P', True, b(assists=1)),
    (44, 'Chong', 'Wei Han', 'P', None, 'P', False, b()),
    (1, 'Aiman', 'Syahmi', 'OF', None, None, False, None),
    (23, 'Ravi', 'Chandran', 'IF', None, None, False, None),
]
# (jersey, pitch order, started, decision, line)
AWAY_PIT = [(11, 1, True, 'win', p(outs=21, at_bats=25, hits=6, earned_runs=3, walks=3, strikeouts_swinging=5, strikeouts_looking=2)),
            (40, 2, False, 'save', p(outs=6, at_bats=8, hits=2, earned_runs=1, strikeouts_swinging=2))]
HOME_PIT = [(17, 1, True, 'loss', p(outs=16, at_bats=24, hits=8, earned_runs=4, unearned_runs=1, walks=3, strikeouts_swinging=3, strikeouts_looking=1, wild_pitches=1)),
            (44, 2, False, None, p(outs=11, at_bats=14, hits=3, earned_runs=1, unearned_runs=1, walks=1, strikeouts_swinging=2))]
INNINGS = [(0, 1), (2, 0), (0, 0), (0, 2), (3, 0), (0, 0), (2, 1), (0, 0), (0, 0)]  # (away, home); away 7, home 4


def tot(rows, k):
    return sum(r[7][k] for r in rows if r[7])


def ptot(rows, k):
    return sum(r[4][k] for r in rows)


# --- balance self-check (same rules as lib/scoresheet.ts balance()) ---
assert sum(a for a, _ in INNINGS) == tot(AWAY, 'runs') == 7
assert sum(h for _, h in INNINGS) == tot(HOME, 'runs') == 4
for bat, opp_pit, own_pit in ((AWAY, HOME_PIT, AWAY_PIT), (HOME, AWAY_PIT, HOME_PIT)):
    for k in ('hits', 'at_bats', 'walks'):
        assert tot(bat, k) == ptot(opp_pit, k), k
    assert tot(bat, 'putouts') == ptot(own_pit, 'outs') == 27
for r in AWAY + HOME:
    if r[7]:
        assert r[7]['hits'] <= r[7]['at_bats'] and r[7]['doubles'] + r[7]['triples'] + r[7]['home_runs'] <= r[7]['hits']


def q(s):
    return 'null' if s is None else "'" + str(s).replace("'", "''") + "'"


out = ["""-- ============================================================
-- DEMO data for testing the official scoresheet locally.
-- Everything is tagged "DEMO" and removed by scoresheet-cleanup.sql.
-- Generated by gen_scoresheet_seed.py; match DEMO-1 is fully balanced.
-- ============================================================
do $$
declare
  v_t bigint; v_away bigint; v_home bigint; v_m1 bigint;
begin
  if exists (select 1 from tournaments where tournament_name like 'DEMO %') then
    raise exception 'Demo data already exists - run scoresheet-cleanup.sql first.';
  end if;

  insert into tournaments (tournament_name, start_date, end_date, status)
    values ('DEMO - Ujian Scoresheet', current_date - 3, current_date + 4, 'ongoing') returning tournament_id into v_t;
  insert into clubs (club_name, state, manager_name, color)
    values ('DEMO Harimau KL', 'Kuala Lumpur', 'Pengurus Demo', '#c2410c') returning club_id into v_away;
  insert into clubs (club_name, state, manager_name, color)
    values ('DEMO Helang Perak', 'Perak', 'Pengurus Demo', '#15803d') returning club_id into v_home;
"""]
for club, rows in (('v_away', AWAY), ('v_home', HOME)):
    vals = ",\n    ".join(f"({club}, {r[0]}, {q(r[1])}, {q(r[2])}, {q(r[3])})" for r in rows)
    out.append(f"  insert into players (club_id, jersey_number, first_name, last_name, position) values\n    {vals};\n")
out.append("""
  -- DEMO-1: completed, full balanced scoresheet (starts 3:00 PM MYT two days ago, 2:41 long)
  insert into matches (tournament_id, match_number, home_team_id, away_team_id, match_date, ended_at, venue, status, home_score, away_score, away_lob, home_lob, round_name)
    values (v_t, 'DEMO-1', v_home, v_away,
            (current_date - 2)::timestamp + interval '15 hours' - interval '8 hours',
            (current_date - 2)::timestamp + interval '17 hours 41 minutes' - interval '8 hours',
            'Stadium Bola Lisut Demo, Ipoh', 'completed', 4, 7, 8, 6, 'Separuh Akhir') returning match_id into v_m1;
  -- DEMO-2: completed, no scoresheet yet (try the admin editor here)
  insert into matches (tournament_id, match_number, home_team_id, away_team_id, match_date, venue, status, home_score, away_score, round_name)
    values (v_t, 'DEMO-2', v_away, v_home, (current_date - 1)::timestamp + interval '7 hours', 'Padang Demo, Kuala Lumpur', 'completed', 5, 3, 'Kumpulan');
  -- DEMO-3: scheduled
  insert into matches (tournament_id, match_number, home_team_id, away_team_id, match_date, venue, status, round_name)
    values (v_t, 'DEMO-3', v_home, v_away, (current_date + 2)::timestamp + interval '7 hours', 'Stadium Bola Lisut Demo, Ipoh', 'scheduled', 'Akhir');

""")
out.append("  insert into match_innings (match_id, inning, away_runs, home_runs) values\n    "
           + ", ".join(f"(v_m1, {i + 1}, {a}, {h})" for i, (a, h) in enumerate(INNINGS)) + ";\n\n")
cols = "player_id, match_id, started, batting_order, position_played, " + ", ".join(BAT)
for club, rows in (('v_away', AWAY), ('v_home', HOME)):
    for r in rows:
        if not r[7]:
            continue
        vals = ", ".join(str(r[7][c]) for c in BAT)
        out.append(f"  insert into player_match_stats ({cols})\n    select player_id, v_m1, {str(r[6]).lower()}, {r[4] or 'null'}, {q(r[5])}, {vals}\n    from players where club_id = {club} and jersey_number = {r[0]};\n")
pcols = "player_id, match_id, pitch_order, started, decision, " + ", ".join(PIT)
for club, rows in (('v_away', AWAY_PIT), ('v_home', HOME_PIT)):
    for r in rows:
        vals = ", ".join(str(r[4][c]) for c in PIT)
        dec = q(r[3]) + "::pitching_decision" if r[3] else 'null'
        out.append(f"  insert into match_pitching_stats ({pcols})\n    select player_id, v_m1, {r[1]}, {str(r[2]).lower()}, {dec}, {vals}\n    from players where club_id = {club} and jersey_number = {r[0]};\n")
out.append("end $$;\n")

dest = Path(__file__).with_name('scoresheet-seed.sql')
dest.write_text(''.join(out), encoding='utf-8')
print(f'balanced OK -> {dest}')
