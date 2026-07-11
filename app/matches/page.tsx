import { getLang } from '@/lib/lang';
import { getMatches, getClubs, getTournaments } from '@/lib/queries';
import { MatchesBrowser } from '@/components/matches/MatchesBrowser';

export const revalidate = 60;

export default async function MatchesPage() {
  const lang = await getLang();
  const [matches, clubs, tournaments] = await Promise.all([getMatches(), getClubs(), getTournaments()]);
  return <MatchesBrowser lang={lang} matches={matches} clubs={clubs} tournaments={tournaments} />;
}
