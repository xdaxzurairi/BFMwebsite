import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { I } from '@/components/ui/icons';
import { fmt } from '@/lib/format';
import { statusLbl } from '@/lib/status';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Tournament } from '@/lib/types';

export function TournamentCard({ tn, lang, teamCount }: { tn: Tournament; lang: Lang; teamCount: number }) {
  return (
    <Link href={`/tournaments/${tn.tournament_id}`} className="card hover" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '22px 22px 0' }}>
        <div className="row between center" style={{ marginBottom: 14 }}>
          <StatusBadge status={tn.status} label={statusLbl(tn.status, lang)} />
          <span className="badge">{(tn.tournament_level || '').toUpperCase()}</span>
        </div>
        <h3 className="h-md" style={{ lineHeight: 1.15, marginBottom: 10 }}>
          {tn.tournament_name}
        </h3>
        <p className="muted" style={{ fontSize: 14, lineHeight: 1.5, minHeight: 42 }}>
          {tn.description}
        </p>
      </div>
      <div className="pad" style={{ marginTop: 'auto' }}>
        <div className="row" style={{ gap: 16, color: 'var(--ink-soft)', fontSize: 13, flexWrap: 'wrap' }}>
          <span className="row center" style={{ gap: 6 }}>
            <I.calendar style={{ width: 15, height: 15 }} />
            {fmt.date(tn.start_date, lang)}
          </span>
          <span className="row center" style={{ gap: 6 }}>
            <I.pin style={{ width: 15, height: 15 }} />
            {(tn.location ?? '').split(',')[0]}
          </span>
        </div>
        <div className="row between center" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line-soft)' }}>
          <span className="badge">
            <I.users style={{ width: 12, height: 12 }} />
            {teamCount}/{tn.max_teams} {translate('lbl.teams', lang)}
          </span>
          <span style={{ fontWeight: 800, color: 'var(--field)' }}>{fmt.money(tn.entry_fee, tn.currency)}</span>
        </div>
      </div>
    </Link>
  );
}
