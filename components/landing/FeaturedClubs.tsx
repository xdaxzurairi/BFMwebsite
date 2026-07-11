import Link from 'next/link';
import { Reveal } from '@/components/ui/Reveal';
import { ClubCard } from '@/components/clubs/ClubCard';
import { I } from '@/components/ui/icons';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Club } from '@/lib/types';

export function FeaturedClubs({ lang, clubs, playerCounts }: { lang: Lang; clubs: Club[]; playerCounts: Record<number, number> }) {
  const featured = clubs.slice(0, 4);
  return (
    <section className="section" style={{ background: 'var(--sand)' }}>
      <div className="wrap">
        <div className="row between center" style={{ marginBottom: 36 }}>
          <div>
            <div className="kicker" style={{ marginBottom: 14 }}>
              {translate('sec.featured', lang)}
            </div>
            <h2 className="h-lg">{lang === 0 ? 'Kelab di seluruh negara' : 'Clubs across the nation'}</h2>
          </div>
          <Link href="/clubs" className="btn btn-ghost btn-sm">
            {translate('cta.viewall', lang)} <I.arrow />
          </Link>
        </div>
        <div className="grid feat-grid">
          {featured.map((c, i) => (
            <Reveal key={c.club_id} delay={i + 1}>
              <ClubCard club={c} lang={lang} playerCount={playerCounts[c.club_id] ?? 0} />
            </Reveal>
          ))}
        </div>
        {featured.length === 0 && <p className="muted">{lang === 0 ? 'Tiada kelab lagi.' : 'No clubs yet.'}</p>}
      </div>
    </section>
  );
}
