import Link from 'next/link';
import { ClubLogo } from '@/components/ui/ClubLogo';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Empty } from '@/components/ui/Empty';
import { statusLbl } from '@/lib/status';
import type { Lang } from '@/lib/i18n';
import type { Club, Registration } from '@/lib/types';

export function TeamsGrid({ regs, clubs, lang }: { regs: Registration[]; clubs: Club[]; lang: Lang }) {
  if (!regs.length) {
    return <Empty>{lang === 0 ? 'Belum ada pasukan mendaftar.' : 'No teams registered yet.'}</Empty>;
  }
  const byId = new Map(clubs.map((c) => [c.club_id, c]));
  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))' }}>
      {regs.map((r) => {
        const c = byId.get(r.club_id);
        if (!c) return null;
        return (
          <Link key={r.registration_id} href={`/clubs/${c.club_id}`} className="card pad row center" style={{ gap: 13, cursor: 'pointer' }}>
            <ClubLogo club={c} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.1 }}>{c.club_name}</div>
              <div className="muted" style={{ fontSize: 12 }}>
                {c.state}
              </div>
            </div>
            <StatusBadge status={r.status} label={statusLbl(r.status, lang)} />
          </Link>
        );
      })}
    </div>
  );
}
