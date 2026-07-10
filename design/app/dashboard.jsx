/* ============================================================
   BFM — Dashboards: Manager + Admin + CRUD
   ============================================================ */

/* ---------- shared dashboard shell ---------- */
function DashShell({ items, section, onSection, title, subtitle, children }) {
  return (
    <div className="wrap section tight">
      <div style={{ marginBottom: 30 }}>
        <div className="kicker" style={{ marginBottom: 12 }}>{title}</div>
        <h1 className="h-lg">{subtitle}</h1>
      </div>
      <div className="dash-layout" style={{ display: 'grid', alignItems: 'start' }}>
        <aside className="card pad dash-side">
          <div className="side">
            {items.map((it) => (
              <div key={it.id} className={`side-item ${section === it.id ? 'active' : ''}`} onClick={() => onSection(it.id)}>
                <it.icon />{it.label}{it.count != null && <span className="count">{it.count}</span>}
              </div>
            ))}
          </div>
        </aside>
        <main style={{ minWidth: 0 }}>{children}</main>
      </div>
    </div>
  );
}

function SectionHead({ title, action }) {
  return <div className="row between center" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}><h2 className="h-md">{title}</h2>{action}</div>;
}

/* metric tiles for overview */
function Metric({ icon: Icon, label, value, tone = 'field' }) {
  return (
    <div className="card pad">
      <div className="row between center">
        <div className="stat-label muted">{label}</div>
        <Icon style={{ width: 18, height: 18, color: `var(--${tone})` }} />
      </div>
      <div className="display" style={{ fontSize: 46, marginTop: 8, color: `var(--${tone})` }}><Counter to={value} /></div>
    </div>
  );
}

/* ===========================================================
   Confirm dialog
   =========================================================== */
function useConfirm() {
  const [state, setState] = useState(null);
  const ask = (msg, onYes) => setState({ msg, onYes });
  const node = state && (
    <Modal title={state.title || 'Confirm'} onClose={() => setState(null)}
      footer={<>
        <Button variant="ghost" onClick={() => setState(null)}>{BFM.DICT['cta.cancel'][window.__lang]}</Button>
        <Button variant="primary" onClick={() => { state.onYes(); setState(null); }}>{BFM.DICT['cta.confirm'][window.__lang]}</Button>
      </>}>
      <p style={{ fontSize: 15, lineHeight: 1.5 }}>{state.msg}</p>
    </Modal>
  );
  return { ask, node };
}

/* ===========================================================
   MANAGER DASHBOARD
   =========================================================== */
function ManagerDashboard({ section, setSection, extra }) {
  const { t, lang, currentClubId } = useApp();
  const store = useStore();
  const club = BFM.clubById(currentClubId);
  if (!club) {
    return (
      <div className="wrap section tight">
        <div className="card pad" style={{ textAlign: 'center', padding: '60px 30px' }}>
          <Diamond cls="outline" style={{ width: 26, height: 26, margin: '0 auto 16px' }} />
          <h2 className="h-md" style={{ marginBottom: 10 }}>{lang === 0 ? 'Belum ada kelab dikaitkan' : 'No club linked yet'}</h2>
          <p className="muted" style={{ maxWidth: 420, margin: '0 auto' }}>{lang === 0 ? 'Sila hubungi Pentadbir BFM untuk mendaftarkan kelab anda sebelum mengurus pemain dan pegawai.' : 'Please ask a BFM Admin to register your club before managing players and officials.'}</p>
        </div>
      </div>
    );
  }
  const players = BFM.playersOfClub(currentClubId);
  const officials = BFM.officialsOfClub(currentClubId);
  const regs = BFM.db.registrations.filter((r) => r.club_id === currentClubId);
  const items = [
    { id: 'overview', icon: I.grid, label: t('dash.overview') },
    { id: 'profile', icon: I.pin, label: t('dash.profile') },
    { id: 'players', icon: I.users, label: t('dash.manageplayers'), count: players.length },
    { id: 'officials', icon: I.shield, label: t('dash.manageofficials'), count: officials.length },
    { id: 'myregs', icon: I.trophy, label: t('dash.myregs'), count: regs.length },
  ];
  return (
    <DashShell items={items} section={section} onSection={setSection} title={`${t('dash.myclub')} · ${club.club_name}`} subtitle={`${t('dash.welcome')}, ${club.manager_name.trim()}`}>
      {section === 'overview' && <ManagerOverview club={club} players={players} officials={officials} regs={regs} setSection={setSection} />}
      {section === 'profile' && <ClubProfileForm club={club} />}
      {section === 'players' && <PlayersManager clubId={currentClubId} />}
      {section === 'officials' && <OfficialsManager clubId={currentClubId} />}
      {section === 'myregs' && <MyRegistrations clubId={currentClubId} autoRegister={extra?.register} />}
    </DashShell>
  );
}

function ManagerOverview({ club, players, officials, regs, setSection }) {
  const { t, lang } = useApp();
  const avg = players.length ? players.reduce((a, p) => a + BFM.playerStats(p.player_id).batting_average, 0) / players.length : 0;
  return (
    <div className="col" style={{ gap: 24 }}>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' }}>
        <Metric icon={I.users} label={t('lbl.players')} value={players.length} />
        <Metric icon={I.shield} label={t('lbl.officials')} value={officials.length} tone="clay" />
        <Metric icon={I.trophy} label={t('dash.myregs')} value={regs.length} />
        <div className="card pad">
          <div className="row between center"><div className="stat-label muted">{t('lbl.avg')}</div><I.chart style={{ width: 18, height: 18, color: 'var(--clay)' }} /></div>
          <div className="display" style={{ fontSize: 46, marginTop: 8, color: 'var(--clay)' }}>{fmt.avg(avg)}</div>
        </div>
      </div>
      <div className="card pad">
        <div className="row center" style={{ gap: 18 }}>
          <ClubLogo club={club} size={64} />
          <div style={{ flex: 1 }}>
            <h3 className="h-md">{club.club_name}</h3>
            <div className="row" style={{ gap: 18, marginTop: 6, color: 'var(--ink-soft)', fontSize: 14, flexWrap: 'wrap' }}>
              <span className="row center" style={{ gap: 6 }}><I.pin style={{ width: 15, height: 15 }} />{club.state}</span>
              <span className="row center" style={{ gap: 6 }}><I.user style={{ width: 15, height: 15 }} />{club.email}</span>
              <span className="row center" style={{ gap: 6 }}><I.clock style={{ width: 15, height: 15 }} />{club.phone}</span>
            </div>
          </div>
          <Button variant="field" icon={I.trophy} onClick={() => setSection('myregs')}>{t('cta.register')}</Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Club profile (manager CRUD-update) ---------- */
function ClubProfileForm({ club }) {
  const { t, lang } = useApp();
  const [f, setF] = useState({ club_name: club.club_name, state: club.state, manager_name: club.manager_name, phone: club.phone, email: club.email, color: club.color || '#1f6f43' });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => { BFM.updateClub(club.club_id, f); toast(t('club.updated')); };
  const states = ['Kuala Lumpur', 'Selangor', 'Pulau Pinang', 'Johor', 'Sabah', 'Melaka', 'Perak', 'Sarawak', 'Negeri Sembilan', 'Kedah', 'Pahang', 'Terengganu', 'Kelantan', 'Perlis'];
  return (
    <div>
      <SectionHead title={t('dash.profile')} />
      <div className="card pad">
        <div className="row center" style={{ gap: 18, marginBottom: 24 }}>
          <ClubLogo club={{ ...club, color: f.color }} size={64} />
          <div className="field" style={{ flex: 1, maxWidth: 160 }}>
            <label>{lang === 0 ? 'Warna Kelab' : 'Club Color'}</label>
            <input type="color" value={f.color} onChange={(e) => set('color', e.target.value)} style={{ width: '100%', height: 40, borderRadius: 8, border: '1.5px solid var(--line)', cursor: 'pointer' }} />
          </div>
        </div>
        <div className="grid field-grid-2" style={{ gap: 16 }}>
          <Field label={lang === 0 ? 'Nama Kelab' : 'Club Name'}><Input value={f.club_name} onChange={(e) => set('club_name', e.target.value)} /></Field>
          <Field label={t('lbl.state')}><Select value={f.state} onChange={(e) => set('state', e.target.value)}>{states.map((s) => <option key={s}>{s}</option>)}</Select></Field>
          <Field label={t('lbl.manager')}><Input value={f.manager_name} onChange={(e) => set('manager_name', e.target.value)} /></Field>
          <Field label={lang === 0 ? 'Telefon' : 'Phone'}><Input value={f.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
          <Field label="Email"><Input value={f.email} onChange={(e) => set('email', e.target.value)} /></Field>
        </div>
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 22 }}>
          <Button variant="primary" icon={I.check} onClick={save}>{t('cta.save')}</Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Players manager (CRUD) ---------- */
function PlayersManager({ clubId }) {
  const { t, lang } = useApp();
  useStore();
  const players = BFM.playersOfClub(clubId);
  const [edit, setEdit] = useState(null); // {} new, {player} edit
  const confirm = useConfirm();
  return (
    <div>
      <SectionHead title={t('dash.manageplayers')} action={<Button variant="primary" icon={I.plus} onClick={() => setEdit({})}>{lang === 0 ? 'Tambah Pemain' : 'Add Player'}</Button>} />
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead><tr><th>{t('lbl.jersey')}</th><th>{lang === 0 ? 'Nama' : 'Name'}</th><th>{t('lbl.position')}</th><th className="num">{t('lbl.avg')}</th><th>{lang === 0 ? 'Perubatan' : 'Medical'}</th><th></th></tr></thead>
          <tbody>
            {players.map((p) => {
              const s = BFM.playerStats(p.player_id);
              return (
                <tr key={p.player_id}>
                  <td><span className="display" style={{ fontSize: 20, color: 'var(--clay)' }}>{p.jersey_number}</span></td>
                  <td style={{ fontWeight: 700 }}>{p.first_name} {p.last_name}</td>
                  <td className="muted">{p.position}</td>
                  <td className="num">{fmt.avg(s.batting_average)}</td>
                  <td>{p.medical_clearance ? <span className="badge badge-approved">{lang === 0 ? 'Lulus' : 'Cleared'}</span> : <span className="badge badge-pending">{lang === 0 ? 'Belum' : 'Pending'}</span>}</td>
                  <td>
                    <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-icon" onClick={() => setEdit({ player: p })}><I.edit /></button>
                      <button className="btn btn-ghost btn-icon" onClick={() => confirm.ask(t('confirm.del'), () => { BFM.deletePlayer(p.player_id); toast(t('player.deleted')); })}><I.trash /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {players.length === 0 && <Empty>{lang === 0 ? 'Belum ada pemain. Tambah yang pertama.' : 'No players yet. Add your first.'}</Empty>}
      </div>
      {edit && <PlayerForm clubId={clubId} player={edit.player} onClose={() => setEdit(null)} />}
      {confirm.node}
    </div>
  );
}

function PlayerForm({ clubId, player, onClose }) {
  const { t, lang } = useApp();
  const [f, setF] = useState(player || { first_name: '', last_name: '', jersey_number: '', position: 'Pitcher', medical_clearance: false });
  const [err, setErr] = useState({});
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => {
    const e = {};
    if (!f.first_name.trim()) e.first_name = lang === 0 ? 'Wajib' : 'Required';
    if (!f.last_name.trim()) e.last_name = lang === 0 ? 'Wajib' : 'Required';
    if (!f.jersey_number) e.jersey_number = lang === 0 ? 'Wajib' : 'Required';
    setErr(e);
    if (Object.keys(e).length) return;
    const payload = { ...f, club_id: clubId, jersey_number: Number(f.jersey_number) };
    if (player) { BFM.updatePlayer(player.player_id, payload); toast(t('player.updated')); }
    else { BFM.addPlayer(payload); toast(t('player.added')); }
    onClose();
  };
  return (
    <Modal title={player ? t('cta.edit') + ' ' + (lang === 0 ? 'Pemain' : 'Player') : (lang === 0 ? 'Tambah Pemain' : 'Add Player')} onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>{t('cta.cancel')}</Button><Button variant="primary" icon={I.check} onClick={save}>{t('cta.save')}</Button></>}>
      <div className="grid field-grid-2" style={{ gap: 16 }}>
        <Field label={lang === 0 ? 'Nama Pertama' : 'First Name'} error={err.first_name}><Input value={f.first_name} onChange={(e) => set('first_name', e.target.value)} /></Field>
        <Field label={lang === 0 ? 'Nama Akhir' : 'Last Name'} error={err.last_name}><Input value={f.last_name} onChange={(e) => set('last_name', e.target.value)} /></Field>
        <Field label={t('lbl.jersey')} error={err.jersey_number}><Input type="number" value={f.jersey_number} onChange={(e) => set('jersey_number', e.target.value)} /></Field>
        <Field label={t('lbl.position')}><Select value={f.position} onChange={(e) => set('position', e.target.value)}>{BFM.db.positions.map((p) => <option key={p}>{p}</option>)}</Select></Field>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label style={{ marginBottom: 2 }}>{lang === 0 ? 'Saringan Perubatan' : 'Medical Clearance'}</label>
          <label className="row center" style={{ gap: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
            <input type="checkbox" checked={!!f.medical_clearance} onChange={(e) => set('medical_clearance', e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--field)' }} />
            {lang === 0 ? 'Pemain telah lulus saringan perubatan' : 'Player has passed medical clearance'}
          </label>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Officials manager (CRUD) ---------- */
function OfficialsManager({ clubId }) {
  const { t, lang } = useApp();
  useStore();
  const officials = BFM.officialsOfClub(clubId);
  const [edit, setEdit] = useState(null);
  const confirm = useConfirm();
  return (
    <div>
      <SectionHead title={t('dash.manageofficials')} action={<Button variant="primary" icon={I.plus} onClick={() => setEdit({})}>{lang === 0 ? 'Tambah Pegawai' : 'Add Official'}</Button>} />
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))' }}>
        {officials.map((o) => (
          <div key={o.official_id} className="card pad">
            <div className="row center" style={{ gap: 13 }}>
              <Avatar a={o.first_name} b={o.last_name} size={46} color="var(--clay)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800 }}>{o.first_name} {o.last_name}</div>
                <div className="muted" style={{ fontSize: 13 }}>{o.position}</div>
              </div>
            </div>
            <div className="badge" style={{ marginTop: 12 }}>{o.role}</div>
            <div className="row" style={{ gap: 6, marginTop: 14, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-icon" onClick={() => setEdit({ official: o })}><I.edit /></button>
              <button className="btn btn-ghost btn-icon" onClick={() => confirm.ask(t('confirm.del'), () => { BFM.deleteOfficial(o.official_id); toast(t('official.deleted')); })}><I.trash /></button>
            </div>
          </div>
        ))}
      </div>
      {officials.length === 0 && <div className="card"><Empty>{lang === 0 ? 'Belum ada pegawai.' : 'No officials yet.'}</Empty></div>}
      {edit && <OfficialForm clubId={clubId} official={edit.official} onClose={() => setEdit(null)} />}
      {confirm.node}
    </div>
  );
}
function OfficialForm({ clubId, official, onClose }) {
  const { t, lang } = useApp();
  const [f, setF] = useState(official || { first_name: '', last_name: '', position: '', role: '', phone: '', email: '' });
  const [err, setErr] = useState({});
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => {
    const e = {};
    if (!f.first_name.trim()) e.first_name = '!';
    if (!f.last_name.trim()) e.last_name = '!';
    if (!f.position.trim()) e.position = '!';
    setErr(e); if (Object.keys(e).length) return;
    if (official) { BFM.updateOfficial(official.official_id, { ...f, club_id: clubId }); toast(t('official.updated')); }
    else { BFM.addOfficial({ ...f, club_id: clubId }); toast(t('official.added')); }
    onClose();
  };
  return (
    <Modal title={official ? t('cta.edit') : (lang === 0 ? 'Tambah Pegawai' : 'Add Official')} onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>{t('cta.cancel')}</Button><Button variant="primary" icon={I.check} onClick={save}>{t('cta.save')}</Button></>}>
      <div className="grid field-grid-2" style={{ gap: 16 }}>
        <Field label={lang === 0 ? 'Nama Pertama' : 'First Name'} error={err.first_name}><Input value={f.first_name} onChange={(e) => set('first_name', e.target.value)} /></Field>
        <Field label={lang === 0 ? 'Nama Akhir' : 'Last Name'} error={err.last_name}><Input value={f.last_name} onChange={(e) => set('last_name', e.target.value)} /></Field>
        <Field label={t('lbl.position')} error={err.position} hint={lang === 0 ? 'cth: Jurulatih, Pengurus' : 'e.g. Coach, Manager'}><Input value={f.position} onChange={(e) => set('position', e.target.value)} /></Field>
        <Field label={lang === 0 ? 'Peranan' : 'Role'}><Input value={f.role} onChange={(e) => set('role', e.target.value)} /></Field>
        <Field label={lang === 0 ? 'Telefon' : 'Phone'}><Input value={f.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
        <Field label="Email"><Input value={f.email} onChange={(e) => set('email', e.target.value)} /></Field>
      </div>
    </Modal>
  );
}

/* ---------- My Registrations (priority CRUD) ---------- */
function MyRegistrations({ clubId, autoRegister }) {
  const { t, lang } = useApp();
  useStore();
  const [modal, setModal] = useState(autoRegister ? { tid: autoRegister } : null);
  const confirm = useConfirm();
  const regs = BFM.db.registrations.filter((r) => r.club_id === clubId).sort((a, b) => new Date(b.registration_date) - new Date(a.registration_date));
  return (
    <div>
      <SectionHead title={t('dash.myregs')} action={<Button variant="primary" icon={I.plus} onClick={() => setModal({})}>{t('cta.register')}</Button>} />
      <div className="col" style={{ gap: 12 }}>
        {regs.map((r) => {
          const tn = BFM.tournamentById(r.tournament_id);
          const pay = BFM.db.payments.find((p) => p.tournament_id === r.tournament_id && p.club_id === clubId);
          return (
            <div key={r.registration_id} className="card pad">
              <div className="row between center" style={{ gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div className="row center" style={{ gap: 10, marginBottom: 6 }}>
                    <StatusBadge status={r.status} label={statusLbl(r.status, lang)} />
                    <span className="muted" style={{ fontSize: 13 }}>{fmt.date(r.registration_date, lang)}</span>
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: 17 }}>{tn?.tournament_name}</h3>
                  <div className="row" style={{ gap: 14, marginTop: 6, fontSize: 13, color: 'var(--ink-soft)', flexWrap: 'wrap' }}>
                    <span className="row center" style={{ gap: 5 }}><I.money style={{ width: 14, height: 14 }} />{fmt.money(tn?.entry_fee, tn?.currency)}</span>
                    {pay ? <span className="badge badge-completed">{lang === 0 ? 'Telah Bayar' : 'Paid'}</span> : <span className="badge badge-pending">{lang === 0 ? 'Belum Bayar' : 'Unpaid'}</span>}
                  </div>
                </div>
                {(r.status === 'pending' || r.status === 'approved') && (
                  <Button variant="ghost" size="sm" icon={I.x} onClick={() => confirm.ask(lang === 0 ? 'Tarik diri daripada kejohanan ini?' : 'Withdraw from this tournament?', () => { BFM.setRegistrationStatus(r.registration_id, 'withdrawn'); toast(t('reg.withdrawn')); })}>{t('cta.withdraw')}</Button>
                )}
              </div>
            </div>
          );
        })}
        {regs.length === 0 && <div className="card"><Empty>{t('reg.none')}</Empty></div>}
      </div>
      {modal && <RegisterModal clubId={clubId} preselect={modal.tid} onClose={() => setModal(null)} />}
      {confirm.node}
    </div>
  );
}

function RegisterModal({ clubId, preselect, onClose }) {
  const { t, lang } = useApp();
  const open = BFM.db.tournaments.filter((tn) => tn.status === 'upcoming');
  const [tid, setTid] = useState(preselect || open[0]?.tournament_id || '');
  const [notes, setNotes] = useState('');
  const [err, setErr] = useState('');
  const submit = () => {
    if (!tid) return;
    if (BFM.registrationExists(Number(tid), clubId)) { setErr(t('reg.exists')); return; }
    BFM.addRegistration(Number(tid), clubId, notes);
    toast(t('reg.done'));
    onClose();
  };
  const tn = BFM.tournamentById(Number(tid));
  return (
    <Modal title={t('reg.title')} onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>{t('cta.cancel')}</Button><Button variant="primary" icon={I.trophy} onClick={submit} disabled={!open.length}>{t('cta.submit')}</Button></>}>
      {open.length === 0 ? <Empty>{t('reg.empty')}</Empty> : (
        <div className="col" style={{ gap: 18 }}>
          <Field label={t('reg.pick')} error={err}>
            <Select value={tid} onChange={(e) => { setTid(e.target.value); setErr(''); }}>
              {open.map((o) => <option key={o.tournament_id} value={o.tournament_id}>{o.tournament_name}</option>)}
            </Select>
          </Field>
          {tn && (
            <div className="card pad" style={{ background: 'var(--cream)' }}>
              <div className="row" style={{ gap: 20, flexWrap: 'wrap' }}>
                <div><div className="stat-label muted">{t('lbl.entryfee')}</div><div style={{ fontWeight: 800, fontSize: 18, color: 'var(--field)' }}>{fmt.money(tn.entry_fee, tn.currency)}</div></div>
                <div><div className="stat-label muted">{t('lbl.dates')}</div><div style={{ fontWeight: 700, fontSize: 14, marginTop: 4 }}>{fmt.dateRange(tn.start_date, tn.end_date, lang)}</div></div>
                <div><div className="stat-label muted">{t('lbl.regclose')}</div><div style={{ fontWeight: 700, fontSize: 14, marginTop: 4 }}>{fmt.date(tn.registration_end, lang)}</div></div>
              </div>
            </div>
          )}
          <Field label={t('reg.notes')}><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={lang === 0 ? 'Sebarang maklumat tambahan…' : 'Any extra information…'} /></Field>
        </div>
      )}
    </Modal>
  );
}

/* ===========================================================
   ADMIN DASHBOARD
   =========================================================== */
function AdminDashboard({ section, setSection }) {
  const { t, lang } = useApp();
  useStore();
  const pendingRegs = BFM.db.registrations.filter((r) => r.status === 'pending').length;
  const items = [
    { id: 'overview', icon: I.grid, label: t('dash.overview') },
    { id: 'regs', icon: I.trophy, label: t('dash.regs'), count: pendingRegs || null },
    { id: 'tournaments', icon: I.calendar, label: t('dash.alltourn') },
    { id: 'matches', icon: I.baseball, label: t('dash.allmatches') },
    { id: 'clubs', icon: I.shield, label: t('dash.allclubs') },
    { id: 'news', icon: I.news, label: t('dash.allnews') },
    { id: 'payments', icon: I.money, label: t('dash.payments') },
  ];
  return (
    <DashShell items={items} section={section} onSection={setSection} title={lang === 0 ? 'Konsol Pentadbir' : 'Admin Console'} subtitle={lang === 0 ? 'Kawalan penuh liga BFM' : 'Full control of the BFM league'}>
      {section === 'overview' && <AdminOverview setSection={setSection} />}
      {section === 'regs' && <RegistrationsAdmin />}
      {section === 'tournaments' && <TournamentsAdmin />}
      {section === 'matches' && <MatchesAdmin />}
      {section === 'clubs' && <ClubsAdmin />}
      {section === 'news' && <NewsAdmin />}
      {section === 'payments' && <PaymentsAdmin />}
    </DashShell>
  );
}

function AdminOverview({ setSection }) {
  const { t, lang } = useApp();
  const pending = BFM.db.registrations.filter((r) => r.status === 'pending');
  const revenue = BFM.db.payments.filter((p) => p.payment_status === 'completed').reduce((a, p) => a + p.payment_amount, 0);
  return (
    <div className="col" style={{ gap: 24 }}>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' }}>
        <Metric icon={I.shield} label={t('stats.clubs')} value={BFM.db.clubs.length} />
        <Metric icon={I.users} label={t('stats.players')} value={BFM.db.players.length} tone="clay" />
        <Metric icon={I.calendar} label={t('nav.tournaments')} value={BFM.db.tournaments.length} />
        <div className="card pad">
          <div className="row between center"><div className="stat-label muted">{lang === 0 ? 'Kutipan' : 'Revenue'}</div><I.money style={{ width: 18, height: 18, color: 'var(--field)' }} /></div>
          <div className="display" style={{ fontSize: 38, marginTop: 8, color: 'var(--field)' }}>RM<Counter to={revenue} /></div>
        </div>
      </div>
      <div className="card pad">
        <div className="row between center" style={{ marginBottom: 14 }}>
          <h3 className="h-md">{t('dash.pending')}</h3>
          {pending.length > 0 && <span className="badge badge-pending">{pending.length} {lang === 0 ? 'menunggu' : 'waiting'}</span>}
        </div>
        {pending.length === 0 ? <Empty>{lang === 0 ? 'Tiada tindakan tertunggak. Bagus!' : 'Nothing pending. All clear!'}</Empty> : (
          <div className="col" style={{ gap: 10 }}>
            {pending.slice(0, 4).map((r) => {
              const c = BFM.clubById(r.club_id), tn = BFM.tournamentById(r.tournament_id);
              return (
                <div key={r.registration_id} className="row between center" style={{ padding: '10px 0', borderBottom: '1px solid var(--line-soft)' }}>
                  <div className="row center" style={{ gap: 11 }}><ClubLogo club={c} size={36} /><div><div style={{ fontWeight: 700, fontSize: 14 }}>{c.club_name}</div><div className="muted" style={{ fontSize: 12 }}>{tn.tournament_name}</div></div></div>
                  <div className="row" style={{ gap: 6 }}>
                    <Button size="sm" variant="field" icon={I.check} onClick={() => { BFM.setRegistrationStatus(r.registration_id, 'approved'); toast(t('reg.approved')); }}>{t('cta.approve')}</Button>
                    <Button size="sm" variant="ghost" onClick={() => { BFM.setRegistrationStatus(r.registration_id, 'rejected'); toast(t('reg.rejected')); }}>{t('cta.reject')}</Button>
                  </div>
                </div>
              );
            })}
            {pending.length > 4 && <Button variant="ghost" size="sm" onClick={() => setSection('regs')}>{t('cta.viewall')}</Button>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Registrations admin (approve/reject) ---------- */
function RegistrationsAdmin() {
  const { t, lang } = useApp();
  useStore();
  const [f, setF] = useState('all');
  const confirm = useConfirm();
  const regs = BFM.db.registrations.filter((r) => f === 'all' || r.status === f).sort((a, b) => (a.status === 'pending' ? -1 : 1));
  const filters = [['all', lang === 0 ? 'Semua' : 'All'], ['pending', statusLbl('pending', lang)], ['approved', statusLbl('approved', lang)], ['rejected', statusLbl('rejected', lang)]];
  return (
    <div>
      <SectionHead title={t('dash.regs')} action={<div className="row" style={{ gap: 8 }}>{filters.map(([v, l]) => <button key={v} className={`chip ${f === v ? 'active' : ''}`} onClick={() => setF(v)}>{l}</button>)}</div>} />
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead><tr><th>{t('lbl.club')}</th><th>{t('nav.tournaments')}</th><th>{t('lbl.date')}</th><th>{t('lbl.status')}</th><th></th></tr></thead>
          <tbody>
            {regs.map((r) => {
              const c = BFM.clubById(r.club_id), tn = BFM.tournamentById(r.tournament_id);
              return (
                <tr key={r.registration_id}>
                  <td><div className="row center" style={{ gap: 10 }}><ClubLogo club={c} size={32} /><span style={{ fontWeight: 700 }}>{c.club_name}</span></div></td>
                  <td className="muted">{tn?.tournament_name}</td>
                  <td className="muted">{fmt.date(r.registration_date, lang)}</td>
                  <td><StatusBadge status={r.status} label={statusLbl(r.status, lang)} /></td>
                  <td>
                    <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                      {r.status === 'pending' && <>
                        <Button size="sm" variant="field" icon={I.check} onClick={() => { BFM.setRegistrationStatus(r.registration_id, 'approved'); toast(t('reg.approved')); }}>{t('cta.approve')}</Button>
                        <Button size="sm" variant="ghost" onClick={() => { BFM.setRegistrationStatus(r.registration_id, 'rejected'); toast(t('reg.rejected')); }}>{t('cta.reject')}</Button>
                      </>}
                      {r.status === 'approved' && <button className="btn btn-ghost btn-icon" onClick={() => confirm.ask(t('confirm.del'), () => { BFM.deleteRegistration(r.registration_id); toast(t('player.deleted')); })}><I.trash /></button>}
                      {r.status === 'rejected' && <Button size="sm" variant="ghost" icon={I.check} onClick={() => { BFM.setRegistrationStatus(r.registration_id, 'approved'); toast(t('reg.approved')); }}>{t('cta.approve')}</Button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {regs.length === 0 && <Empty>{t('reg.none')}</Empty>}
      </div>
      {confirm.node}
    </div>
  );
}

/* ---------- Tournaments admin (create/edit/delete) ---------- */
function TournamentsAdmin() {
  const { t, lang, navigate } = useApp();
  useStore();
  const [edit, setEdit] = useState(null);
  const confirm = useConfirm();
  return (
    <div>
      <SectionHead title={t('dash.alltourn')} action={<Button variant="primary" icon={I.plus} onClick={() => setEdit({})}>{lang === 0 ? 'Cipta Kejohanan' : 'Create Tournament'}</Button>} />
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead><tr><th>{lang === 0 ? 'Kejohanan' : 'Tournament'}</th><th>{t('lbl.dates')}</th><th>{t('lbl.status')}</th><th className="num">{t('lbl.teams')}</th><th className="num">{t('lbl.entryfee')}</th><th></th></tr></thead>
          <tbody>
            {BFM.db.tournaments.map((tn) => {
              const regs = BFM.db.registrations.filter((r) => r.tournament_id === tn.tournament_id && r.status === 'approved').length;
              return (
                <tr key={tn.tournament_id}>
                  <td style={{ fontWeight: 700 }} className="clickable" onClick={() => navigate('tournament', { id: tn.tournament_id })}>{tn.tournament_name}</td>
                  <td className="muted">{fmt.dateRange(tn.start_date, tn.end_date, lang)}</td>
                  <td><StatusBadge status={tn.status} label={statusLbl(tn.status, lang)} /></td>
                  <td className="num">{regs}/{tn.max_teams}</td>
                  <td className="num">{fmt.money(tn.entry_fee, tn.currency)}</td>
                  <td>
                    <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-icon" onClick={() => setEdit({ tn })}><I.edit /></button>
                      <button className="btn btn-ghost btn-icon" onClick={() => confirm.ask(t('confirm.del'), () => { BFM.deleteTournament(tn.tournament_id); toast(t('tourn.deleted')); })}><I.trash /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {edit && <TournamentForm tn={edit.tn} onClose={() => setEdit(null)} />}
      {confirm.node}
    </div>
  );
}
function TournamentForm({ tn, onClose }) {
  const { t, lang } = useApp();
  const [f, setF] = useState(tn || { tournament_name: '', description: '', tournament_level: 'local', tournament_category: 'adult', start_date: '', end_date: '', registration_end: '', max_teams: 8, entry_fee: 0, prize_pool: 0, location: '', status: 'upcoming' });
  const [err, setErr] = useState({});
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => {
    const e = {};
    if (!f.tournament_name.trim()) e.tournament_name = '!';
    if (!f.start_date) e.start_date = '!';
    if (!f.end_date) e.end_date = '!';
    setErr(e); if (Object.keys(e).length) return;
    const payload = { ...f, max_teams: Number(f.max_teams), entry_fee: Number(f.entry_fee), prize_pool: Number(f.prize_pool) };
    if (tn) { BFM.updateTournament(tn.tournament_id, payload); toast(t('tourn.updated')); }
    else { BFM.addTournament(payload); toast(t('tourn.created')); }
    onClose();
  };
  return (
    <Modal wide title={tn ? t('cta.edit') : (lang === 0 ? 'Cipta Kejohanan' : 'Create Tournament')} onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>{t('cta.cancel')}</Button><Button variant="primary" icon={I.check} onClick={save}>{t('cta.save')}</Button></>}>
      <div className="grid field-grid-2" style={{ gap: 16 }}>
        <Field label={lang === 0 ? 'Nama Kejohanan' : 'Tournament Name'} error={err.tournament_name}><Input value={f.tournament_name} onChange={(e) => set('tournament_name', e.target.value)} /></Field>
        <Field label={t('lbl.venue')}><Input value={f.location} onChange={(e) => set('location', e.target.value)} /></Field>
        <div style={{ gridColumn: '1 / -1' }}><Field label={lang === 0 ? 'Keterangan' : 'Description'}><Textarea value={f.description} onChange={(e) => set('description', e.target.value)} /></Field></div>
        <Field label={t('lbl.level')}><Select value={f.tournament_level} onChange={(e) => set('tournament_level', e.target.value)}><option value="local">Local</option><option value="regional">Regional</option><option value="national">National</option><option value="international">International</option></Select></Field>
        <Field label={t('lbl.category')}><Select value={f.tournament_category} onChange={(e) => set('tournament_category', e.target.value)}><option value="youth">Youth</option><option value="adult">Adult</option><option value="senior">Senior</option></Select></Field>
        <Field label={lang === 0 ? 'Tarikh Mula' : 'Start Date'} error={err.start_date}><Input type="date" value={f.start_date} onChange={(e) => set('start_date', e.target.value)} /></Field>
        <Field label={lang === 0 ? 'Tarikh Tamat' : 'End Date'} error={err.end_date}><Input type="date" value={f.end_date} onChange={(e) => set('end_date', e.target.value)} /></Field>
        <Field label={t('lbl.regclose')}><Input type="date" value={f.registration_end} onChange={(e) => set('registration_end', e.target.value)} /></Field>
        <Field label={t('lbl.status')}><Select value={f.status} onChange={(e) => set('status', e.target.value)}><option value="upcoming">Upcoming</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></Select></Field>
        <Field label={t('lbl.teams') + ' (max)'}><Input type="number" value={f.max_teams} onChange={(e) => set('max_teams', e.target.value)} /></Field>
        <Field label={t('lbl.entryfee') + ' (RM)'}><Input type="number" value={f.entry_fee} onChange={(e) => set('entry_fee', e.target.value)} /></Field>
        <Field label={t('lbl.prizepool') + ' (RM)'}><Input type="number" value={f.prize_pool} onChange={(e) => set('prize_pool', e.target.value)} /></Field>
      </div>
    </Modal>
  );
}

/* ---------- Matches admin (edit score) ---------- */
function MatchesAdmin() {
  const { t, lang } = useApp();
  useStore();
  const [edit, setEdit] = useState(null);
  const [create, setCreate] = useState(false);
  const confirm = useConfirm();
  const matches = [...BFM.db.matches].sort((a, b) => new Date(a.match_date) - new Date(b.match_date));
  return (
    <div>
      <SectionHead title={t('dash.allmatches')} action={<Button variant="primary" icon={I.plus} onClick={() => setCreate(true)}>{lang === 0 ? 'Jadualkan Perlawanan' : 'Schedule Match'}</Button>} />
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead><tr><th>#</th><th>{lang === 0 ? 'Perlawanan' : 'Match'}</th><th>{t('lbl.date')}</th><th className="num">{t('lbl.score')}</th><th>{t('lbl.status')}</th><th></th></tr></thead>
          <tbody>
            {matches.map((m) => {
              const h = BFM.clubById(m.home_team_id), a = BFM.clubById(m.away_team_id);
              return (
                <tr key={m.match_id}>
                  <td className="muted">{m.match_number}</td>
                  <td style={{ fontWeight: 700 }}>{h?.club_name} <span className="muted">vs</span> {a?.club_name}</td>
                  <td className="muted">{fmt.time(m.match_date)}</td>
                  <td className="num">{m.status === 'completed' ? `${m.home_score} – ${m.away_score}` : '—'}</td>
                  <td><StatusBadge status={m.status} label={statusLbl(m.status, lang)} /></td>
                  <td>
                    <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-icon" onClick={() => setEdit(m)}><I.edit /></button>
                      <button className="btn btn-ghost btn-icon" onClick={() => confirm.ask(t('confirm.del'), () => { BFM.deleteMatch(m.match_id); toast(t('match.deleted')); })}><I.trash /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {matches.length === 0 && <Empty>{lang === 0 ? 'Tiada perlawanan.' : 'No matches.'}</Empty>}
      </div>
      {edit && <MatchForm m={edit} onClose={() => setEdit(null)} />}
      {create && <MatchCreateForm onClose={() => setCreate(false)} />}
      {confirm.node}
    </div>
  );
}
function MatchForm({ m, onClose }) {
  const { t, lang } = useApp();
  const [f, setF] = useState({ home_score: m.home_score ?? '', away_score: m.away_score ?? '', status: m.status });
  const h = BFM.clubById(m.home_team_id), a = BFM.clubById(m.away_team_id);
  const save = () => {
    const patch = { status: f.status };
    if (f.status === 'completed') { patch.home_score = Number(f.home_score) || 0; patch.away_score = Number(f.away_score) || 0; }
    BFM.updateMatch(m.match_id, patch); toast(t('match.updated')); onClose();
  };
  return (
    <Modal title={lang === 0 ? 'Kemas Kini Perlawanan' : 'Update Match'} onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>{t('cta.cancel')}</Button><Button variant="primary" icon={I.check} onClick={save}>{t('cta.save')}</Button></>}>
      <div className="row center" style={{ gap: 16, justifyContent: 'center', marginBottom: 22 }}>
        <div className="col" style={{ alignItems: 'center', gap: 8, flex: 1 }}><ClubLogo club={h} size={48} /><span style={{ fontWeight: 700, fontSize: 13, textAlign: 'center' }}>{h.club_name}</span><Input type="number" style={{ textAlign: 'center', fontSize: 22, fontWeight: 800 }} value={f.home_score} onChange={(e) => setF((s) => ({ ...s, home_score: e.target.value }))} /></div>
        <span className="display" style={{ fontSize: 30, color: 'var(--ink-faint)', marginTop: 30 }}>–</span>
        <div className="col" style={{ alignItems: 'center', gap: 8, flex: 1 }}><ClubLogo club={a} size={48} /><span style={{ fontWeight: 700, fontSize: 13, textAlign: 'center' }}>{a.club_name}</span><Input type="number" style={{ textAlign: 'center', fontSize: 22, fontWeight: 800 }} value={f.away_score} onChange={(e) => setF((s) => ({ ...s, away_score: e.target.value }))} /></div>
      </div>
      <Field label={t('lbl.status')}><Select value={f.status} onChange={(e) => setF((s) => ({ ...s, status: e.target.value }))}><option value="scheduled">Scheduled</option><option value="live">Live</option><option value="completed">Completed</option><option value="postponed">Postponed</option><option value="cancelled">Cancelled</option></Select></Field>
    </Modal>
  );
}
function MatchCreateForm({ onClose }) {
  const { t, lang } = useApp();
  const [f, setF] = useState({ tournament_id: BFM.db.tournaments[0]?.tournament_id || '', home_team_id: '', away_team_id: '', match_date: '', venue: '', round_name: '', match_type: 'group' });
  const [err, setErr] = useState({});
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => {
    const e = {};
    if (!f.tournament_id) e.tournament_id = '!';
    if (!f.home_team_id) e.home_team_id = '!';
    if (!f.away_team_id || f.away_team_id === f.home_team_id) e.away_team_id = '!';
    if (!f.match_date) e.match_date = '!';
    setErr(e); if (Object.keys(e).length) return;
    const n = BFM.db.matches.filter((m) => m.tournament_id === Number(f.tournament_id)).length + 1;
    BFM.addMatch({ tournament_id: Number(f.tournament_id), home_team_id: Number(f.home_team_id), away_team_id: Number(f.away_team_id), match_date: f.match_date, venue: f.venue, round_name: f.round_name, match_type: f.match_type, match_number: `M-${String(n).padStart(2, '0')}` });
    toast(t('match.added')); onClose();
  };
  return (
    <Modal title={lang === 0 ? 'Jadualkan Perlawanan' : 'Schedule Match'} onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>{t('cta.cancel')}</Button><Button variant="primary" icon={I.check} onClick={save}>{t('cta.save')}</Button></>}>
      <div className="grid field-grid-2" style={{ gap: 16 }}>
        <div style={{ gridColumn: '1 / -1' }}><Field label={t('nav.tournaments')} error={err.tournament_id}><Select value={f.tournament_id} onChange={(e) => set('tournament_id', e.target.value)}>{BFM.db.tournaments.map((tn) => <option key={tn.tournament_id} value={tn.tournament_id}>{tn.tournament_name}</option>)}</Select></Field></div>
        <Field label={lang === 0 ? 'Pasukan Rumah' : 'Home Team'} error={err.home_team_id}><Select value={f.home_team_id} onChange={(e) => set('home_team_id', e.target.value)}><option value="">—</option>{BFM.db.clubs.map((c) => <option key={c.club_id} value={c.club_id}>{c.club_name}</option>)}</Select></Field>
        <Field label={lang === 0 ? 'Pasukan Tetamu' : 'Away Team'} error={err.away_team_id}><Select value={f.away_team_id} onChange={(e) => set('away_team_id', e.target.value)}><option value="">—</option>{BFM.db.clubs.map((c) => <option key={c.club_id} value={c.club_id}>{c.club_name}</option>)}</Select></Field>
        <Field label={lang === 0 ? 'Tarikh & Masa' : 'Date & Time'} error={err.match_date}><Input type="datetime-local" value={f.match_date} onChange={(e) => set('match_date', e.target.value)} /></Field>
        <Field label={t('lbl.venue')}><Input value={f.venue} onChange={(e) => set('venue', e.target.value)} /></Field>
        <Field label={lang === 0 ? 'Nama Pusingan' : 'Round Name'} hint="e.g. Group A, Final"><Input value={f.round_name} onChange={(e) => set('round_name', e.target.value)} /></Field>
        <Field label={lang === 0 ? 'Jenis' : 'Type'}><Select value={f.match_type} onChange={(e) => set('match_type', e.target.value)}><option value="group">Group</option><option value="semifinal">Semifinal</option><option value="final">Final</option></Select></Field>
      </div>
    </Modal>
  );
}

/* ---------- Clubs admin (full CRUD) ---------- */
function ClubsAdmin() {
  const { t, lang, navigate } = useApp();
  useStore();
  const [edit, setEdit] = useState(null);
  const confirm = useConfirm();
  return (
    <div>
      <SectionHead title={t('dash.allclubs')} action={<Button variant="primary" icon={I.plus} onClick={() => setEdit({})}>{lang === 0 ? 'Tambah Kelab' : 'Add Club'}</Button>} />
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead><tr><th>{t('lbl.club')}</th><th>{t('lbl.state')}</th><th>{t('lbl.category')}</th><th>{t('lbl.manager')}</th><th className="num">{t('lbl.players')}</th><th></th></tr></thead>
          <tbody>
            {BFM.db.clubs.filter((c) => c.is_active).map((c) => (
              <tr key={c.club_id}>
                <td className="clickable" onClick={() => navigate('club', { id: c.club_id })}><div className="row center" style={{ gap: 10 }}><ClubLogo club={c} size={32} /><span style={{ fontWeight: 700 }}>{c.club_name}</span></div></td>
                <td className="muted">{c.state}</td>
                <td><span className="badge">{c.club_category === 'school' ? (lang === 0 ? 'Sekolah' : 'School') : (lang === 0 ? 'Kelab' : 'Club')}</span></td>
                <td className="muted">{c.manager_name}</td>
                <td className="num">{BFM.playersOfClub(c.club_id).length}</td>
                <td>
                  <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-icon" onClick={() => setEdit({ club: c })}><I.edit /></button>
                    <button className="btn btn-ghost btn-icon" onClick={() => confirm.ask(t('confirm.del'), () => { BFM.deleteClub(c.club_id); toast(t('club.deleted')); })}><I.trash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && <ClubForm club={edit.club} onClose={() => setEdit(null)} />}
      {confirm.node}
    </div>
  );
}
function ClubForm({ club, onClose }) {
  const { t, lang } = useApp();
  const states = ['Kuala Lumpur', 'Selangor', 'Pulau Pinang', 'Johor', 'Sabah', 'Melaka', 'Perak', 'Sarawak', 'Negeri Sembilan', 'Kedah', 'Pahang', 'Terengganu', 'Kelantan', 'Perlis'];
  const [f, setF] = useState(club || { club_name: '', state: states[0], club_category: 'club', manager_name: '', phone: '', email: '', color: '#1f6f43' });
  const [err, setErr] = useState({});
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => {
    const e = {};
    if (!f.club_name.trim()) e.club_name = '!';
    if (!f.manager_name.trim()) e.manager_name = '!';
    setErr(e); if (Object.keys(e).length) return;
    if (club) { BFM.updateClub(club.club_id, f); toast(t('club.updated')); }
    else { BFM.addClub(f); toast(t('club.added')); }
    onClose();
  };
  return (
    <Modal title={club ? t('cta.edit') : (lang === 0 ? 'Tambah Kelab' : 'Add Club')} onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>{t('cta.cancel')}</Button><Button variant="primary" icon={I.check} onClick={save}>{t('cta.save')}</Button></>}>
      <div className="grid field-grid-2" style={{ gap: 16 }}>
        <Field label={lang === 0 ? 'Nama Kelab' : 'Club Name'} error={err.club_name}><Input value={f.club_name} onChange={(e) => set('club_name', e.target.value)} /></Field>
        <Field label={t('lbl.state')}><Select value={f.state} onChange={(e) => set('state', e.target.value)}>{states.map((s) => <option key={s}>{s}</option>)}</Select></Field>
        <Field label={t('lbl.category')}><Select value={f.club_category} onChange={(e) => set('club_category', e.target.value)}><option value="club">Club</option><option value="school">School</option></Select></Field>
        <Field label={t('lbl.manager')} error={err.manager_name}><Input value={f.manager_name} onChange={(e) => set('manager_name', e.target.value)} /></Field>
        <Field label={lang === 0 ? 'Telefon' : 'Phone'}><Input value={f.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
        <Field label="Email"><Input value={f.email} onChange={(e) => set('email', e.target.value)} /></Field>
        <Field label={lang === 0 ? 'Warna' : 'Color'}><input type="color" value={f.color} onChange={(e) => set('color', e.target.value)} style={{ width: '100%', height: 44, borderRadius: 8, border: '1.5px solid var(--line)', cursor: 'pointer' }} /></Field>
      </div>
    </Modal>
  );
}

/* ---------- News admin (full CRUD) ---------- */
function NewsAdmin() {
  const { t, lang } = useApp();
  useStore();
  const [edit, setEdit] = useState(null);
  const confirm = useConfirm();
  const news = [...BFM.db.news].sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <div>
      <SectionHead title={t('dash.allnews')} action={<Button variant="primary" icon={I.plus} onClick={() => setEdit({})}>{lang === 0 ? 'Tambah Berita' : 'Add News'}</Button>} />
      <div className="col" style={{ gap: 12 }}>
        {news.map((nw) => (
          <div key={nw.id} className="card pad">
            <div className="row between center" style={{ gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div className="row center" style={{ gap: 10, marginBottom: 6 }}>
                  <span className="badge" style={{ background: 'var(--field)', color: '#fff' }}>{lang === 0 ? nw.cat_bm : nw.cat_en}</span>
                  <span className="muted" style={{ fontSize: 13 }}>{fmt.date(nw.date, lang)}</span>
                </div>
                <h3 style={{ fontWeight: 800, fontSize: 16 }}>{lang === 0 ? nw.title_bm : nw.title_en}</h3>
              </div>
              <div className="row" style={{ gap: 6 }}>
                <button className="btn btn-ghost btn-icon" onClick={() => setEdit({ nw })}><I.edit /></button>
                <button className="btn btn-ghost btn-icon" onClick={() => confirm.ask(t('confirm.del'), () => { BFM.deleteNews(nw.id); toast(t('news.deleted')); })}><I.trash /></button>
              </div>
            </div>
          </div>
        ))}
        {news.length === 0 && <div className="card"><Empty>{lang === 0 ? 'Tiada berita.' : 'No news.'}</Empty></div>}
      </div>
      {edit && <NewsForm nw={edit.nw} onClose={() => setEdit(null)} />}
      {confirm.node}
    </div>
  );
}
function NewsForm({ nw, onClose }) {
  const { t, lang } = useApp();
  const [f, setF] = useState(nw || { title_bm: '', title_en: '', cat_bm: 'Pengumuman', cat_en: 'Announcement', body_bm: '', body_en: '', date: new Date().toISOString().slice(0, 10) });
  const [err, setErr] = useState({});
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => {
    const e = {};
    if (!f.title_bm.trim()) e.title_bm = '!';
    if (!f.title_en.trim()) e.title_en = '!';
    setErr(e); if (Object.keys(e).length) return;
    if (nw) { BFM.updateNews(nw.id, f); toast(t('news.updated')); }
    else { BFM.addNews(f); toast(t('news.added')); }
    onClose();
  };
  return (
    <Modal wide title={nw ? t('cta.edit') : (lang === 0 ? 'Tambah Berita' : 'Add News')} onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>{t('cta.cancel')}</Button><Button variant="primary" icon={I.check} onClick={save}>{t('cta.save')}</Button></>}>
      <div className="grid field-grid-2" style={{ gap: 16 }}>
        <Field label="Tajuk (BM)" error={err.title_bm}><Input value={f.title_bm} onChange={(e) => set('title_bm', e.target.value)} /></Field>
        <Field label="Title (EN)" error={err.title_en}><Input value={f.title_en} onChange={(e) => set('title_en', e.target.value)} /></Field>
        <Field label="Kategori (BM)"><Input value={f.cat_bm} onChange={(e) => set('cat_bm', e.target.value)} /></Field>
        <Field label="Category (EN)"><Input value={f.cat_en} onChange={(e) => set('cat_en', e.target.value)} /></Field>
        <div style={{ gridColumn: '1 / -1' }}><Field label={t('lbl.date')}><Input type="date" value={f.date} onChange={(e) => set('date', e.target.value)} /></Field></div>
        <div style={{ gridColumn: '1 / -1' }}><Field label="Isi (BM)"><Textarea value={f.body_bm} onChange={(e) => set('body_bm', e.target.value)} /></Field></div>
        <div style={{ gridColumn: '1 / -1' }}><Field label="Body (EN)"><Textarea value={f.body_en} onChange={(e) => set('body_en', e.target.value)} /></Field></div>
      </div>
    </Modal>
  );
}

/* ---------- Payments admin (record) ---------- */
function PaymentsAdmin() {
  const { t, lang } = useApp();
  useStore();
  const [add, setAdd] = useState(false);
  const confirm = useConfirm();
  const revenue = BFM.db.payments.filter((p) => p.payment_status === 'completed').reduce((a, p) => a + p.payment_amount, 0);
  return (
    <div>
      <SectionHead title={t('dash.payments')} action={<Button variant="primary" icon={I.plus} onClick={() => setAdd(true)}>{t('cta.record')}</Button>} />
      <div className="card pad" style={{ marginBottom: 18, background: 'var(--field-darker)', color: '#fff' }}>
        <div className="stat-label" style={{ color: 'var(--field-glow)' }}>{lang === 0 ? 'Jumlah Kutipan' : 'Total Revenue'}</div>
        <div className="display" style={{ fontSize: 48, color: '#fff', marginTop: 4 }}>RM <Counter to={revenue} /></div>
      </div>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead><tr><th>{t('lbl.club')}</th><th>{t('nav.tournaments')}</th><th className="num">{t('lbl.amount')}</th><th>{t('lbl.method')}</th><th>{t('lbl.ref')}</th><th>{t('lbl.status')}</th><th></th></tr></thead>
          <tbody>
            {BFM.db.payments.map((p) => {
              const c = BFM.clubById(p.club_id), tn = BFM.tournamentById(p.tournament_id);
              return (
                <tr key={p.payment_id}>
                  <td><div className="row center" style={{ gap: 10 }}><ClubLogo club={c} size={30} /><span style={{ fontWeight: 700 }}>{c.club_name}</span></div></td>
                  <td className="muted">{tn?.tournament_name}</td>
                  <td className="num" style={{ color: 'var(--field)' }}>{fmt.money(p.payment_amount)}</td>
                  <td className="muted">{p.payment_method.replace('_', ' ').toUpperCase()}</td>
                  <td className="muted" style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{p.payment_reference || '—'}</td>
                  <td><StatusBadge status={p.payment_status} label={statusLbl(p.payment_status, lang)} /></td>
                  <td><button className="btn btn-ghost btn-icon" style={{ marginLeft: 'auto' }} onClick={() => confirm.ask(t('confirm.del'), () => { BFM.deletePayment(p.payment_id); toast(t('pay.deleted')); })}><I.trash /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {BFM.db.payments.length === 0 && <Empty>{lang === 0 ? 'Tiada bayaran direkodkan.' : 'No payments recorded.'}</Empty>}
      </div>
      {add && <PaymentForm onClose={() => setAdd(false)} />}
      {confirm.node}
    </div>
  );
}
function PaymentForm({ onClose }) {
  const { t, lang } = useApp();
  const approved = BFM.db.registrations.filter((r) => r.status === 'approved');
  const [f, setF] = useState({ reg: approved[0] ? `${approved[0].tournament_id}:${approved[0].club_id}` : '', amount: '', method: 'bank_transfer', ref: '' });
  const [err, setErr] = useState({});
  const save = () => {
    const e = {};
    if (!f.reg) e.reg = '!';
    if (!f.amount) e.amount = '!';
    setErr(e); if (Object.keys(e).length) return;
    const [tid, cid] = f.reg.split(':').map(Number);
    BFM.addPayment({ tournament_id: tid, club_id: cid, payment_amount: Number(f.amount), payment_method: f.method, payment_reference: f.ref, payment_status: 'completed' });
    toast(t('pay.recorded')); onClose();
  };
  return (
    <Modal title={t('cta.record')} onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>{t('cta.cancel')}</Button><Button variant="primary" icon={I.check} onClick={save}>{t('cta.save')}</Button></>}>
      <div className="col" style={{ gap: 16 }}>
        <Field label={lang === 0 ? 'Pendaftaran (Kelab · Kejohanan)' : 'Registration (Club · Tournament)'} error={err.reg}>
          <Select value={f.reg} onChange={(e) => { const [tid, cid] = e.target.value.split(':').map(Number); const tn = BFM.tournamentById(tid); setF((s) => ({ ...s, reg: e.target.value, amount: tn?.entry_fee || '' })); }}>
            {approved.map((r) => { const c = BFM.clubById(r.club_id), tn = BFM.tournamentById(r.tournament_id); return <option key={r.registration_id} value={`${r.tournament_id}:${r.club_id}`}>{c.club_name} · {tn?.tournament_name}</option>; })}
          </Select>
        </Field>
        <div className="grid field-grid-2" style={{ gap: 16 }}>
          <Field label={t('lbl.amount') + ' (RM)'} error={err.amount}><Input type="number" value={f.amount} onChange={(e) => setF((s) => ({ ...s, amount: e.target.value }))} /></Field>
          <Field label={t('lbl.method')}><Select value={f.method} onChange={(e) => setF((s) => ({ ...s, method: e.target.value }))}><option value="bank_transfer">Bank Transfer</option><option value="fpx">FPX</option><option value="cash">Cash</option><option value="cheque">Cheque</option></Select></Field>
        </div>
        <Field label={t('lbl.ref')}><Input value={f.ref} onChange={(e) => setF((s) => ({ ...s, ref: e.target.value }))} placeholder="TXN-2026-…" /></Field>
      </div>
    </Modal>
  );
}

Object.assign(window, { ManagerDashboard, AdminDashboard });
