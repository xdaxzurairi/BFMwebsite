import Link from 'next/link';
import { ClubLogo } from '@/components/ui/ClubLogo';
import { I } from '@/components/ui/icons';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Club } from '@/lib/types';

export function ClubCard({ club, lang, playerCount }: { club: Club; lang: Lang; playerCount: number }) {
  return (
    <Link href={`/clubs/${club.club_id}`} className="card hover" style={{ cursor: 'pointer', display: 'block', overflow: 'hidden' }}>
      <div style={{ padding: '28px 20px 22px', background: club.color ?? 'var(--field)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 15px, oklch(1 0 0 / .07) 15px 16px)' }} />
        <div className="col" style={{ position: 'relative', alignItems: 'center', textAlign: 'center', gap: 12 }}>
          <ClubLogo club={club} size={84} />
          <h3 style={{ fontWeight: 800, fontSize: 18, lineHeight: 1.2, color: '#fff' }}>{club.club_name}</h3>
        </div>
      </div>
      <div className="pad" style={{ textAlign: 'center' }}>
        <div className="row center" style={{ gap: 6, color: 'var(--ink-faint)', fontSize: 13, justifyContent: 'center' }}>
          <I.pin style={{ width: 14, height: 14 }} />
          {club.state}
        </div>
        <div className="tag-row" style={{ marginTop: 14, justifyContent: 'center' }}>
          <span className="badge">{club.club_category === 'school' ? (lang === 0 ? 'Sekolah' : 'School') : lang === 0 ? 'Kelab' : 'Club'}</span>
          <span className="badge">
            <I.users style={{ width: 12, height: 12 }} />
            {playerCount} {translate('lbl.players', lang)}
          </span>
        </div>
      </div>
    </Link>
  );
}
