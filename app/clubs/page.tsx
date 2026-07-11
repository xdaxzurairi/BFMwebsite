import { getLang } from '@/lib/lang';
import { getClubs, getPlayersOfClub } from '@/lib/queries';
import { ClubsBrowser } from '@/components/clubs/ClubsBrowser';

export const revalidate = 60;

export default async function ClubsPage() {
  const lang = await getLang();
  const clubs = await getClubs();
  const playerCounts: Record<number, number> = {};
  await Promise.all(
    clubs.map(async (c) => {
      const players = await getPlayersOfClub(c.club_id);
      playerCounts[c.club_id] = players.length;
    })
  );
  return <ClubsBrowser lang={lang} clubs={clubs} playerCounts={playerCounts} />;
}
