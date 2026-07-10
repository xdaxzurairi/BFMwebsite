import Link from 'next/link';
import { Countdown } from '@/components/ui/Countdown';
import { I } from '@/components/ui/icons';
import { fmt } from '@/lib/format';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Tournament } from '@/lib/types';

export function NextTournament({ lang, tournament }: { lang: Lang; tournament: Tournament | null }) {
  if (!tournament) return null;
  return (
    <section className="section" style={{ background: 'var(--field-darker)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('/assets/field.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.14 }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(115deg, transparent 0 44px, oklch(1 0 0 / .025) 44px 45px)' }} />
      <div className="wrap" style={{ position: 'relative' }}>
        <div className="row between center wrap-w" style={{ gap: 24, marginBottom: 40 }}>
          <div>
            <div className="kicker on-dark" style={{ marginBottom: 16 }}>
              {translate('sec.next', lang)}
            </div>
            <h2 className="h-lg" style={{ color: '#fff', maxWidth: 560 }}>
              {tournament.tournament_name}
            </h2>
            <div className="row center" style={{ gap: 16, marginTop: 14, color: 'oklch(1 0 0 / .75)' }}>
              <span className="row center" style={{ gap: 7 }}>
                <I.pin style={{ width: 16, height: 16 }} />
                {tournament.location}
              </span>
              <span className="row center" style={{ gap: 7 }}>
                <I.calendar style={{ width: 16, height: 16 }} />
                {fmt.dateRange(tournament.start_date, tournament.end_date, lang)}
              </span>
            </div>
          </div>
          <Link href={`/tournaments/${tournament.tournament_id}`} className="btn btn-primary btn-lg">
            {translate('cta.viewall', lang)} <I.arrow />
          </Link>
        </div>
        <div className="card" style={{ background: 'oklch(1 0 0 / .05)', border: '1px solid oklch(1 0 0 / .14)', padding: '34px 38px', backdropFilter: 'blur(4px)' }}>
          <div className="stat-label" style={{ color: 'var(--field-glow)', marginBottom: 20 }}>
            {translate('sec.countdown', lang)}
          </div>
          <Countdown target={tournament.start_date} lang={lang} />
        </div>
      </div>
    </section>
  );
}
