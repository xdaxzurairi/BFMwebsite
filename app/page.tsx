import { Hero } from '@/components/landing/Hero';
import { Ticker } from '@/components/landing/Ticker';
import { StatsBand } from '@/components/landing/StatsBand';
import { NextTournament } from '@/components/landing/NextTournament';
import { FeaturedClubs } from '@/components/landing/FeaturedClubs';
import { NewsSection } from '@/components/landing/NewsSection';
import { JoinCTA } from '@/components/landing/JoinCTA';
import { getLang } from '@/lib/lang';
import { getAppUser } from '@/lib/auth';
import { getClubs, getMatches, getUpcomingTournament, getNews, getCounts, getPlayersOfClub } from '@/lib/queries';

export const revalidate = 60;

export default async function HomePage() {
  const lang = await getLang();
  const [appUser, counts, clubs, matches, upcoming, news] = await Promise.all([
    getAppUser(),
    getCounts(),
    getClubs(),
    getMatches(),
    getUpcomingTournament(),
    getNews(),
  ]);

  const playerCounts: Record<number, number> = {};
  await Promise.all(
    clubs.slice(0, 4).map(async (c) => {
      const players = await getPlayersOfClub(c.club_id);
      playerCounts[c.club_id] = players.length;
    })
  );

  return (
    <div>
      <Hero lang={lang} counts={counts} />
      <Ticker matches={matches} clubs={clubs} />
      <StatsBand lang={lang} counts={counts} />
      <NextTournament lang={lang} tournament={upcoming} />
      <FeaturedClubs lang={lang} clubs={clubs} playerCounts={playerCounts} />
      <NewsSection lang={lang} news={news} />
      <JoinCTA lang={lang} appUser={appUser} />
    </div>
  );
}
