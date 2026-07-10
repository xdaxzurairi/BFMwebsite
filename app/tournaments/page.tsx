import { getLang } from '@/lib/lang';
import { getTournaments, getRegistrationsForTournament } from '@/lib/queries';
import { TournamentsBrowser } from '@/components/tournaments/TournamentsBrowser';

export const revalidate = 60;

export default async function TournamentsPage() {
  const lang = await getLang();
  const tournaments = await getTournaments();
  const teamCounts: Record<number, number> = {};
  await Promise.all(
    tournaments.map(async (tn) => {
      const regs = await getRegistrationsForTournament(tn.tournament_id);
      teamCounts[tn.tournament_id] = regs.filter((r) => r.status === 'approved').length;
    })
  );
  return <TournamentsBrowser lang={lang} tournaments={tournaments} teamCounts={teamCounts} />;
}
