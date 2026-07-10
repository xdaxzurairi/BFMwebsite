/* ============================================================
   BFM — App shell: context, nav, router, sign-in, footer
   ============================================================ */

/* global toast bus */
window.toast = (msg, bad) => window.dispatchEvent(new CustomEvent('bfm-toast', { detail: { msg, bad } }));

function ToastHost() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const h = (e) => {
      const id = Math.random();
      setItems((s) => [...s, { id, ...e.detail }]);
      setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 2800);
    };
    window.addEventListener('bfm-toast', h);
    return () => window.removeEventListener('bfm-toast', h);
  }, []);
  return (
    <div className="toast-wrap">
      {items.map((it) => <div key={it.id} className={`toast ${it.bad ? 'bad' : ''}`}><Diamond />{it.msg}</div>)}
    </div>
  );
}

/* ---------- persisted prefs ---------- */
function loadPrefs() {
  try { return JSON.parse(localStorage.getItem('bfm_prefs') || '{}'); } catch (e) { return {}; }
}
function savePrefs(p) { try { localStorage.setItem('bfm_prefs', JSON.stringify(p)); } catch (e) {} }

/* ---------- Nav ---------- */
function Nav() {
  const { t, lang, setLang, role, setRole, route, navigate } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h, { passive: true });
    h();
    return () => window.removeEventListener('scroll', h);
  }, []);
  useEffect(() => { setOpen(false); }, [route.name]);
  const onHero = route.name === 'home' && !scrolled;
  const links = [
    ['clubs', t('nav.clubs')], ['players', t('nav.players')], ['tournaments', t('nav.tournaments')],
    ['standings', t('nav.standings')], ['matches', t('nav.matches')], ['news', t('nav.news')],
  ];
  const go = (name, params) => { navigate(name, params); setOpen(false); };
  const authActions = (block) => role === 'user' ? (
    <Button size="sm" variant={onHero && !block ? 'ghost' : 'field'} className={`${onHero && !block ? 'on-dark' : ''} ${block ? 'btn-block' : ''}`} icon={I.user} onClick={() => go('signin')}>{t('nav.signin')}</Button>
  ) : (
    <div className={block ? 'col' : 'row center'} style={{ gap: 8 }}>
      <Button size="sm" variant={onHero && !block ? 'ghost' : 'field'} className={`${onHero && !block ? 'on-dark' : ''} ${block ? 'btn-block' : ''}`} icon={I.grid} onClick={() => go('dashboard')}>{t('nav.dashboard')}</Button>
      <button className={`btn btn-ghost btn-sm ${block ? 'btn-block' : 'btn-icon'}`} title={t('nav.signout')} style={onHero && !block ? { boxShadow: 'inset 0 0 0 2px oklch(1 0 0 / .3)', color: '#fff' } : {}} onClick={() => { setRole('user'); go('home'); }}><I.logout />{block && t('nav.signout')}</button>
    </div>
  );
  return (
    <nav className={`nav ${onHero ? 'on-hero' : ''}`}>
      <div className="wrap nav-inner">
        <div className="nav-logo" onClick={() => go('home')}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: '#fff', display: 'grid', placeItems: 'center', boxShadow: onHero ? '0 4px 14px rgba(0,0,0,.20)' : 'var(--shadow-sm)', transition: 'box-shadow .3s', flex: 'none' }}>
            <img src="assets/bfm-crest.png" alt="BFM" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          </div>
          <div style={{ lineHeight: 1.05 }}>
            <div className="nav-logo-text" style={{ fontFamily: 'var(--display)', fontSize: 15, letterSpacing: '.03em', color: onHero ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.34)' }}>Baseball Federation Malaysia</div>
          </div>
        </div>
        <div className="nav-links">
          {links.map(([k, label]) => (
            <div key={k} className={`nav-link ${route.name === k ? 'active' : ''}`} onClick={() => go(k)}>{label}</div>
          ))}
        </div>
        <div className="spacer" />
        <div className="nav-actions row center" style={{ gap: 12 }}>
          <div className="lang-toggle">
            <button className={lang === 0 ? 'active' : ''} onClick={() => setLang(0)}>BM</button>
            <button className={lang === 1 ? 'active' : ''} onClick={() => setLang(1)}>EN</button>
          </div>
          {authActions(false)}
        </div>
        <button className="nav-burger" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
          {open ? <I.x /> : <I.menu />}
        </button>
      </div>
      {open && (
        <div className="nav-mobile-panel">
          <div className="nav-links-mobile">
            {links.map(([k, label]) => (
              <div key={k} className={`nav-link-mobile ${route.name === k ? 'active' : ''}`} onClick={() => go(k)}>{label}</div>
            ))}
          </div>
          <div className="lang-toggle" style={{ margin: '14px 0' }}>
            <button className={lang === 0 ? 'active' : ''} onClick={() => setLang(0)}>BM</button>
            <button className={lang === 1 ? 'active' : ''} onClick={() => setLang(1)}>EN</button>
          </div>
          {authActions(true)}
        </div>
      )}
    </nav>
  );
}

/* ---------- Sign in ---------- */
function SignIn() {
  const { t, lang, setRole, navigate } = useApp();
  const roles = [
    { id: 'user', icon: I.user, name: t('role.user'), desc: t('signin.user.d'), tone: 'var(--field)', go: 'home' },
    { id: 'club_manager', icon: I.shield, name: t('role.club_manager'), desc: t('signin.mgr.d'), tone: 'var(--clay)', go: 'dashboard' },
    { id: 'admin', icon: I.trophy, name: t('role.admin'), desc: t('signin.admin.d'), tone: 'var(--field-deep)', go: 'dashboard' },
  ];
  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-h))', display: 'grid', placeItems: 'center', padding: '60px 20px', background: 'var(--sand)' }}>
      <div style={{ maxWidth: 760, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img src="assets/bfm-crest.png" alt="BFM" style={{ width: 64, height: 64, objectFit: 'contain', margin: '0 auto 18px' }} />
          <div className="kicker" style={{ justifyContent: 'center', marginBottom: 14 }}>{t('signin.title')}</div>
          <h1 className="h-lg">{lang === 0 ? 'Pilih peranan anda' : 'Choose your role'}</h1>
          <p className="muted" style={{ fontSize: 16, marginTop: 10, maxWidth: 460, marginInline: 'auto' }}>{t('signin.sub')}</p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          {roles.map((r) => (
            <button key={r.id} className="card hover" style={{ cursor: 'pointer', textAlign: 'left', padding: 26, border: 'none', background: 'var(--paper)' }}
              onClick={() => { setRole(r.id); navigate(r.go, r.id === 'admin' || r.id === 'club_manager' ? { section: 'overview' } : undefined); }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: r.tone, display: 'grid', placeItems: 'center', marginBottom: 16 }}><r.icon style={{ width: 26, height: 26, color: '#fff' }} /></div>
              <h3 className="h-md" style={{ marginBottom: 8 }}>{r.name}</h3>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.5 }}>{r.desc}</p>
              <div className="row center" style={{ gap: 7, marginTop: 16, color: r.tone, fontWeight: 800, fontSize: 14 }}>{lang === 0 ? 'Masuk' : 'Enter'}<I.arrow style={{ width: 16, height: 16 }} /></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  const { t, lang, navigate } = useApp();
  const cols = [
    [t('nav.clubs'), [['clubs', t('nav.clubs')], ['players', t('nav.players')]]],
    [t('nav.tournaments'), [['tournaments', t('nav.tournaments')], ['standings', t('nav.standings')], ['matches', t('nav.matches')]]],
    [lang === 0 ? 'Lain-lain' : 'More', [['news', t('nav.news')], ['signin', t('nav.signin')]]],
  ];
  return (
    <footer style={{ background: 'var(--ink)', color: '#fff', paddingTop: 64 }}>
      <div className="wrap">
        <div className="footer-grid" style={{ display: 'grid', paddingBottom: 48 }}>
          <div>
            <div className="row center" style={{ gap: 11, marginBottom: 16 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: '#fff', display: 'grid', placeItems: 'center' }}><img src="assets/bfm-crest.png" alt="BFM" style={{ width: 34, height: 34, objectFit: 'contain' }} /></div>
              <div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 24, lineHeight: 1 }}>BFM</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '.16em', color: 'var(--field-glow)' }}>BASEBALL · MALAYSIA</div>
              </div>
            </div>
            <p style={{ color: 'oklch(1 0 0 / .6)', fontSize: 15, lineHeight: 1.6, maxWidth: 300 }}>{t('foot.tagline')}</p>
          </div>
          {cols.map(([title, links], i) => (
            <div key={i}>
              <div className="stat-label" style={{ color: 'var(--field-glow)', marginBottom: 16 }}>{title}</div>
              <div className="col" style={{ gap: 10 }}>
                {links.map(([k, l]) => <div key={k} style={{ color: 'oklch(1 0 0 / .7)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate(k)} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = 'oklch(1 0 0 / .7)'}>{l}</div>)}
              </div>
            </div>
          ))}
        </div>
        <div className="seam" style={{ opacity: .5 }} />
        <div className="row between center" style={{ padding: '24px 0 40px', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ color: 'oklch(1 0 0 / .5)', fontSize: 13 }}>{t('foot.rights')}</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Router / page outlet ---------- */
function Outlet() {
  const { route, role } = useApp();
  const { name, params = {} } = route;
  switch (name) {
    case 'home': return <Landing />;
    case 'clubs': return <ClubsPage />;
    case 'club': return <ClubDetail id={params.id} />;
    case 'player': return <PlayerDetail id={params.id} />;
    case 'players': return <PlayersPage />;
    case 'tournaments': return <TournamentsPage />;
    case 'tournament': return <TournamentDetail id={params.id} />;
    case 'matches': return <MatchesPage />;
    case 'standings': return <StandingsPage />;
    case 'news': return <NewsPage />;
    case 'signin': return <SignIn />;
    case 'dashboard':
      if (role === 'admin' || role === 'technical_admin') return <AdminGate params={params} />;
      if (role === 'club_manager') return <ManagerGate params={params} />;
      return <SignIn />;
    default: return <Landing />;
  }
}
function AdminGate({ params }) {
  const [section, setSection] = useState(params.section || 'overview');
  useEffect(() => { if (params.section) setSection(params.section); }, [params.section]);
  return <AdminDashboard section={section} setSection={setSection} />;
}
function ManagerGate({ params }) {
  const [section, setSection] = useState(params.section || 'overview');
  useEffect(() => { if (params.section) setSection(params.section); }, [params.section, params.register]);
  return <ManagerDashboard section={section} setSection={setSection} extra={params} />;
}

/* ---------- App root ---------- */
function App() {
  const prefs = loadPrefs();
  const [lang, setLangState] = useState(prefs.lang ?? 0);
  const [role, setRoleState] = useState(prefs.role || 'user');
  const [heroVariant, setHeroVariantState] = useState(prefs.heroVariant ?? 0);
  const [route, setRoute] = useState(prefs.route || { name: 'home', params: {} });
  const currentClubId = 1; // demo: manager manages KL Thunderbolts

  window.__lang = lang;
  useEffect(() => { window.__lang = lang; }, [lang]);

  const persist = (patch) => savePrefs({ lang, role, heroVariant, route, ...patch });
  const setLang = (l) => { setLangState(l); persist({ lang: l }); };
  const setRole = (r) => { setRoleState(r); persist({ role: r }); };
  const setHeroVariant = (v) => { setHeroVariantState(v); persist({ heroVariant: v }); };
  const navigate = (name, params = {}) => {
    const r = { name, params };
    setRoute(r); persist({ route: r });
    window.scrollTo({ top: 0, behavior: 'auto' });
  };
  const t = (key) => { const e = BFM.DICT[key]; return e ? e[lang] : key; };

  const ctx = { lang, setLang, role, setRole, heroVariant, setHeroVariant, route, navigate, t, currentClubId };
  const noChrome = false;
  return (
    <AppCtx.Provider value={ctx}>
      <Nav />
      <div style={{ minHeight: '60vh' }}><Outlet /></div>
      {route.name !== 'signin' && <Footer />}
      <ToastHost />
    </AppCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
