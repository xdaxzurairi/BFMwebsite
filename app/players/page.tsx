import { getLang } from '@/lib/lang';
import { getPlayerStats, getClubs } from '@/lib/queries';
import { PlayersBrowser } from '@/components/players/PlayersBrowser';

export const revalidate = 60;

export default async function PlayersPage() {
  const lang = await getLang();
  const [rows, clubs] = await Promise.all([getPlayerStats(), getClubs()]);
  return <PlayersBrowser lang={lang} rows={rows} clubs={clubs} />;
}
