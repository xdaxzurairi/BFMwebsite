/* ============================================================
   BFM — Public browse pages
   Clubs · ClubDetail · Players · Tournaments · TournamentDetail
   Standings · Matches · News
   ============================================================ */

function PageHead({ kicker, title, sub, right }) {
  return (
    <div className="row between" style={{ alignItems: 'flex-end', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
      <div>
        <div className="kicker" style={{ marginBottom: 14 }}>{kicker}</div>
        <h1 className="h-lg">{title}</h1>
        {sub && <p className="muted" style={{ fontSize: 16, marginTop: 8, maxWidth: 560 }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

function BackLink({ to, params, label }) {
  const { navigate } = useApp();
  return <button className="btn btn-ghost btn-sm" style={{ marginBottom: 22 }} onClick={() => navigate(to, params)}><I.arrowL />{label}</button>;
}

/* ---------------- Clubs ---------------- */
function ClubsPage() {
  const { t, lang, navigate } = useApp();
  useStore();
  const [q, setQ] = useState('');
  const [state, setState] = useState('');
  const [cat, setCat] = useState('');
  const states = [...new Set(BFM.db.clubs.map((c) => c.state))].sort();
  const clubs = BFM.db.clubs.filter((c) => c.is_active
    && (!q || c.club_name.toLowerCase().includes(q.toLowerCase()))
    && (!state || c.state === state)
    && (!cat || c.club_category === cat));
  return (
    <div className="section wrap">
      <PageHead kicker={t('nav.clubs')} title={lang === 0 ? 'Direktori Kelab' : 'Club Directory'} sub={lang === 0 ? 'Terokai semua kelab dan sekolah yang berdaftar dengan BFM.' : 'Explore every club and school registered with the BFM.'} />
      <div className="row wrap-w" style={{ gap: 12, marginBottom: 28 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <I.search style={{ position: 'absolute', left: 14, top: 13, width: 18, height: 18, color: 'var(--ink-faint)' }} />
          <input className="input" style={{ paddingLeft: 42 }} placeholder={t('cta.search')} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={state} onChange={(e) => setState(e.target.value)} style={{ width: 'auto', minWidth: 150 }}>
          <option value="">{t('lbl.allstates')}</option>
          {states.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <div className="row" style={{ gap: 8 }}>
          {[['', t('lbl.allcat')], ['club', lang === 0 ? 'Kelab' : 'Club'], ['school', lang === 0 ? 'Sekolah' : 'School']].map(([v, l]) => (
            <button key={v} className={`chip ${cat === v ? 'active' : ''}`} onClick={() => setCat(v)}>{l}</button>
          ))}
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {clubs.map((c) => {
          const n = BFM.playersOfClub(c.club_id).length;
          return (
            <article key={c.club_id} className="card hover" style={{ cursor: 'pointer' }} onClick={() => navigate('club', { id: c.club_id })}>
              <div style={{ height: 76, background: c.color, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 15px, oklch(1 0 0 / .07) 15px 16px)' }} />
              </div>
              <div className="pad" style={{ marginTop: -30 }}>
                <ClubLogo club={c} size={52} />
                <h3 style={{ fontWeight: 800, fontSize: 17, marginTop: 12, lineHeight: 1.15 }}>{c.club_name}</h3>
                <div className="row center" style={{ gap: 6, color: 'var(--ink-faint)', fontSize: 13, marginTop: 5 }}><I.pin style={{ width: 14, height: 14 }} />{c.state}</div>
                <div className="tag-row" style={{ marginTop: 14 }}>
                  <span className="badge">{c.club_category === 'school' ? (lang === 0 ? 'Sekolah' : 'School') : (lang === 0 ? 'Kelab' : 'Club')}</span>
                  <span className="badge"><I.users style={{ width: 12, height: 12 }} />{n} {t('lbl.players')}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {clubs.length === 0 && <Empty>{lang === 0 ? 'Tiada kelab dijumpai.' : 'No clubs found.'}</Empty>}
    </div>
  );
}

/* ---------------- Club detail ---------------- */
function ClubDetail({ id }) {
  const { t, lang, navigate } = useApp();
  useStore();
  const [tab, setTab] = useState('roster');
  const c = BFM.clubById(id);
  if (!c) return <div className="section wrap"><Empty>Club not found.</Empty></div>;
  const players = BFM.playersOfClub(id);
  const officials = BFM.officialsOfClub(id);
  const teamStats = players.map((p) => BFM.playerStats(p.player_id));
  const totHits = teamStats.reduce((a, s) => a + s.total_hits, 0);
  const totRuns = teamStats.reduce((a, s) => a + s.total_runs, 0);
  return (
    <div>
      <div style={{ background: c.color, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 30px, oklch(1 0 0 / .06) 30px 31px)' }} />
        <div className="wrap" style={{ position: 'relative', paddingTop: 36, paddingBottom: 40 }}>
          <button className="btn btn-ghost btn-sm on-dark" style={{ marginBottom: 24 }} onClick={() => navigate('clubs')}><I.arrowL />{t('cta.back')}</button>
          <div className="row center wrap-w" style={{ gap: 22 }}>
            <ClubLogo club={c} size={88} />
            <div style={{ color: '#fff' }}>
              <div className="kicker on-dark" style={{ marginBottom: 8 }}>{c.club_category === 'school' ? (lang === 0 ? 'Sekolah' : 'School') : (lang === 0 ? 'Kelab' : 'Club')}</div>
              <h1 className="h-lg" style={{ color: '#fff' }}>{c.club_name}</h1>
              <div className="row center" style={{ gap: 18, marginTop: 10, color: 'oklch(1 0 0 / .85)', flexWrap: 'wrap' }}>
                <span className="row center" style={{ gap: 6 }}><I.pin style={{ width: 15, height: 15 }} />{c.state}</span>
                <span className="row center" style={{ gap: 6 }}><I.user style={{ width: 15, height: 15 }} />{c.manager_name}</span>
                <span className="row center" style={{ gap: 6 }}><I.users style={{ width: 15, height: 15 }} />{players.length} {t('lbl.players')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="wrap section tight">
        <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 30 }}>
          <StatCard label={t('lbl.players')} value={players.length} />
          <StatCard label={t('lbl.hits')} value={totHits} />
          <StatCard label={t('lbl.runs')} value={totRuns} />
        </div>
        <Tabs tabs={[{ id: 'roster', label: t('lbl.roster') }, { id: 'officials', label: t('lbl.officials') }]} value={tab} onChange={setTab} />
        <div style={{ marginTop: 24 }}>
          {tab === 'roster' && <RosterTable players={players} onPick={(p) => navigate('player', { id: p.player_id })} />}
          {tab === 'officials' && <OfficialsList officials={officials} />}
        </div>
      </div>
    </div>
  );
}
function StatCard({ label, value }) {
  return (
    <div className="card pad">
      <div className="stat-num" style={{ color: 'var(--field)', fontSize: 46 }}><Counter to={value} /></div>
      <div className="stat-label muted" style={{ marginTop: 4 }}>{label}</div>
    </div>
  );
}
function RosterTable({ players, onPick }) {
  const { t } = useApp();
  const rows = players.map((p) => ({ p, s: BFM.playerStats(p.player_id) })).sort((a, b) => b.s.batting_average - a.s.batting_average);
  return (
    <div className="card" style={{ overflowX: 'auto' }}>
      <table className="tbl">
        <thead><tr><th>{t('lbl.jersey')}</th><th>{lblName()}</th><th>{t('lbl.position')}</th><th className="num">{t('lbl.avg')}</th><th className="num">{t('lbl.hits')}</th><th className="num">{t('lbl.runs')}</th><th className="num">{t('lbl.rbi')}</th></tr></thead>
        <tbody>
          {rows.map(({ p, s }) => (
            <tr key={p.player_id} className="clickable" onClick={() => onPick(p)}>
              <td><span className="display" style={{ fontSize: 22, color: 'var(--clay)' }}>{p.jersey_number}</span></td>
              <td style={{ fontWeight: 700 }}>{p.first_name} {p.last_name}</td>
              <td className="muted">{p.position}</td>
              <td className="num">{fmt.avg(s.batting_average)}</td>
              <td className="num">{s.total_hits}</td>
              <td className="num">{s.total_runs}</td>
              <td className="num">{s.total_rbi}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <Empty>No players yet.</Empty>}
    </div>
  );
}
function lblName() { const { lang } = useApp(); return lang === 0 ? 'Nama' : 'Name'; }
function OfficialsList({ officials }) {
  const { lang } = useApp();
  if (!officials.length) return <Empty>{lang === 0 ? 'Tiada pegawai disenaraikan.' : 'No officials listed.'}</Empty>;
  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))' }}>
      {officials.map((o) => (
        <div key={o.official_id} className="card pad row center" style={{ gap: 14 }}>
          <Avatar a={o.first_name} b={o.last_name} size={48} color="var(--clay)" />
          <div>
            <div style={{ fontWeight: 800 }}>{o.first_name} {o.last_name}</div>
            <div className="muted" style={{ fontSize: 13 }}>{o.position}</div>
            <div className="badge" style={{ marginTop: 6 }}>{o.role}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Player detail ---------------- */
function PlayerDetail({ id }) {
  const { t, lang, navigate } = useApp();
  useStore();
  const p = BFM.db.players.find((x) => x.player_id === id);
  if (!p) return <div className="section wrap"><Empty>Player not found.</Empty></div>;
  const c = BFM.clubById(p.club_id);
  const s = BFM.playerStats(id);
  const stats = [
    { label: t('lbl.avg'), value: fmt.avg(s.batting_average), big: true },
    { label: t('lbl.matches'), value: s.total_matches },
    { label: t('lbl.hits'), value: s.total_hits },
    { label: t('lbl.runs'), value: s.total_runs },
    { label: t('lbl.rbi'), value: s.total_rbi },
  ];
  return (
    <div className="section wrap">
      <BackLink to="club" params={{ id: p.club_id }} label={c ? c.club_name : t('cta.back')} />
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="row wrap-w" style={{ gap: 0 }}>
          <div style={{ width: 260, flex: 'none', background: c?.color || 'var(--field)', position: 'relative', minHeight: 260 }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 22px, oklch(1 0 0 / .07) 22px 23px)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <span className="display" style={{ fontSize: 130, color: 'oklch(1 0 0 / .9)' }}>{p.jersey_number}</span>
            </div>
          </div>
          <div className="pad" style={{ flex: 1, minWidth: 280, padding: 34 }}>
            <div className="kicker" style={{ marginBottom: 12 }}>{c?.club_name}</div>
            <h1 className="h-lg">{p.first_name} {p.last_name}</h1>
            <div className="tag-row" style={{ marginTop: 14 }}>
              <span className="badge" style={{ background: 'var(--field)', color: '#fff' }}>{p.position}</span>
              <span className="badge">#{p.jersey_number}</span>
              {p.medical_clearance && <span className="badge badge-approved"><I.check style={{ width: 12, height: 12 }} />{lang === 0 ? 'Saringan Perubatan' : 'Medically Cleared'}</span>}
            </div>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(90px,1fr))', marginTop: 28, gap: 18 }}>
              {stats.map((st, i) => (
                <div key={i}>
                  <div className="display" style={{ fontSize: st.big ? 44 : 36, color: st.big ? 'var(--clay)' : 'var(--ink)' }}>{st.value}</div>
                  <div className="stat-label muted" style={{ marginTop: 2 }}>{st.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Players (league-wide leaderboard) ---------------- */
function PlayersPage() {
  const { t, lang, navigate } = useApp();
  useStore();
  const [q, setQ] = useState('');
  const [club, setClub] = useState('');
  const rows = BFM.db.players.filter((p) => p.is_active).map((p) => ({ p, c: BFM.clubById(p.club_id), s: BFM.playerStats(p.player_id) }))
    .filter(({ p, c }) => (!q || `${p.first_name} ${p.last_name}`.toLowerCase().includes(q.toLowerCase())) && (!club || String(p.club_id) === club))
    .sort((a, b) => b.s.batting_average - a.s.batting_average);
  return (
    <div className="section wrap">
      <PageHead kicker={t('nav.players')} title={lang === 0 ? 'Papan Pendahulu' : 'Leaderboard'} sub={lang === 0 ? 'Pemain terbaik mengikut purata pukulan merentas semua kelab.' : 'Top players by batting average across every club.'} />
      <div className="row wrap-w" style={{ gap: 12, marginBottom: 24 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <I.search style={{ position: 'absolute', left: 14, top: 13, width: 18, height: 18, color: 'var(--ink-faint)' }} />
          <input className="input" style={{ paddingLeft: 42 }} placeholder={t('cta.search')} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={club} onChange={(e) => setClub(e.target.value)} style={{ width: 'auto', minWidth: 180 }}>
          <option value="">{lang === 0 ? 'Semua Kelab' : 'All Clubs'}</option>
          {BFM.db.clubs.map((c) => <option key={c.club_id} value={c.club_id}>{c.club_name}</option>)}
        </Select>
      </div>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead><tr><th>#</th><th>{lang === 0 ? 'Pemain' : 'Player'}</th><th>{t('lbl.club')}</th><th>{t('lbl.position')}</th><th className="num">{t('lbl.avg')}</th><th className="num">{t('lbl.hits')}</th><th className="num">{t('lbl.runs')}</th><th className="num">{t('lbl.rbi')}</th></tr></thead>
          <tbody>
            {rows.slice(0, 50).map(({ p, c, s }, i) => (
              <tr key={p.player_id} className="clickable" onClick={() => navigate('player', { id: p.player_id })}>
                <td className="muted tnum" style={{ fontWeight: 800 }}>{i + 1}</td>
                <td><div className="row center" style={{ gap: 10 }}><Avatar a={p.first_name} b={p.last_name} size={32} color={c?.color} /><span style={{ fontWeight: 700 }}>{p.first_name} {p.last_name}</span></div></td>
                <td className="muted">{c?.club_name}</td>
                <td className="muted">{p.position}</td>
                <td className="num" style={{ color: 'var(--clay)', fontWeight: 800 }}>{fmt.avg(s.batting_average)}</td>
                <td className="num">{s.total_hits}</td>
                <td className="num">{s.total_runs}</td>
                <td className="num">{s.total_rbi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Tournaments ---------------- */
function TournamentsPage() {
  const { t, lang, navigate } = useApp();
  useStore();
  const [f, setF] = useState('all');
  const list = BFM.db.tournaments.filter((x) => f === 'all' || x.status === f).sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  const filters = [['all', lang === 0 ? 'Semua' : 'All'], ['upcoming', lang === 0 ? 'Akan Datang' : 'Upcoming'], ['ongoing', lang === 0 ? 'Berlangsung' : 'Ongoing'], ['completed', lang === 0 ? 'Selesai' : 'Completed']];
  return (
    <div className="section wrap">
      <PageHead kicker={t('nav.tournaments')} title={lang === 0 ? 'Kejohanan' : 'Tournaments'} sub={lang === 0 ? 'Pertandingan rasmi BFM sepanjang musim 2026.' : 'Official BFM competitions throughout the 2026 season.'} />
      <div className="row" style={{ gap: 8, marginBottom: 26, flexWrap: 'wrap' }}>
        {filters.map(([v, l]) => <button key={v} className={`chip ${f === v ? 'active' : ''}`} onClick={() => setF(v)}>{l}</button>)}
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))' }}>
        {list.map((tn) => <TournamentCard key={tn.tournament_id} tn={tn} onOpen={() => navigate('tournament', { id: tn.tournament_id })} />)}
      </div>
      {list.length === 0 && <Empty>{lang === 0 ? 'Tiada kejohanan.' : 'No tournaments.'}</Empty>}
    </div>
  );
}
function TournamentCard({ tn, onOpen }) {
  const { t, lang } = useApp();
  const regs = BFM.db.registrations.filter((r) => r.tournament_id === tn.tournament_id && r.status === 'approved').length;
  return (
    <article className="card hover" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onClick={onOpen}>
      <div style={{ padding: '22px 22px 0' }}>
        <div className="row between center" style={{ marginBottom: 14 }}>
          <StatusBadge status={tn.status} label={statusLbl(tn.status, lang)} />
          <span className="badge">{(tn.tournament_level || '').toUpperCase()}</span>
        </div>
        <h3 className="h-md" style={{ lineHeight: 1.15, marginBottom: 10 }}>{tn.tournament_name}</h3>
        <p className="muted" style={{ fontSize: 14, lineHeight: 1.5, minHeight: 42 }}>{tn.description}</p>
      </div>
      <div className="pad" style={{ marginTop: 'auto' }}>
        <div className="row" style={{ gap: 16, color: 'var(--ink-soft)', fontSize: 13, flexWrap: 'wrap' }}>
          <span className="row center" style={{ gap: 6 }}><I.calendar style={{ width: 15, height: 15 }} />{fmt.date(tn.start_date, lang)}</span>
          <span className="row center" style={{ gap: 6 }}><I.pin style={{ width: 15, height: 15 }} />{tn.location.split(',')[0]}</span>
        </div>
        <div className="row between center" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line-soft)' }}>
          <span className="badge"><I.users style={{ width: 12, height: 12 }} />{regs}/{tn.max_teams} {t('lbl.teams')}</span>
          <span style={{ fontWeight: 800, color: 'var(--field)' }}>{fmt.money(tn.entry_fee, tn.currency)}</span>
        </div>
      </div>
    </article>
  );
}
function statusLbl(s, lang) {
  const m = { upcoming: ['Akan Datang', 'Upcoming'], ongoing: ['Berlangsung', 'Ongoing'], completed: ['Selesai', 'Completed'], cancelled: ['Batal', 'Cancelled'],
    scheduled: ['Dijadual', 'Scheduled'], live: ['Langsung', 'Live'], postponed: ['Ditangguh', 'Postponed'],
    pending: ['Menunggu', 'Pending'], approved: ['Lulus', 'Approved'], rejected: ['Ditolak', 'Rejected'], withdrawn: ['Tarik Diri', 'Withdrawn'],
    completed_pay: ['Selesai', 'Completed'], failed: ['Gagal', 'Failed'], refunded: ['Dipulang', 'Refunded'] };
  return (m[s] || [s, s])[lang];
}

/* ---------------- Tournament detail ---------------- */
function TournamentDetail({ id }) {
  const { t, lang, navigate, role } = useApp();
  useStore();
  const [tab, setTab] = useState('teams');
  const tn = BFM.tournamentById(id);
  if (!tn) return <div className="section wrap"><Empty>Not found.</Empty></div>;
  const regs = BFM.db.registrations.filter((r) => r.tournament_id === id && r.status !== 'withdrawn');
  const matches = BFM.db.matches.filter((m) => m.tournament_id === id);
  const standings = BFM.standingsFor(id);
  const meta = [
    { icon: I.calendar, label: t('lbl.dates'), value: fmt.dateRange(tn.start_date, tn.end_date, lang) },
    { icon: I.pin, label: t('lbl.venue'), value: tn.location },
    { icon: I.money, label: t('lbl.entryfee'), value: fmt.money(tn.entry_fee, tn.currency) },
    { icon: I.trophy, label: t('lbl.prizepool'), value: fmt.money(tn.prize_pool, tn.currency) },
    { icon: I.users, label: t('lbl.teams'), value: `${regs.filter((r) => r.status === 'approved').length} / ${tn.max_teams}` },
    { icon: I.clock, label: t('lbl.regclose'), value: fmt.date(tn.registration_end, lang) },
  ];
  return (
    <div>
      <div style={{ background: 'var(--field-darker)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(115deg, transparent 0 40px, oklch(1 0 0 / .025) 40px 41px)' }} />
        <div className="wrap" style={{ position: 'relative', paddingTop: 34, paddingBottom: 40 }}>
          <button className="btn btn-ghost btn-sm on-dark" style={{ marginBottom: 22 }} onClick={() => navigate('tournaments')}><I.arrowL />{t('cta.back')}</button>
          <div className="row center" style={{ gap: 12, marginBottom: 14 }}>
            <StatusBadge status={tn.status} label={statusLbl(tn.status, lang)} />
            <span className="badge" style={{ background: 'oklch(1 0 0 / .14)', color: '#fff' }}>{(tn.tournament_level || '').toUpperCase()}</span>
            <span className="badge" style={{ background: 'oklch(1 0 0 / .14)', color: '#fff' }}>{(tn.tournament_category || '').toUpperCase()}</span>
          </div>
          <h1 className="h-xl" style={{ color: '#fff', maxWidth: 760 }}>{tn.tournament_name}</h1>
          <p style={{ color: 'oklch(1 0 0 / .8)', fontSize: 17, maxWidth: 620, marginTop: 14, lineHeight: 1.5 }}>{tn.description}</p>
          {role === 'club_manager' && tn.status === 'upcoming' && (
            <Button variant="primary" size="lg" icon={I.trophy} style={{ marginTop: 24 }} onClick={() => navigate('dashboard', { section: 'myregs', register: id })}>{t('cta.register')}</Button>
          )}
        </div>
      </div>
      <div className="wrap section tight">
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', marginBottom: 36 }}>
          {meta.map((m, i) => (
            <div key={i} className="card pad">
              <m.icon style={{ width: 20, height: 20, color: 'var(--clay)' }} />
              <div className="stat-label muted" style={{ marginTop: 10 }}>{m.label}</div>
              <div style={{ fontWeight: 800, fontSize: 15, marginTop: 3 }}>{m.value}</div>
            </div>
          ))}
        </div>
        <Tabs tabs={[{ id: 'teams', label: `${t('lbl.teams')} (${regs.length})` }, { id: 'matches', label: `${t('nav.matches')} (${matches.length})` }, { id: 'standings', label: t('nav.standings') }]} value={tab} onChange={setTab} />
        <div style={{ marginTop: 24 }}>
          {tab === 'teams' && <TeamsGrid regs={regs} />}
          {tab === 'matches' && <MatchList matches={matches} />}
          {tab === 'standings' && <StandingsTable standings={standings} />}
        </div>
      </div>
    </div>
  );
}
function TeamsGrid({ regs }) {
  const { lang, navigate } = useApp();
  if (!regs.length) return <Empty>{lang === 0 ? 'Belum ada pasukan mendaftar.' : 'No teams registered yet.'}</Empty>;
  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))' }}>
      {regs.map((r) => {
        const c = BFM.clubById(r.club_id);
        return (
          <div key={r.registration_id} className="card pad row center" style={{ gap: 13, cursor: 'pointer' }} onClick={() => navigate('club', { id: c.club_id })}>
            <ClubLogo club={c} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.1 }}>{c.club_name}</div>
              <div className="muted" style={{ fontSize: 12 }}>{c.state}</div>
            </div>
            <StatusBadge status={r.status} label={statusLbl(r.status, lang)} />
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Matches (global + list) ---------------- */
function MatchList({ matches }) {
  const { lang } = useApp();
  if (!matches.length) return <Empty>{lang === 0 ? 'Tiada perlawanan dijadualkan.' : 'No matches scheduled.'}</Empty>;
  const sorted = [...matches].sort((a, b) => new Date(a.match_date) - new Date(b.match_date));
  return (
    <div className="col" style={{ gap: 12 }}>
      {sorted.map((m) => {
        const h = BFM.clubById(m.home_team_id), a = BFM.clubById(m.away_team_id);
        const done = m.status === 'completed';
        return (
          <div key={m.match_id} className="card pad">
            <div className="row between center" style={{ marginBottom: 12 }}>
              <span className="badge">{m.round_name || m.match_number}</span>
              <span className="muted" style={{ fontSize: 13 }}>{fmt.time(m.match_date)}</span>
            </div>
            <div className="row center" style={{ gap: 16 }}>
              <div className="row center" style={{ gap: 11, flex: 1, justifyContent: 'flex-end' }}>
                <span style={{ fontWeight: 800, textAlign: 'right' }}>{h.club_name}</span><ClubLogo club={h} size={38} />
              </div>
              <div className="row center" style={{ gap: 10, minWidth: 110, justifyContent: 'center' }}>
                {done ? (
                  <>
                    <span className="display" style={{ fontSize: 34, color: m.home_score >= m.away_score ? 'var(--field)' : 'var(--ink-faint)' }}>{m.home_score}</span>
                    <span className="muted">–</span>
                    <span className="display" style={{ fontSize: 34, color: m.away_score >= m.home_score ? 'var(--field)' : 'var(--ink-faint)' }}>{m.away_score}</span>
                  </>
                ) : <StatusBadge status={m.status} label={statusLbl(m.status, lang)} />}
              </div>
              <div className="row center" style={{ gap: 11, flex: 1 }}>
                <ClubLogo club={a} size={38} /><span style={{ fontWeight: 800 }}>{a.club_name}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
function MatchesPage() {
  const { t, lang } = useApp();
  useStore();
  const [tid, setTid] = useState('');
  const matches = BFM.db.matches.filter((m) => !tid || String(m.tournament_id) === tid);
  return (
    <div className="section wrap">
      <PageHead kicker={t('nav.matches')} title={lang === 0 ? 'Perlawanan' : 'Match Centre'} sub={lang === 0 ? 'Jadual dan keputusan dari semua kejohanan.' : 'Schedule and results across all tournaments.'}
        right={<Select value={tid} onChange={(e) => setTid(e.target.value)} style={{ width: 'auto', minWidth: 200 }}><option value="">{lang === 0 ? 'Semua Kejohanan' : 'All Tournaments'}</option>{BFM.db.tournaments.map((tn) => <option key={tn.tournament_id} value={tn.tournament_id}>{tn.tournament_name}</option>)}</Select>} />
      <MatchList matches={matches} />
    </div>
  );
}

/* ---------------- Standings ---------------- */
function StandingsTable({ standings }) {
  const { t, lang, navigate } = useApp();
  if (!standings.length) return <Empty>{lang === 0 ? 'Kedudukan akan dikemas kini selepas perlawanan dimainkan.' : 'Standings update once matches are played.'}</Empty>;
  return (
    <div className="card" style={{ overflowX: 'auto' }}>
      <table className="tbl">
        <thead><tr><th>{t('tbl.pos')}</th><th>{t('tbl.team')}</th><th className="num">{t('tbl.p')}</th><th className="num">{t('tbl.w')}</th><th className="num">{t('tbl.l')}</th><th className="num">{t('tbl.d')}</th><th className="num">{t('tbl.rd')}</th><th className="num">{t('tbl.pts')}</th></tr></thead>
        <tbody>
          {standings.map((s, i) => {
            const c = BFM.clubById(s.club_id);
            return (
              <tr key={s.club_id} className="clickable" onClick={() => navigate('club', { id: s.club_id })}>
                <td><span className="display" style={{ fontSize: 22, color: i === 0 ? 'var(--clay)' : 'var(--ink-faint)' }}>{i + 1}</span></td>
                <td><div className="row center" style={{ gap: 10 }}><ClubLogo club={c} size={30} /><span style={{ fontWeight: 700 }}>{c.club_name}</span></div></td>
                <td className="num">{s.mp}</td><td className="num">{s.w}</td><td className="num">{s.l}</td><td className="num">{s.d}</td>
                <td className="num" style={{ color: s.rd >= 0 ? 'var(--field)' : 'var(--bad)' }}>{s.rd > 0 ? '+' : ''}{s.rd}</td>
                <td className="num" style={{ fontWeight: 800, fontSize: 16 }}>{s.pts}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
function StandingsPage() {
  const { t, lang } = useApp();
  useStore();
  const withMatches = BFM.db.tournaments.filter((tn) => BFM.db.matches.some((m) => m.tournament_id === tn.tournament_id && m.status === 'completed'));
  const [tid, setTid] = useState(withMatches[0]?.tournament_id || null);
  const standings = tid ? BFM.standingsFor(tid) : [];
  return (
    <div className="section wrap">
      <PageHead kicker={t('nav.standings')} title={lang === 0 ? 'Kedudukan Liga' : 'League Standings'}
        right={withMatches.length > 0 && <Select value={tid || ''} onChange={(e) => setTid(Number(e.target.value))} style={{ width: 'auto', minWidth: 220 }}>{withMatches.map((tn) => <option key={tn.tournament_id} value={tn.tournament_id}>{tn.tournament_name}</option>)}</Select>} />
      {withMatches.length === 0 ? <Empty>{lang === 0 ? 'Tiada keputusan lagi musim ini.' : 'No results yet this season.'}</Empty> : <StandingsTable standings={standings} />}
    </div>
  );
}

/* ---------------- News page ---------------- */
function NewsPage() {
  const { t, lang } = useApp();
  return (
    <div className="section wrap">
      <PageHead kicker={t('nav.news')} title={lang === 0 ? 'Berita & Pengumuman' : 'News & Announcements'} />
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))' }}>
        {BFM.db.news.map((nw) => (
          <article key={nw.id} className="card hover">
            <Photo label="NEWS IMAGE" style={{ height: 170 }} />
            <div className="pad">
              <div className="row center" style={{ gap: 10, marginBottom: 10 }}>
                <span className="badge" style={{ background: 'var(--field)', color: '#fff' }}>{lang === 0 ? nw.cat_bm : nw.cat_en}</span>
                <span className="muted" style={{ fontSize: 13 }}>{fmt.date(nw.date, lang)}</span>
              </div>
              <h3 style={{ fontWeight: 800, fontSize: 18, lineHeight: 1.2, marginBottom: 8 }}>{lang === 0 ? nw.title_bm : nw.title_en}</h3>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.55 }}>{lang === 0 ? nw.body_bm : nw.body_en}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, {
  PageHead, BackLink, statusLbl, StatusBadge, MatchList, StandingsTable,
  ClubsPage, ClubDetail, PlayerDetail, PlayersPage, TournamentsPage, TournamentDetail,
  MatchesPage, StandingsPage, NewsPage,
});
