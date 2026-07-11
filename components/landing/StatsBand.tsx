import { Reveal } from '@/components/ui/Reveal';
import { Counter } from '@/components/ui/Counter';
import { t as translate, type Lang } from '@/lib/i18n';

export function StatsBand({ lang, counts }: { lang: Lang; counts: { clubs: number; players: number; matches: number; states: number } }) {
  const stats = [
    { n: counts.clubs, label: translate('stats.clubs', lang) },
    { n: counts.players, label: translate('stats.players', lang) },
    { n: counts.matches, label: translate('stats.matches', lang) },
    { n: counts.states, label: translate('stats.states', lang) },
  ];
  return (
    <section className="section tight">
      <div className="wrap">
        <div className="grid stats-grid">
          {stats.map((s, i) => (
            <Reveal key={i} delay={i + 1} className="col" style={{ alignItems: 'flex-start' }}>
              <span className="stat-num" style={{ color: 'var(--field)' }}>
                <Counter to={s.n} />
              </span>
              <span className="stat-label muted" style={{ marginTop: 6 }}>
                {s.label}
              </span>
              <div style={{ width: 40, height: 3, background: 'var(--clay)', marginTop: 14, borderRadius: 3 }} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
