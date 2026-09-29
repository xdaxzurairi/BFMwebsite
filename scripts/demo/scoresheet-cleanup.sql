-- Removes everything created by scoresheet-seed.sql.
-- Matches, their stats, innings, pitching lines and reviews cascade from the matches;
-- players cascade from their clubs.
do $$
begin
  delete from matches where tournament_id in (select tournament_id from tournaments where tournament_name like 'DEMO %');
  delete from tournaments where tournament_name like 'DEMO %';
  delete from clubs where club_name like 'DEMO %';
end $$;
