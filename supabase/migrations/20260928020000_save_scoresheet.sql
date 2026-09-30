-- ============================================================
-- save_scoresheet(): writes a whole official scoresheet in one
-- transaction — batting/fielding lines for both teams, pitching
-- lines, the line score and header fields. Admin only.
--
-- SECURITY DEFINER (like review_match_stats) because the private
-- helper schema is not usable by signed-in roles; the explicit admin
-- check below is the gate. Stat lines written here pass through
-- trg_player_match_stats_review and land as 'approved'.
-- ============================================================

create function public.save_scoresheet(
  p_match_id  bigint,
  p_batting   jsonb,
  p_pitching  jsonb,
  p_innings   jsonb,
  p_away_lob  smallint,
  p_home_lob  smallint,
  p_ended_at  timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match matches%rowtype;
begin
  if not private.is_admin() then
    raise exception 'Only an admin can save the official scoresheet.';
  end if;

  select * into v_match from matches where match_id = p_match_id;
  if not found then
    raise exception 'Match % not found.', p_match_id;
  end if;

  if exists (
    select 1
    from (select (e->>'player_id')::bigint as player_id from jsonb_array_elements(p_batting) e
          union all
          select (e->>'player_id')::bigint from jsonb_array_elements(p_pitching) e) x
    left join players p on p.player_id = x.player_id
    where p.club_id is null or p.club_id not in (v_match.home_team_id, v_match.away_team_id)
  ) then
    raise exception 'Every player on the scoresheet must belong to one of the two teams.';
  end if;

  -- Batting / fielding: replace both teams' lines for this match.
  delete from player_match_stats s
  using players p
  where s.match_id = p_match_id
    and p.player_id = s.player_id
    and p.club_id in (v_match.home_team_id, v_match.away_team_id);

  insert into player_match_stats (
    player_id, match_id, started, batting_order, position_played,
    at_bats, runs, hits, rbi, doubles, triples, home_runs, sac_hits, sac_flies,
    walks, hit_by_pitch, reached_on_error, strikeouts_swinging, strikeouts_looking,
    stolen_bases, caught_stealing, putouts, assists, errors,
    runners_caught_stealing, stolen_bases_allowed, passed_balls
  )
  select
    r.player_id, p_match_id, coalesce(r.started, false), r.batting_order, nullif(trim(r.position_played), ''),
    r.at_bats, r.runs, r.hits, r.rbi, r.doubles, r.triples, r.home_runs, r.sac_hits, r.sac_flies,
    r.walks, r.hit_by_pitch, r.reached_on_error, r.strikeouts_swinging, r.strikeouts_looking,
    r.stolen_bases, r.caught_stealing, r.putouts, r.assists, r.errors,
    r.runners_caught_stealing, r.stolen_bases_allowed, r.passed_balls
  from jsonb_populate_recordset(null::player_match_stats, p_batting) r;

  -- Pitching lines.
  delete from match_pitching_stats where match_id = p_match_id;
  insert into match_pitching_stats (
    match_id, player_id, pitch_order, started, outs, at_bats, hits, earned_runs, unearned_runs,
    walks, strikeouts_swinging, strikeouts_looking, wild_pitches, balks, decision
  )
  select
    p_match_id, r.player_id, r.pitch_order, coalesce(r.started, false), r.outs, r.at_bats, r.hits, r.earned_runs, r.unearned_runs,
    r.walks, r.strikeouts_swinging, r.strikeouts_looking, r.wild_pitches, r.balks, r.decision
  from jsonb_populate_recordset(null::match_pitching_stats, p_pitching) r;

  -- Line score.
  delete from match_innings where match_id = p_match_id;
  insert into match_innings (match_id, inning, away_runs, home_runs)
  select p_match_id, r.inning, r.away_runs, r.home_runs
  from jsonb_populate_recordset(null::match_innings, p_innings) r;

  update matches
  set away_lob = p_away_lob, home_lob = p_home_lob, ended_at = p_ended_at
  where match_id = p_match_id;
end;
$$;

revoke all on function public.save_scoresheet(bigint, jsonb, jsonb, jsonb, smallint, smallint, timestamptz) from public, anon;
grant execute on function public.save_scoresheet(bigint, jsonb, jsonb, jsonb, smallint, smallint, timestamptz) to authenticated;
