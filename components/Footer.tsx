import Link from 'next/link';
import Image from 'next/image';
import { t as translate, type Lang } from '@/lib/i18n';

export function Footer({ lang }: { lang: Lang }) {
  const cols: [string, [string, string][]][] = [
    [translate('nav.clubs', lang), [['/clubs', translate('nav.clubs', lang)], ['/players', translate('nav.players', lang)]]],
    [
      translate('nav.tournaments', lang),
      [
        ['/tournaments', translate('nav.tournaments', lang)],
        ['/standings', translate('nav.standings', lang)],
        ['/matches', translate('nav.matches', lang)],
      ],
    ],
    [lang === 0 ? 'Lain-lain' : 'More', [['/news', translate('nav.news', lang)], ['/sign-in', translate('nav.signin', lang)]]],
  ];

  return (
    <footer style={{ background: 'var(--ink)', color: '#fff', paddingTop: 64 }}>
      <div className="wrap">
        <div className="footer-grid" style={{ display: 'grid', paddingBottom: 48 }}>
          <div>
            <div className="row center" style={{ gap: 11, marginBottom: 16 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: '#fff', display: 'grid', placeItems: 'center' }}>
                <Image src="/assets/bfm-crest.png" alt="BFM" width={34} height={34} style={{ objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 24, lineHeight: 1 }}>BFM</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '.16em', color: 'var(--field-glow)' }}>BASEBALL · MALAYSIA</div>
              </div>
            </div>
            <p style={{ color: 'oklch(1 0 0 / .6)', fontSize: 15, lineHeight: 1.6, maxWidth: 300 }}>{translate('foot.tagline', lang)}</p>
          </div>
          {cols.map(([title, colLinks], i) => (
            <div key={i}>
              <div className="stat-label" style={{ color: 'var(--field-glow)', marginBottom: 16 }}>
                {title}
              </div>
              <div className="col" style={{ gap: 10 }}>
                {colLinks.map(([href, label]) => (
                  <Link key={href} href={href} style={{ color: 'oklch(1 0 0 / .7)', fontSize: 14, fontWeight: 600 }}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="seam" style={{ opacity: 0.5 }} />
        <div className="row between center" style={{ padding: '24px 0 40px', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ color: 'oklch(1 0 0 / .5)', fontSize: 13 }}>{translate('foot.rights', lang)}</span>
        </div>
      </div>
    </footer>
  );
}
