import Image from 'next/image';
import Link from 'next/link';
import { Counter } from '@/components/ui/Counter';
import { t as translate, type Lang } from '@/lib/i18n';
import { I } from '@/components/ui/icons';

function MiniStat({ n, label }: { n: number; label: string }) {
  return (
    <div className="col">
      <span className="display" style={{ fontSize: 40, color: '#fff' }}>
        <Counter to={n} />
      </span>
      <span className="stat-label" style={{ color: 'var(--field-glow)', marginTop: 2 }}>
        {label}
      </span>
    </div>
  );
}

export function Hero({ lang, counts }: { lang: Lang; counts: { clubs: number; players: number; states: number } }) {
  return (
    <header className="hero-a" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: 'var(--field-darker)', display: 'flex', alignItems: 'center' }}>
      <div style={{ position: 'absolute', inset: '-12% 0 0 0', backgroundImage: "url('/assets/field.jpg')", backgroundSize: 'cover', backgroundPosition: 'center 60%' }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(102deg, oklch(0.255 0.05 154 / .96) 0%, oklch(0.30 0.06 153 / .86) 40%, oklch(0.33 0.065 153 / .55) 72%, oklch(0.40 0.08 150 / .35) 100%)',
        }}
      />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(115deg, transparent 0 38px, oklch(1 0 0 / .03) 38px 39px)' }} />
      <div className="float-orb">
        <div style={{ width: 300, height: 300, borderRadius: '50%', border: '2px solid oklch(1 0 0 / .08)' }} />
      </div>
      <div className="wrap" style={{ position: 'relative', zIndex: 2, paddingTop: 100, paddingBottom: 60 }}>
        <div className="hero-grid" style={{ display: 'grid', gap: 40, alignItems: 'center' }}>
          <div>
            <div className="kicker on-dark reveal in" style={{ marginBottom: 22 }}>
              <Image src="/assets/bfm-crest.png" alt="" width={18} height={18} style={{ objectFit: 'contain' }} />
              {translate('hero.tag', lang)}
            </div>
            <h1 className="h-xxl" style={{ color: '#fff', margin: '0 0 10px' }}>
              <div>{translate('hero.line1', lang)}</div>
              <div>
                {translate('hero.line2', lang)} <span style={{ color: 'var(--clay-bright)' }}>{translate('hero.line3', lang)}</span>
              </div>
            </h1>
            <p style={{ color: 'oklch(1 0 0 / .82)', fontSize: 19, maxWidth: 460, lineHeight: 1.5, margin: '20px 0 32px' }}>{translate('hero.sub', lang)}</p>
            <div className="row wrap-w" style={{ gap: 12 }}>
              <Link href="/tournaments" className="btn btn-primary btn-lg">
                <I.trophy /> {translate('cta.register', lang)}
              </Link>
              <Link href="/clubs" className="btn btn-ghost btn-lg on-dark">
                {translate('cta.explore', lang)} <I.arrow />
              </Link>
            </div>
            <div className="row" style={{ gap: 28, marginTop: 44 }}>
              <MiniStat n={counts.clubs} label={translate('stats.clubs', lang)} />
              <span style={{ width: 1, background: 'oklch(1 0 0 / .15)' }} />
              <MiniStat n={counts.players} label={translate('stats.players', lang)} />
              <span style={{ width: 1, background: 'oklch(1 0 0 / .15)' }} />
              <MiniStat n={counts.states} label={translate('stats.states', lang)} />
            </div>
          </div>
          <div className="hero-photo-col">
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  aspectRatio: '4/5',
                  borderRadius: 'var(--r-xl)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid oklch(1 0 0 / .25)',
                  background: 'oklch(0.99 0.006 84 / .92)',
                  backdropFilter: 'blur(8px)',
                  display: 'grid',
                  placeItems: 'center',
                  padding: '12% 14%',
                }}
              >
                <Image src="/assets/bfm-logo.png" alt="Baseball Malaysia" width={300} height={300} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div className="card pad float-card">
                <div className="kicker no-line" style={{ marginBottom: 6 }}>
                  {translate('hero.live', lang)}
                </div>
                <div className="row center" style={{ gap: 10 }}>
                  <span className="badge badge-live">
                    <span className="dot" />
                    LIVE
                  </span>
                  <span className="display" style={{ fontSize: 30 }}>
                    2026
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <div className="seam" />
      </div>
    </header>
  );
}
