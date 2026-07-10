import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { I } from '@/components/ui/icons';
import { TournamentDetailTabs } from '@/components/tournaments/TournamentDetailTabs';
import { getLang } from '@/lib/lang';
import { getAppUser } from '@/lib/auth';
import { getTournament, getRegistrationsForTournament, getMatches, getStandings, getClubs } from '@/lib/queries';
import { fmt } from '@/lib/format';
import { statusLbl } from '@/lib/status';
import { t as translate } from '@/lib/i18n';

export const revalidate = 60;

export default async function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tournamentId = Number(id);
  const [lang, appUser, tn] = await Promise.all([getLang(), getAppUser(), getTournament(tournamentId)]);
  if (!tn) notFound();

  const [regs, matches, standings, clubs] = await Promise.all([
    getRegistrationsForTournament(tournamentId),
    getMatches(tournamentId),
    getStandings(tournamentId),
    getClubs(),
  ]);
  const activeRegs = regs.filter((r) => r.status !== 'withdrawn');
  const approvedCount = activeRegs.filter((r) => r.status === 'approved').length;

  const meta = [
    { icon: I.calendar, label: translate('lbl.dates', lang), value: fmt.dateRange(tn.start_date, tn.end_date, lang) },
    { icon: I.pin, label: translate('lbl.venue', lang), value: tn.location },
    { icon: I.money, label: translate('lbl.entryfee', lang), value: fmt.money(tn.entry_fee, tn.currency) },
    { icon: I.trophy, label: translate('lbl.prizepool', lang), value: fmt.money(tn.prize_pool, tn.currency) },
    { icon: I.users, label: translate('lbl.teams', lang), value: `${approvedCount} / ${tn.max_teams}` },
    { icon: I.clock, label: translate('lbl.regclose', lang), value: fmt.date(tn.registration_end, lang) },
  ];

  return (
    <div>
      <div style={{ background: 'var(--field-darker)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(115deg, transparent 0 40px, oklch(1 0 0 / .025) 40px 41px)' }} />
        <div className="wrap" style={{ position: 'relative', paddingTop: 34, paddingBottom: 40 }}>
          <Link href="/tournaments" className="btn btn-ghost btn-sm on-dark" style={{ marginBottom: 22 }}>
            <I.arrowL />
            {translate('cta.back', lang)}
          </Link>
          <div className="row center" style={{ gap: 12, marginBottom: 14 }}>
            <StatusBadge status={tn.status} label={statusLbl(tn.status, lang)} />
            <span className="badge" style={{ background: 'oklch(1 0 0 / .14)', color: '#fff' }}>
              {(tn.tournament_level || '').toUpperCase()}
            </span>
            <span className="badge" style={{ background: 'oklch(1 0 0 / .14)', color: '#fff' }}>
              {(tn.tournament_category || '').toUpperCase()}
            </span>
          </div>
          <h1 className="h-xl" style={{ color: '#fff', maxWidth: 760 }}>
            {tn.tournament_name}
          </h1>
          <p style={{ color: 'oklch(1 0 0 / .8)', fontSize: 17, maxWidth: 620, marginTop: 14, lineHeight: 1.5 }}>{tn.description}</p>
          {appUser?.role === 'club_manager' && tn.status === 'upcoming' && (
            <Link href={`/dashboard/registrations?register=${tn.tournament_id}`} className="btn btn-primary btn-lg" style={{ marginTop: 24 }}>
              <I.trophy />
              {translate('cta.register', lang)}
            </Link>
          )}
        </div>
      </div>
      <div className="wrap section tight">
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', marginBottom: 36 }}>
          {meta.map((m, i) => (
            <div key={i} className="card pad">
              <m.icon style={{ width: 20, height: 20, color: 'var(--clay)' }} />
              <div className="stat-label muted" style={{ marginTop: 10 }}>
                {m.label}
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, marginTop: 3 }}>{m.value}</div>
            </div>
          ))}
        </div>
        <TournamentDetailTabs lang={lang} regs={activeRegs} matches={matches} clubs={clubs} standings={standings} />
      </div>
    </div>
  );
}
