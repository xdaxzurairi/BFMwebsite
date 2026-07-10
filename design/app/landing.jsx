/* ============================================================
   BFM — Landing page (3 hero variants + motion)
   ============================================================ */
const { useState: useStateL, useEffect: useEffectL, useRef: useRefL } = React;

/* parallax hook */
function useParallax(factor = 0.25) {
  const ref = useRefL(null);
  useEffectL(() => {
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        if (ref.current) ref.current.style.transform = `translate3d(0, ${window.scrollY * factor}px, 0)`;
        raf = null;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [factor]);
  return ref;
}

/* ---------------- HERO A — Stadium ---------------- */
function HeroStadium() {
  const { t, lang, navigate } = useApp();
  const bgRef = useParallax(0.18);
  const orbRef = useParallax(-0.12);
  return (
    <header className="hero-a" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: 'var(--field-darker)', display: 'flex', alignItems: 'center' }}>
      <div ref={bgRef} style={{ position: 'absolute', inset: '-12% 0 0 0', backgroundImage: `url(${BFM_ASSETS.field})`, backgroundSize: 'cover', backgroundPosition: 'center 60%' }} />
      <div style={{ position: 'absolute', inset: 0, background:
        'linear-gradient(102deg, oklch(0.255 0.05 154 / .96) 0%, oklch(0.30 0.06 153 / .86) 40%, oklch(0.33 0.065 153 / .55) 72%, oklch(0.40 0.08 150 / .35) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(115deg, transparent 0 38px, oklch(1 0 0 / .03) 38px 39px)' }} />
      <div ref={orbRef} className="float-orb" style={{ position: 'absolute', top: '12%', right: '-4%', width: 480, height: 480, borderRadius: '50%', border: '2px solid oklch(1 0 0 / .10)', display: 'grid', placeItems: 'center' }}>
        <div style={{ width: 300, height: 300, borderRadius: '50%', border: '2px solid oklch(1 0 0 / .08)' }} />
      </div>
      <div className="wrap" style={{ position: 'relative', zIndex: 2, paddingTop: 100, paddingBottom: 60 }}>
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.15fr .85fr', gap: 40, alignItems: 'center' }}>
          <div>
            <div className="kicker on-dark reveal in" style={{ marginBottom: 22 }}><img src={BFM_ASSETS.crest} style={{ width: 18, height: 18, objectFit: 'contain' }} />{t('hero.tag')}</div>
            <h1 className="h-xxl" style={{ color: '#fff', margin: '0 0 10px' }}>
              <div>{t('hero.line1')}</div>
              <div>{t('hero.line2')} <span style={{ color: 'var(--clay-bright)' }}>{t('hero.line3')}</span></div>
            </h1>
            <p style={{ color: 'oklch(1 0 0 / .82)', fontSize: 19, maxWidth: 460, lineHeight: 1.5, margin: '20px 0 32px' }}>{t('hero.sub')}</p>
            <div className="row wrap-w" style={{ gap: 12 }}>
              <Button variant="primary" size="lg" icon={I.trophy} onClick={() => navigate('tournaments')}>{t('cta.register')}</Button>
              <Button variant="ghost" size="lg" className="on-dark" icon={I.arrow} iconRight onClick={() => navigate('clubs')}>{t('cta.explore')}</Button>
            </div>
            <div className="row" style={{ gap: 28, marginTop: 44 }}>
              <MiniStat n={BFM.db.clubs.length} label={t('stats.clubs')} />
              <span style={{ width: 1, background: 'oklch(1 0 0 / .15)' }} />
              <MiniStat n={BFM.db.players.length} label={t('stats.players')} />
              <span style={{ width: 1, background: 'oklch(1 0 0 / .15)' }} />
              <MiniStat n={new Set(BFM.db.clubs.map((c) => c.state)).size} label={t('stats.states')} />
            </div>
          </div>
          <div className="hero-photo-col">
            <div style={{ position: 'relative' }}>
              <div style={{ aspectRatio: '4/5', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-lg)', border: '1px solid oklch(1 0 0 / .25)', background: 'oklch(0.99 0.006 84 / .92)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: '12% 14%' }}>
                <img src={BFM_ASSETS.logo} alt="Baseball Malaysia" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div className="card pad float-card" style={{ position: 'absolute', left: -28, bottom: -74, width: 210, animation: 'floaty 6s ease-in-out infinite' }}>
                <div className="kicker no-line" style={{ marginBottom: 6 }}>{t('hero.live')}</div>
                <div className="row center" style={{ gap: 10 }}>
                  <span className="badge badge-live"><span className="dot" />LIVE</span>
                  <span className="display" style={{ fontSize: 30 }}>2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}><div className="seam" /></div>
    </header>
  );
}
function MiniStat({ n, label }) {
  return (
    <div className="col">
      <span className="display" style={{ fontSize: 40, color: '#fff' }}><Counter to={n} /></span>
      <span className="stat-label" style={{ color: 'var(--field-glow)', marginTop: 2 }}>{label}</span>
    </div>
  );
}

/* ---------------- HERO B — Split diamond ---------------- */
function HeroSplit() {
  const { t, navigate } = useApp();
  const dref = useParallax(-0.08);
  return (
    <header className="hero-b" style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <div className="hero-b-left" style={{ background: 'var(--cream)', display: 'flex', alignItems: 'center', padding: '120px 6vw 60px' }}>
        <div>
          <div className="kicker" style={{ marginBottom: 22 }}>{t('hero.tag')}</div>
          <h1 className="h-xxl" style={{ margin: '0 0 18px' }}>
            {t('hero.line1')}<br />{t('hero.line2')} <span style={{ color: 'var(--clay)' }}>{t('hero.line3')}</span>
          </h1>
          <p className="muted" style={{ fontSize: 19, maxWidth: 440, lineHeight: 1.5, marginBottom: 30 }}>{t('hero.sub')}</p>
          <div className="row wrap-w" style={{ gap: 12 }}>
            <Button variant="field" size="lg" icon={I.trophy} onClick={() => navigate('tournaments')}>{t('cta.register')}</Button>
            <Button variant="ghost" size="lg" icon={I.arrow} iconRight onClick={() => navigate('clubs')}>{t('cta.explore')}</Button>
          </div>
        </div>
      </div>
      <div className="hero-b-right" style={{ background: 'var(--field-darker)', position: 'relative', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 40px, oklch(1 0 0 / .03) 40px 41px)' }} />
        <div ref={dref} style={{ width: '62%', maxWidth: 420, aspectRatio: '1', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, transform: 'rotate(45deg)', borderRadius: 24, background: 'linear-gradient(150deg, var(--field-bright), var(--field-deep))', boxShadow: 'var(--shadow-lg)' }} />
          <div style={{ position: 'absolute', inset: '18%', transform: 'rotate(45deg)', borderRadius: 16, border: '2px dashed oklch(1 0 0 / .35)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <div style={{ width: '46%', aspectRatio: '1', borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow-lg)' }}>
              <img src={BFM_ASSETS.crest} alt="BFM" style={{ width: '64%', height: '64%', objectFit: 'contain' }} />
            </div>
          </div>
        </div>
        <div className="card pad" style={{ position: 'absolute', bottom: 40, left: 40, right: 40 }}>
          <div className="kicker no-line" style={{ marginBottom: 10 }}>{t('hero.live')}</div>
          <div className="row between center">
            <MiniStatDark n={BFM.db.clubs.length} label={t('stats.clubs')} />
            <MiniStatDark n={BFM.db.players.length} label={t('stats.players')} />
            <MiniStatDark n={BFM.db.tournaments.length} label={t('nav.tournaments')} />
          </div>
        </div>
      </div>
    </header>
  );
}
function MiniStatDark({ n, label }) {
  return (
    <div className="col">
      <span className="display" style={{ fontSize: 34 }}><Counter to={n} /></span>
      <span className="stat-label muted" style={{ marginTop: 2 }}>{label}</span>
    </div>
  );
}

/* ---------------- HERO C — Bold type ---------------- */
function HeroType() {
  const { t, navigate } = useApp();
  const clubs = BFM.db.clubs;
  const marq = [...clubs, ...clubs];
  return (
    <header className="hero-c" style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#fff' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${BFM_ASSETS.field})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, oklch(0.30 0.06 153 / .82), oklch(0.255 0.05 154 / .9)), radial-gradient(60% 50% at 50% 40%, oklch(0.55 0.12 150 / .35), transparent 70%)' }} />
      <div className="marquee" style={{ position: 'absolute', top: '13%', left: 0, right: 0, opacity: .14 }}>
        <div className="marquee-track">{marq.map((c, i) => <span key={i} className="marquee-item" style={{ color: '#fff' }}>{c.club_name}<Diamond cls="" style={{ background: '#fff' }} /></span>)}</div>
      </div>
      <div className="wrap" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <img src={BFM_ASSETS.crest} alt="BFM" style={{ width: 72, height: 72, objectFit: 'contain', margin: '0 auto 18px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.3))' }} />
        <div className="kicker on-dark" style={{ justifyContent: 'center', marginBottom: 24 }}>{t('hero.tag')}</div>
        <h1 style={{ fontFamily: 'var(--sans)', fontWeight: 900, fontSize: 'clamp(54px, 11vw, 170px)', lineHeight: .9, textTransform: 'uppercase', margin: 0, letterSpacing: '-.03em' }}>
          {t('hero.line1')}<br /><span style={{ WebkitTextStroke: '2px #fff', color: 'transparent' }}>{t('hero.line2')}</span> <span style={{ color: 'var(--clay-bright)' }}>{t('hero.line3')}</span>
        </h1>
        <p style={{ color: 'oklch(1 0 0 / .85)', fontSize: 20, maxWidth: 540, margin: '28px auto 34px', lineHeight: 1.5 }}>{t('hero.sub')}</p>
        <div className="row wrap-w" style={{ gap: 12, justifyContent: 'center' }}>
          <Button variant="primary" size="lg" icon={I.trophy} onClick={() => navigate('tournaments')}>{t('cta.register')}</Button>
          <Button variant="ghost" size="lg" className="on-dark" icon={I.arrow} iconRight onClick={() => navigate('clubs')}>{t('cta.explore')}</Button>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}><div className="seam" /></div>
    </header>
  );
}

/* ---------------- Marquee ticker ---------------- */
function Ticker() {
  const items = BFM.db.matches.filter((m) => m.status === 'completed').map((m) => {
    const h = BFM.clubById(m.home_team_id), a = BFM.clubById(m.away_team_id);
    return `${h.club_name} ${m.home_score}–${m.away_score} ${a.club_name}`;
  });
  const pool = items.length ? [...items, ...items, ...items] : [];
  return (
    <div className="marquee" style={{ background: 'var(--ink)', color: '#fff', padding: '14px 0' }}>
      <div className="marquee-track">
        {pool.map((s, i) => <span key={i} className="marquee-item" style={{ fontSize: 18 }}>{s}<Diamond cls="" style={{ background: 'var(--clay-bright)' }} /></span>)}
      </div>
    </div>
  );
}

/* ---------------- Stats band ---------------- */
function StatsBand() {
  const { t } = useApp();
  const stats = [
    { n: BFM.db.clubs.length, label: t('stats.clubs') },
    { n: BFM.db.players.length, label: t('stats.players') },
    { n: BFM.db.matches.filter((m) => m.status === 'completed').length, label: t('stats.matches') },
    { n: new Set(BFM.db.clubs.map((c) => c.state)).size, label: t('stats.states') },
  ];
  return (
    <section className="section tight">
      <div className="wrap">
        <div className="grid stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
          {stats.map((s, i) => (
            <Reveal key={i} delay={i + 1} className="col" style={{ alignItems: 'flex-start' }}>
              <span className="stat-num" style={{ color: 'var(--field)' }}><Counter to={s.n} /></span>
              <span className="stat-label muted" style={{ marginTop: 6 }}>{s.label}</span>
              <div style={{ width: 40, height: 3, background: 'var(--clay)', marginTop: 14, borderRadius: 3 }} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Next tournament ---------------- */
function NextTournament() {
  const { t, lang, navigate } = useApp();
  const upcoming = BFM.db.tournaments.filter((x) => x.status === 'upcoming').sort((a, b) => new Date(a.start_date) - new Date(b.start_date))[0];
  if (!upcoming) return null;
  return (
    <section className="section" style={{ background: 'var(--field-darker)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${BFM_ASSETS.field})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: .14 }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(115deg, transparent 0 44px, oklch(1 0 0 / .025) 44px 45px)' }} />
      <div className="wrap" style={{ position: 'relative' }}>
        <div className="row between center wrap-w" style={{ gap: 24, marginBottom: 40 }}>
          <div>
            <div className="kicker on-dark" style={{ marginBottom: 16 }}>{t('sec.next')}</div>
            <h2 className="h-lg" style={{ color: '#fff', maxWidth: 560 }}>{upcoming.tournament_name}</h2>
            <div className="row center" style={{ gap: 16, marginTop: 14, color: 'oklch(1 0 0 / .75)' }}>
              <span className="row center" style={{ gap: 7 }}><I.pin style={{ width: 16, height: 16 }} />{upcoming.location}</span>
              <span className="row center" style={{ gap: 7 }}><I.calendar style={{ width: 16, height: 16 }} />{fmt.dateRange(upcoming.start_date, upcoming.end_date, lang)}</span>
            </div>
          </div>
          <Button variant="primary" size="lg" icon={I.arrow} iconRight onClick={() => navigate('tournament', { id: upcoming.tournament_id })}>{t('cta.viewall')}</Button>
        </div>
        <div className="card" style={{ background: 'oklch(1 0 0 / .05)', border: '1px solid oklch(1 0 0 / .14)', padding: '34px 38px', backdropFilter: 'blur(4px)' }}>
          <div className="stat-label" style={{ color: 'var(--field-glow)', marginBottom: 20 }}>{t('sec.countdown')}</div>
          <Countdown target={upcoming.start_date} lang={lang} t={t} />
        </div>
      </div>
    </section>
  );
}

/* ---------------- News ---------------- */
function NewsSection() {
  const { t, lang, navigate } = useApp();
  const news = BFM.db.news;
  return (
    <section className="section">
      <div className="wrap">
        <div className="row between center" style={{ marginBottom: 36 }}>
          <div><div className="kicker" style={{ marginBottom: 14 }}>{t('sec.news')}</div><h2 className="h-lg">{lang === 0 ? 'Apa yang terkini' : "What's happening"}</h2></div>
          <Button variant="ghost" size="sm" icon={I.arrow} iconRight onClick={() => navigate('news')}>{t('cta.viewall')}</Button>
        </div>
        <div className="grid news-grid" style={{ gridTemplateColumns: '1.4fr 1fr 1fr' }}>
          {news.slice(0, 3).map((nw, i) => (
            <Reveal key={nw.id} delay={i + 1}>
              <article className="card hover" style={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate('news')}>
                <Photo label="NEWS IMAGE" style={{ height: i === 0 ? 220 : 150 }} />
                <div className="pad">
                  <div className="row center" style={{ gap: 10, marginBottom: 10 }}>
                    <span className="badge" style={{ background: 'var(--field)', color: '#fff' }}>{lang === 0 ? nw.cat_bm : nw.cat_en}</span>
                    <span className="muted" style={{ fontSize: 13 }}>{fmt.date(nw.date, lang)}</span>
                  </div>
                  <h3 className={i === 0 ? 'h-md' : ''} style={{ fontWeight: 800, fontSize: i === 0 ? 22 : 17, lineHeight: 1.2, marginBottom: 8 }}>{lang === 0 ? nw.title_bm : nw.title_en}</h3>
                  <p className="muted" style={{ fontSize: 14, lineHeight: 1.5 }}>{lang === 0 ? nw.body_bm : nw.body_en}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Featured clubs ---------------- */
function FeaturedClubs() {
  const { t, lang, navigate } = useApp();
  const clubs = BFM.db.clubs.slice(0, 4);
  return (
    <section className="section" style={{ background: 'var(--sand)' }}>
      <div className="wrap">
        <div className="row between center" style={{ marginBottom: 36 }}>
          <div><div className="kicker" style={{ marginBottom: 14 }}>{t('sec.featured')}</div><h2 className="h-lg">{lang === 0 ? 'Kelab di seluruh negara' : 'Clubs across the nation'}</h2></div>
          <Button variant="ghost" size="sm" icon={I.arrow} iconRight onClick={() => navigate('clubs')}>{t('cta.viewall')}</Button>
        </div>
        <div className="grid feat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
          {clubs.map((c, i) => {
            const n = BFM.playersOfClub(c.club_id).length;
            return (
              <Reveal key={c.club_id} delay={i + 1}>
                <article className="card hover" style={{ cursor: 'pointer', height: '100%' }} onClick={() => navigate('club', { id: c.club_id })}>
                  <div style={{ height: 90, background: c.color, position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 16px, oklch(1 0 0 / .07) 16px 17px)' }} />
                  </div>
                  <div className="pad" style={{ marginTop: -34 }}>
                    <ClubLogo club={c} size={56} />
                    <h3 style={{ fontWeight: 800, fontSize: 18, marginTop: 12, lineHeight: 1.15 }}>{c.club_name}</h3>
                    <div className="row center" style={{ gap: 6, color: 'var(--ink-faint)', fontSize: 13, marginTop: 4 }}><I.pin style={{ width: 14, height: 14 }} />{c.state}</div>
                    <div className="row center" style={{ gap: 7, marginTop: 14 }}>
                      <span className="badge">{c.club_category === 'school' ? (lang === 0 ? 'Sekolah' : 'School') : (lang === 0 ? 'Kelab' : 'Club')}</span>
                      <span className="badge"><I.users style={{ width: 12, height: 12 }} />{n}</span>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Join CTA ---------------- */
function JoinCTA() {
  const { t, navigate } = useApp();
  return (
    <section className="section">
      <div className="wrap">
        <div className="card" style={{ background: 'var(--clay)', color: '#fff', padding: '60px 7vw', textAlign: 'center', position: 'relative', overflow: 'hidden', borderColor: 'transparent' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 30px, oklch(1 0 0 / .05) 30px 31px)' }} />
          <div style={{ position: 'relative' }}>
            <Diamond style={{ background: '#fff', width: 18, height: 18, margin: '0 auto 22px' }} />
            <h2 className="h-xl" style={{ color: '#fff', maxWidth: 720, margin: '0 auto 16px' }}>{t('sec.join.title')}</h2>
            <p style={{ color: 'oklch(1 0 0 / .9)', fontSize: 19, maxWidth: 560, margin: '0 auto 30px', lineHeight: 1.5 }}>{t('sec.join.sub')}</p>
            <Button size="lg" icon={I.shield} onClick={() => navigate('signin')} style={{ background: '#fff', color: 'var(--clay-deep)' }}>{t('nav.signin')}</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- hero switcher ---------------- */
function HeroSwitch() {
  const { heroVariant, setHeroVariant, lang } = useApp();
  const labels = ['Stadium', 'Diamond', 'Bold'];
  return (
    <div className="hero-switch" style={{ position: 'absolute', bottom: 22, right: 28, zIndex: 5, display: 'flex', alignItems: 'center', gap: 8, background: 'oklch(0.2 0.02 152 / .5)', backdropFilter: 'blur(8px)', padding: '7px 7px 7px 14px', borderRadius: 999, border: '1px solid oklch(1 0 0 / .18)' }}>
      <span className="stat-label" style={{ color: 'oklch(1 0 0 / .7)', fontSize: 10 }}>{lang === 0 ? 'Reka' : 'Layout'}</span>
      {labels.map((l, i) => (
        <button key={i} onClick={() => setHeroVariant(i)} className="chip" style={{ padding: '5px 11px', fontSize: 12, background: heroVariant === i ? '#fff' : 'transparent', color: heroVariant === i ? 'var(--ink)' : 'oklch(1 0 0 / .8)', borderColor: heroVariant === i ? '#fff' : 'oklch(1 0 0 / .25)' }}>{l}</button>
      ))}
    </div>
  );
}

/* ---------------- Landing ---------------- */
function Landing() {
  const { heroVariant } = useApp();
  const Hero = [HeroStadium, HeroSplit, HeroType][heroVariant] || HeroStadium;
  return (
    <div>
      <div style={{ position: 'relative' }}>
        <Hero />
        <HeroSwitch />
      </div>
      <Ticker />
      <StatsBand />
      <NextTournament />
      <FeaturedClubs />
      <NewsSection />
      <JoinCTA />
    </div>
  );
}

Object.assign(window, { Landing });
