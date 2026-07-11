import Link from 'next/link';
import { Reveal } from '@/components/ui/Reveal';
import { ClubLogo } from '@/components/ui/ClubLogo';
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
          {featured.map((c, i) => {
            const n = playerCounts[c.club_id] ?? 0;
            return (
              <Reveal key={c.club_id} delay={i + 1}>
                <Link href={`/clubs/${c.club_id}`} className="card hover" style={{ cursor: 'pointer', height: '100%', display: 'block' }}>
                  <div style={{ height: 90, background: c.color ?? undefined, position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 16px, oklch(1 0 0 / .07) 16px 17px)' }} />
                  </div>
                  <div className="pad" style={{ marginTop: -34 }}>
                    <ClubLogo club={c} size={56} />
                    <h3 style={{ fontWeight: 800, fontSize: 18, marginTop: 12, lineHeight: 1.15 }}>{c.club_name}</h3>
                    <div className="row center" style={{ gap: 6, color: 'var(--ink-faint)', fontSize: 13, marginTop: 4 }}>
                      <I.pin style={{ width: 14, height: 14 }} />
                      {c.state}
                    </div>
                    <div className="row center" style={{ gap: 7, marginTop: 14 }}>
                      <span className="badge">{c.club_category === 'school' ? (lang === 0 ? 'Sekolah' : 'School') : lang === 0 ? 'Kelab' : 'Club'}</span>
                      <span className="badge">
                        <I.users style={{ width: 12, height: 12 }} />
                        {n}
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
        {featured.length === 0 && <p className="muted">{lang === 0 ? 'Tiada kelab lagi.' : 'No clubs yet.'}</p>}
      </div>
    </section>
  );
}
