import { Metric } from '@/components/dashboard/DashShell';
import { ClubLogo } from '@/components/ui/ClubLogo';
import { Button } from '@/components/ui/Button';
import { I } from '@/components/ui/icons';
import { fmt } from '@/lib/format';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Club, Player, Official, Registration, PlayerStatRow } from '@/lib/types';
import Link from 'next/link';

export function ManagerOverview({
  lang,
  club,
  players,
  officials,
  regs,
  stats,
}: {
  lang: Lang;
  club: Club;
  players: Player[];
  officials: Official[];
  regs: Registration[];
  stats: PlayerStatRow[];
}) {
  const statsByPlayer = new Map(stats.map((s) => [s.player_id, s]));
  const avg = players.length ? players.reduce((a, p) => a + (statsByPlayer.get(p.player_id)?.batting_average ?? 0), 0) / players.length : 0;

  return (
    <div className="col" style={{ gap: 24 }}>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' }}>
        <Metric icon={I.users} label={translate('lbl.players', lang)} value={players.length} />
        <Metric icon={I.shield} label={translate('lbl.officials', lang)} value={officials.length} tone="clay" />
        <Metric icon={I.trophy} label={translate('dash.myregs', lang)} value={regs.length} />
        <div className="card pad">
          <div className="row between center">
            <div className="stat-label muted">{translate('lbl.avg', lang)}</div>
            <I.chart style={{ width: 18, height: 18, color: 'var(--clay)' }} />
          </div>
          <div className="display" style={{ fontSize: 46, marginTop: 8, color: 'var(--clay)' }}>
            {fmt.avg(avg)}
          </div>
        </div>
      </div>
      <div className="card pad">
        <div className="row center" style={{ gap: 18, flexWrap: 'wrap' }}>
          <ClubLogo club={club} size={64} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <h3 className="h-md">{club.club_name}</h3>
            <div className="row" style={{ gap: 18, marginTop: 6, color: 'var(--ink-soft)', fontSize: 14, flexWrap: 'wrap' }}>
              <span className="row center" style={{ gap: 6 }}>
                <I.pin style={{ width: 15, height: 15 }} />
                {club.state}
              </span>
              <span className="row center" style={{ gap: 6 }}>
                <I.user style={{ width: 15, height: 15 }} />
                {club.email}
              </span>
              <span className="row center" style={{ gap: 6 }}>
                <I.clock style={{ width: 15, height: 15 }} />
                {club.phone}
              </span>
            </div>
          </div>
          <Link href="/dashboard/registrations">
            <Button variant="field" icon={I.trophy}>
              {translate('cta.register', lang)}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
