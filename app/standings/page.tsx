import { getLang } from '@/lib/lang';
import { getAllStandings, getTournamentsWithCompletedMatches } from '@/lib/queries';
import { StandingsBrowser } from '@/components/standings/StandingsBrowser';

export const revalidate = 60;

export default async function StandingsPage() {
  const lang = await getLang();
  const [standings, tournaments] = await Promise.all([getAllStandings(), getTournamentsWithCompletedMatches()]);
  return <StandingsBrowser lang={lang} standings={standings} tournaments={tournaments} />;
}
