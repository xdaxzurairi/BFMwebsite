/* ============================================================
   BFM — Data layer: seed (from schema), i18n, CRUD store
   Plain JS, attaches BFM to window.
   ============================================================ */
(function () {
  const STORE_KEY = 'bfm_data_v4';

  /* ---------------- i18n ---------------- */
  const DICT = {
    'nav.home': ['Utama', 'Home'],
    'nav.clubs': ['Kelab', 'Clubs'],
    'nav.players': ['Pemain', 'Players'],
    'nav.tournaments': ['Kejohanan', 'Tournaments'],
    'nav.standings': ['Kedudukan', 'Standings'],
    'nav.matches': ['Perlawanan', 'Matches'],
    'nav.news': ['Berita', 'News'],
    'nav.dashboard': ['Papan Pemuka', 'Dashboard'],
    'nav.signin': ['Log Masuk', 'Sign in'],
    'nav.signout': ['Log Keluar', 'Sign out'],

    'role.user': ['Awam', 'Public'],
    'role.club_manager': ['Pengurus Kelab', 'Club Manager'],
    'role.admin': ['Pentadbir', 'Admin'],
    'role.technical_admin': ['Pentadbir Teknikal', 'Technical Admin'],

    'cta.explore': ['Terokai Liga', 'Explore the League'],
    'cta.register': ['Daftar Kejohanan', 'Register for a Tournament'],
    'cta.viewall': ['Lihat Semua', 'View all'],
    'cta.back': ['Kembali', 'Back'],
    'cta.save': ['Simpan', 'Save'],
    'cta.cancel': ['Batal', 'Cancel'],
    'cta.add': ['Tambah', 'Add'],
    'cta.edit': ['Sunting', 'Edit'],
    'cta.delete': ['Padam', 'Delete'],
    'cta.confirm': ['Sahkan', 'Confirm'],
    'cta.approve': ['Luluskan', 'Approve'],
    'cta.reject': ['Tolak', 'Reject'],
    'cta.withdraw': ['Tarik Diri', 'Withdraw'],
    'cta.submit': ['Hantar', 'Submit'],
    'cta.record': ['Rekod Bayaran', 'Record Payment'],
    'cta.search': ['Cari…', 'Search…'],

    'hero.tag': ['Persekutuan Besbol Malaysia', 'Baseball Federation of Malaysia'],
    'hero.line1': ['Sukan Negara,', 'The National Game,'],
    'hero.line2': ['Dimainkan', 'Played'],
    'hero.line3': ['Sepenuh Hati', 'All Out'],
    'hero.sub': ['Satu platform untuk kelab, pemain, kejohanan dan kedudukan liga seluruh Malaysia.',
                 'One home for clubs, players, tournaments and league standings across Malaysia.'],
    'hero.live': ['Musim 2026 sedang berlangsung', '2026 Season is live'],

    'stats.clubs': ['Kelab Berdaftar', 'Registered Clubs'],
    'stats.players': ['Pemain Aktif', 'Active Players'],
    'stats.matches': ['Perlawanan Dimainkan', 'Matches Played'],
    'stats.states': ['Negeri Terlibat', 'States Represented'],

    'sec.next': ['Kejohanan Akan Datang', 'Next Tournament'],
    'sec.countdown': ['Mula dalam', 'Starts in'],
    'sec.days': ['hari', 'days'],
    'sec.hours': ['jam', 'hrs'],
    'sec.mins': ['minit', 'min'],
    'sec.secs': ['saat', 'sec'],
    'sec.news': ['Berita & Pengumuman', 'News & Announcements'],
    'sec.featured': ['Kelab Pilihan', 'Featured Clubs'],
    'sec.join.title': ['Sertai liga besbol kebangsaan', 'Join the national baseball league'],
    'sec.join.sub': ['Daftar kelab anda, urus pemain, dan rebut tempat dalam kejohanan rasmi BFM.',
                     'Register your club, manage players, and claim your place in official BFM tournaments.'],

    'lbl.state': ['Negeri', 'State'],
    'lbl.manager': ['Pengurus', 'Manager'],
    'lbl.players': ['Pemain', 'Players'],
    'lbl.founded': ['Status', 'Status'],
    'lbl.position': ['Posisi', 'Position'],
    'lbl.jersey': ['No. Jersi', 'Jersey'],
    'lbl.avg': ['Purata Pukul', 'Batting Avg'],
    'lbl.hits': ['Pukulan', 'Hits'],
    'lbl.runs': ['Larian', 'Runs'],
    'lbl.rbi': ['RBI', 'RBI'],
    'lbl.matches': ['Perlawanan', 'Matches'],
    'lbl.roster': ['Senarai Pemain', 'Roster'],
    'lbl.officials': ['Pegawai', 'Officials'],
    'lbl.club': ['Kelab', 'Club'],
    'lbl.category': ['Kategori', 'Category'],
    'lbl.level': ['Peringkat', 'Level'],
    'lbl.dates': ['Tarikh', 'Dates'],
    'lbl.venue': ['Tempat', 'Venue'],
    'lbl.entryfee': ['Yuran Masuk', 'Entry Fee'],
    'lbl.prizepool': ['Hadiah', 'Prize Pool'],
    'lbl.teams': ['Pasukan', 'Teams'],
    'lbl.status': ['Status', 'Status'],
    'lbl.regclose': ['Tutup Pendaftaran', 'Registration Closes'],
    'lbl.score': ['Skor', 'Score'],
    'lbl.date': ['Tarikh', 'Date'],
    'lbl.amount': ['Jumlah', 'Amount'],
    'lbl.method': ['Kaedah', 'Method'],
    'lbl.ref': ['Rujukan', 'Reference'],
    'lbl.allstates': ['Semua Negeri', 'All States'],
    'lbl.allcat': ['Semua Kategori', 'All Categories'],

    'tbl.pos': ['#', '#'],
    'tbl.team': ['Pasukan', 'Team'],
    'tbl.p': ['P', 'P'],
    'tbl.w': ['M', 'W'],
    'tbl.l': ['K', 'L'],
    'tbl.d': ['S', 'D'],
    'tbl.rd': ['BL', 'RD'],
    'tbl.pts': ['Mata', 'Pts'],

    'dash.overview': ['Gambaran', 'Overview'],
    'dash.welcome': ['Selamat kembali', 'Welcome back'],
    'dash.myclub': ['Kelab Saya', 'My Club'],
    'dash.manageplayers': ['Urus Pemain', 'Manage Players'],
    'dash.manageofficials': ['Urus Pegawai', 'Manage Officials'],
    'dash.myregs': ['Pendaftaran Saya', 'My Registrations'],
    'dash.allclubs': ['Semua Kelab', 'All Clubs'],
    'dash.alltourn': ['Kejohanan', 'Tournaments'],
    'dash.allmatches': ['Perlawanan', 'Matches'],
    'dash.regs': ['Pendaftaran', 'Registrations'],
    'dash.payments': ['Bayaran', 'Payments'],
    'dash.pending': ['Menunggu Tindakan', 'Pending Action'],
    'dash.allnews': ['Berita', 'News'],
    'dash.profile': ['Profil Kelab', 'Club Profile'],

    'reg.title': ['Daftar untuk Kejohanan', 'Register for Tournament'],
    'reg.pick': ['Pilih kejohanan yang dibuka', 'Choose an open tournament'],
    'reg.notes': ['Nota (pilihan)', 'Notes (optional)'],
    'reg.done': ['Pendaftaran dihantar — menunggu kelulusan.', 'Registration submitted — pending approval.'],
    'reg.approved': ['Pendaftaran diluluskan.', 'Registration approved.'],
    'reg.rejected': ['Pendaftaran ditolak.', 'Registration rejected.'],
    'reg.withdrawn': ['Anda telah menarik diri.', 'You have withdrawn.'],
    'reg.exists': ['Kelab sudah mendaftar kejohanan ini.', 'Club is already registered for this tournament.'],
    'reg.none': ['Belum ada pendaftaran lagi.', 'No registrations yet.'],
    'reg.empty': ['Tiada kejohanan dibuka untuk pendaftaran.', 'No tournaments open for registration.'],

    'player.added': ['Pemain ditambah.', 'Player added.'],
    'player.updated': ['Pemain dikemas kini.', 'Player updated.'],
    'player.deleted': ['Pemain dipadam.', 'Player removed.'],
    'official.added': ['Pegawai ditambah.', 'Official added.'],
    'official.updated': ['Pegawai dikemas kini.', 'Official updated.'],
    'official.deleted': ['Pegawai dipadam.', 'Official removed.'],
    'tourn.created': ['Kejohanan dicipta.', 'Tournament created.'],
    'tourn.updated': ['Kejohanan dikemas kini.', 'Tournament updated.'],
    'match.updated': ['Skor perlawanan disimpan.', 'Match score saved.'],
    'pay.recorded': ['Bayaran direkodkan.', 'Payment recorded.'],
    'pay.deleted': ['Bayaran dipadam.', 'Payment removed.'],
    'club.added': ['Kelab ditambah.', 'Club added.'],
    'club.updated': ['Kelab dikemas kini.', 'Club updated.'],
    'club.deleted': ['Kelab dinyahaktifkan.', 'Club deactivated.'],
    'news.added': ['Berita diterbitkan.', 'News published.'],
    'news.updated': ['Berita dikemas kini.', 'News updated.'],
    'news.deleted': ['Berita dipadam.', 'News removed.'],
    'match.added': ['Perlawanan dicipta.', 'Match created.'],
    'match.deleted': ['Perlawanan dipadam.', 'Match removed.'],
    'tourn.deleted': ['Kejohanan dipadam.', 'Tournament removed.'],
    'confirm.del': ['Padam item ini? Tindakan tidak boleh diundur.', 'Delete this item? This cannot be undone.'],

    'signin.title': ['Masuk sebagai', 'Sign in as'],
    'signin.sub': ['Pilih peranan demo untuk meneroka paparan berbeza. Tiada kata laluan diperlukan.',
                   'Pick a demo role to explore the different views. No password needed.'],
    'signin.user.d': ['Layari kelab, pemain, kejohanan & kedudukan.', 'Browse clubs, players, tournaments & standings.'],
    'signin.mgr.d': ['Urus pemain & pegawai kelab anda, daftar kejohanan.', 'Manage your club roster & officials, register for tournaments.'],
    'signin.admin.d': ['Kawal penuh: kelab, kejohanan, perlawanan, bayaran.', 'Full control: clubs, tournaments, matches, payments.'],

    'foot.tagline': ['Membina masa depan besbol Malaysia, satu larian pada satu masa.',
                     'Building the future of Malaysian baseball, one run at a time.'],
    'foot.rights': ['© 2026 Persekutuan Besbol Malaysia. Prototaip demo.', '© 2026 Baseball Federation of Malaysia. Demo prototype.'],
  };

  /* ---------------- seed ----------------
     Demo data cleared — app starts empty. Use the Admin console to
     add clubs/tournaments/news, and the Club Manager console to add
     players/officials, exactly as a real deployment would. */
  const seed = {
    clubs: [],
    positions: ['Pitcher', 'Catcher', '1st Base', '2nd Base', '3rd Base', 'Shortstop', 'Left Field', 'Center Field', 'Right Field', 'Designated Hitter'],
    players: [],
    player_match_stats: [],
    officials: [],
    tournaments: [],
    matches: [],
    registrations: [],
    payments: [],
    news: [],
  };

  /* ---------------- derived ---------------- */
  function playerStats(db, player_id) {
    const rows = db.player_match_stats.filter((s) => s.player_id === player_id);
    const ab = rows.reduce((a, s) => a + s.at_bats, 0);
    const hits = rows.reduce((a, s) => a + s.hits, 0);
    const runs = rows.reduce((a, s) => a + s.runs, 0);
    const rbi = rows.reduce((a, s) => a + s.rbi, 0);
    return { total_matches: rows.length, total_hits: hits, total_runs: runs, total_rbi: rbi,
      at_bats: ab, batting_average: ab > 0 ? hits / ab : 0 };
  }
  function clubById(db, id) { return db.clubs.find((c) => c.club_id === id); }
  function tournamentById(db, id) { return db.tournaments.find((t) => t.tournament_id === id); }
  function playersOfClub(db, club_id) { return db.players.filter((p) => p.club_id === club_id && p.is_active); }
  function officialsOfClub(db, club_id) { return db.officials.filter((o) => o.club_id === club_id && o.is_active); }

  function standingsFor(db, tournament_id) {
    const ms = db.matches.filter((m) => m.tournament_id === tournament_id && m.status === 'completed');
    const tbl = {};
    const ensure = (cid) => (tbl[cid] || (tbl[cid] = { club_id: cid, mp: 0, w: 0, l: 0, d: 0, rf: 0, ra: 0, pts: 0 }));
    ms.forEach((m) => {
      const h = ensure(m.home_team_id), a = ensure(m.away_team_id);
      h.mp++; a.mp++;
      h.rf += m.home_score; h.ra += m.away_score;
      a.rf += m.away_score; a.ra += m.home_score;
      if (m.home_score > m.away_score) { h.w++; h.pts += 3; a.l++; }
      else if (m.home_score < m.away_score) { a.w++; a.pts += 3; h.l++; }
      else { h.d++; a.d++; h.pts++; a.pts++; }
    });
    return Object.values(tbl)
      .map((r) => ({ ...r, rd: r.rf - r.ra }))
      .sort((x, y) => y.pts - x.pts || y.rd - x.rd);
  }

  /* ---------------- store ---------------- */
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return JSON.parse(JSON.stringify(seed));
  }
  let db = load();
  const subs = new Set();
  function persist() { try { localStorage.setItem(STORE_KEY, JSON.stringify(db)); } catch (e) {} subs.forEach((f) => f()); }
  function nextId(arr, key) { return arr.reduce((m, r) => Math.max(m, r[key]), 0) + 1; }

  const BFM = {
    DICT,
    get db() { return db; },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
    reset() { db = JSON.parse(JSON.stringify(seed)); persist(); },

    // derived
    playerStats: (id) => playerStats(db, id),
    clubById: (id) => clubById(db, id),
    tournamentById: (id) => tournamentById(db, id),
    playersOfClub: (id) => playersOfClub(db, id),
    officialsOfClub: (id) => officialsOfClub(db, id),
    standingsFor: (id) => standingsFor(db, id),

    // players CRUD
    addPlayer(p) { const id = nextId(db.players, 'player_id'); db.players.push({ player_id: id, is_active: true, ...p }); persist(); return id; },
    updatePlayer(id, patch) { const p = db.players.find((x) => x.player_id === id); if (p) Object.assign(p, patch); persist(); },
    deletePlayer(id) { const p = db.players.find((x) => x.player_id === id); if (p) p.is_active = false; persist(); },

    // officials CRUD
    addOfficial(o) { const id = nextId(db.officials, 'official_id'); db.officials.push({ official_id: id, is_active: true, ...o }); persist(); return id; },
    updateOfficial(id, patch) { const o = db.officials.find((x) => x.official_id === id); if (o) Object.assign(o, patch); persist(); },
    deleteOfficial(id) { const o = db.officials.find((x) => x.official_id === id); if (o) o.is_active = false; persist(); },

    // tournaments CRUD
    addTournament(t) { const id = nextId(db.tournaments, 'tournament_id'); db.tournaments.push({ tournament_id: id, status: 'upcoming', currency: 'MYR', ...t }); persist(); return id; },
    updateTournament(id, patch) { const t = tournamentById(db, id); if (t) Object.assign(t, patch); persist(); },
    deleteTournament(id) { db.tournaments = db.tournaments.filter((x) => x.tournament_id !== id); db.registrations = db.registrations.filter((r) => r.tournament_id !== id); db.matches = db.matches.filter((m) => m.tournament_id !== id); persist(); },

    // matches CRUD
    addMatch(m) { const id = nextId(db.matches, 'match_id'); db.matches.push({ match_id: id, status: 'scheduled', home_score: null, away_score: null, ...m }); persist(); return id; },
    updateMatch(id, patch) { const m = db.matches.find((x) => x.match_id === id); if (m) Object.assign(m, patch); persist(); },
    deleteMatch(id) { db.matches = db.matches.filter((x) => x.match_id !== id); persist(); },

    // clubs CRUD
    addClub(c) { const id = nextId(db.clubs, 'club_id'); db.clubs.push({ club_id: id, is_active: true, club_category: 'club', color: '#1f6f43', ...c }); persist(); return id; },
    updateClub(id, patch) { const c = clubById(db, id); if (c) Object.assign(c, patch); persist(); },
    deleteClub(id) { const c = clubById(db, id); if (c) c.is_active = false; persist(); },

    // news CRUD
    addNews(n) { const id = nextId(db.news, 'id'); db.news.push({ id, date: new Date().toISOString().slice(0, 10), ...n }); persist(); return id; },
    updateNews(id, patch) { const n = db.news.find((x) => x.id === id); if (n) Object.assign(n, patch); persist(); },
    deleteNews(id) { db.news = db.news.filter((x) => x.id !== id); persist(); },

    // payments CRUD (delete/refund)
    deletePayment(id) { db.payments = db.payments.filter((x) => x.payment_id !== id); persist(); },

    // registrations CRUD (priority)
    registrationExists(tid, cid) { return db.registrations.some((r) => r.tournament_id === tid && r.club_id === cid && r.status !== 'withdrawn'); },
    addRegistration(tid, cid, notes) {
      const id = nextId(db.registrations, 'registration_id');
      db.registrations.push({ registration_id: id, tournament_id: tid, club_id: cid, registration_date: new Date().toISOString(), status: 'pending', notes: notes || '', registered_by: null });
      persist(); return id;
    },
    setRegistrationStatus(id, status) { const r = db.registrations.find((x) => x.registration_id === id); if (r) r.status = status; persist(); },
    deleteRegistration(id) { db.registrations = db.registrations.filter((r) => r.registration_id !== id); persist(); },

    // payments CRUD
    addPayment(p) { const id = nextId(db.payments, 'payment_id'); db.payments.push({ payment_id: id, payment_status: 'completed', payment_method: 'bank_transfer', payment_date: new Date().toISOString().slice(0, 10), ...p }); persist(); return id; },
  };

  window.BFM = BFM;
})();
