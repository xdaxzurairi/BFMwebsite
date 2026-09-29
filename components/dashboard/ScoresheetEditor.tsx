'use client';

import { useMemo, useState, useTransition, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { ClubLogo } from '@/components/ui/ClubLogo';
import { Empty } from '@/components/ui/Empty';
import { I } from '@/components/ui/icons';
import { toast } from '@/lib/toast';
import { saveScoresheetAction, type BatLineInput, type PitchLineInput, type InningInput } from '@/app/actions/scoresheet';
import { BATTING_COLS, FIELDING_COLS, CATCHER_COLS, PITCHING_COLS, POSITIONS, balance, colTitle, ip, parseIp, sum, type Col } from '@/lib/scoresheet';
import type { Lang } from '@/lib/i18n';
import type { BattingCounts, Club, InningLine, Match, PitchingCounts, PitchingDecision, PitchingLine, Player, PlayerMatchStat } from '@/lib/types';

type Side = 'away' | 'home';
type Tab = 'line' | 'batting' | 'fielding' | 'pitching';
type BatKey = keyof BattingCounts;
type PitchKey = Exclude<keyof PitchingCounts, 'outs'>;

type BatEntry = { played: boolean; started: boolean; bo: string; pos: string } & Record<BatKey, string>;
type PitchEntry = { used: boolean; started: boolean; order: string; ip: string; decision: '' | PitchingDecision } & Record<PitchKey, string>;
type InningCell = { away: string; home: string };

const BAT_KEYS = [...BATTING_COLS, ...FIELDING_COLS, ...CATCHER_COLS].map((c) => c.key);
const PITCH_KEYS = PITCHING_COLS.map((c) => c.key);
const blankBat = (): BatEntry => ({ played: false, started: false, bo: '', pos: '', ...(Object.fromEntries(BAT_KEYS.map((k) => [k, ''])) as Record<BatKey, string>) });
const blankPitch = (): PitchEntry => ({ used: false, started: false, order: '', ip: '', decision: '', ...(Object.fromEntries(PITCH_KEYS.map((k) => [k, ''])) as Record<PitchKey, string>) });
const n = (s: string) => (s === '' ? 0 : Number(s));
const digits = (s: string, len = 2) => s.replace(/\D/g, '').slice(0, len);
const L = (lang: Lang, bm: string, en: string) => (lang === 0 ? bm : en);

/* Enter / arrow up-down move to the same column in the next/previous row, like a spreadsheet. */
function gridKeys(e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) {
  const el = e.currentTarget;
  const step = e.key === 'Enter' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
  if (!step) return;
  const r = Number(el.dataset.r);
  const table = el.closest('table');
  const next = table?.querySelector<HTMLInputElement>(`[data-r="${r + step}"][data-c="${el.dataset.c}"]`);
  if (next) {
    e.preventDefault();
    next.focus();
    if (next instanceof HTMLInputElement) next.select();
  }
}

export function ScoresheetEditor({
  match,
  away,
  home,
  players,
  batting,
  pitching,
  innings,
  lang,
}: {
  match: Match;
  away: Club;
  home: Club;
  players: Player[];
  batting: PlayerMatchStat[];
  pitching: PitchingLine[];
  innings: InningLine[];
  lang: Lang;
}) {
  const router = useRouter();
  const [saving, startSave] = useTransition();
  const [tab, setTab] = useState<Tab>('line');
  const [side, setSide] = useState<Side>('away');
  const clubs = { away, home };

  const [bat, setBat] = useState<Record<number, BatEntry>>(() =>
    Object.fromEntries(
      batting.map((s) => [
        s.player_id,
        {
          played: true,
          started: s.started,
          bo: s.batting_order ? String(s.batting_order) : '',
          pos: s.position_played ?? '',
          ...(Object.fromEntries(BAT_KEYS.map((k) => [k, s[k] ? String(s[k]) : ''])) as Record<BatKey, string>),
        },
      ]),
    ),
  );
  const [pit, setPit] = useState<Record<number, PitchEntry>>(() =>
    Object.fromEntries(
      pitching.map((p) => [
        p.player_id,
        {
          used: true,
          started: p.started,
          order: String(p.pitch_order),
          ip: ip(p.outs),
          decision: p.decision ?? '',
          ...(Object.fromEntries(PITCH_KEYS.map((k) => [k, p[k] ? String(p[k]) : ''])) as Record<PitchKey, string>),
        },
      ]),
    ),
  );
  const [line, setLine] = useState<InningCell[]>(() => {
    const cols = Math.max(9, ...innings.map((i) => i.inning));
    const by = new Map(innings.map((i) => [i.inning, i]));
    return Array.from({ length: cols }, (_, k) => {
      const i = by.get(k + 1);
      const cell = (v: number | null | undefined) => (i ? (v == null ? 'X' : String(v)) : '');
      return { away: cell(i?.away_runs), home: cell(i?.home_runs) };
    });
  });
  const [lob, setLob] = useState({ away: match.away_lob != null ? String(match.away_lob) : '', home: match.home_lob != null ? String(match.home_lob) : '' });
  const [endedAt, setEndedAt] = useState(() => (match.ended_at ? toMyt(match.ended_at) : ''));

  const roster = (s: Side) => players.filter((p) => p.club_id === clubs[s].club_id);

  /* Row order is fixed when the page opens (saved lineup first) so rows don't jump while typing. */
  const [batRank] = useState(() => rank(players, (p) => {
    const s = batting.find((b) => b.player_id === p.player_id);
    return [s ? 0 : 1, s?.batting_order ?? 99, s?.started ? 0 : 1, p.jersey_number];
  }));
  const [pitRank] = useState(() => rank(players, (p) => {
    const l = pitching.find((x) => x.player_id === p.player_id);
    return [l ? 0 : 1, l?.pitch_order ?? 99, p.position === 'P' ? 0 : 1, p.jersey_number];
  }));

  const setBatField = (pid: number, key: keyof BatEntry, value: string | boolean) =>
    setBat((prev) => {
      const cur = prev[pid] ?? blankBat();
      const next = { ...cur, [key]: value } as BatEntry;
      if (key !== 'played' && value !== '' && value !== false) next.played = true;
      return { ...prev, [pid]: next };
    });
  const setPitField = (pid: number, key: keyof PitchEntry, value: string | boolean) =>
    setPit((prev) => {
      const cur = prev[pid] ?? blankPitch();
      const next = { ...cur, [key]: value } as PitchEntry;
      if (key !== 'used' && value !== '' && value !== false) next.used = true;
      return { ...prev, [pid]: next };
    });

  /* ---------- payload ---------- */
  const clubOf = useMemo(() => new Map(players.map((p) => [p.player_id, p.club_id])), [players]);

  const batLines: BatLineInput[] = Object.entries(bat)
    .filter(([, e]) => e.played)
    .map(([pid, e]) => ({
      player_id: Number(pid),
      started: e.started,
      batting_order: e.bo ? Number(e.bo) : null,
      position_played: e.pos || null,
      ...(Object.fromEntries(BAT_KEYS.map((k) => [k, n(e[k])])) as BattingCounts),
    }));
  const pitLines: PitchLineInput[] = Object.entries(pit)
    .filter(([, e]) => e.used)
    .map(([pid, e], i) => ({
      player_id: Number(pid),
      pitch_order: e.order ? Number(e.order) : i + 1,
      started: e.started,
      decision: e.decision || null,
      outs: parseIp(e.ip || '0') ?? -1,
      ...(Object.fromEntries(PITCH_KEYS.map((k) => [k, n(e[k])])) as Omit<PitchingCounts, 'outs'>),
    }));
  const cellRuns = (v: string) => (v === '' || v.toUpperCase() === 'X' ? null : Number(v));
  const inningLines: InningInput[] = line.flatMap((c, k) => (c.away === '' && c.home === '' ? [] : [{ inning: k + 1, away_runs: cellRuns(c.away), home_runs: cellRuns(c.home) }]));

  const badIp = Object.values(pit).some((e) => e.used && e.ip !== '' && parseIp(e.ip) == null);
  const badBat = batLines.some((l) => l.hits > l.at_bats || l.doubles + l.triples + l.home_runs > l.hits);
  const badPit = pitLines.some((p) => p.hits > p.at_bats);

  const checks = balance(
    match,
    inningLines,
    {
      clubId: away.club_id,
      name: away.club_name,
      score: match.away_score,
      batting: batLines.filter((l) => clubOf.get(l.player_id) === away.club_id),
      pitching: pitLines.filter((p) => clubOf.get(p.player_id) === away.club_id),
    },
    {
      clubId: home.club_id,
      name: home.club_name,
      score: match.home_score,
      batting: batLines.filter((l) => clubOf.get(l.player_id) === home.club_id),
      pitching: pitLines.filter((p) => clubOf.get(p.player_id) === home.club_id),
    },
    pitLines.map((p) => p.decision),
  );
  const badChecks = checks.filter((c) => !c.ok).length;

  const save = () =>
    startSave(async () => {
      const res = await saveScoresheetAction(match.match_id, {
        batting: batLines,
        pitching: pitLines,
        innings: inningLines,
        away_lob: lob.away === '' ? null : Number(lob.away),
        home_lob: lob.home === '' ? null : Number(lob.home),
        ended_at: endedAt ? fromMyt(endedAt) : null,
      });
      if (res.error) return toast(res.error, true);
      toast(badChecks ? L(lang, `Scoresheet disimpan — ${badChecks} semakan belum seimbang.`, `Scoresheet saved — ${badChecks} checks still out of balance.`) : L(lang, 'Scoresheet disimpan dan seimbang.', 'Scoresheet saved and balanced.'));
      router.refresh();
    });

  /* ---------- rendering ---------- */
  const teamSwitch = (
    <div className="seg" role="group" aria-label={L(lang, 'Pilih pasukan', 'Choose team')}>
      {(['away', 'home'] as const).map((s) => (
        <button key={s} type="button" className={side === s ? 'on' : ''} aria-pressed={side === s} onClick={() => setSide(s)}>
          <ClubLogo club={clubs[s]} size={22} />
          {clubs[s].club_name}
          <span className="muted" style={{ fontWeight: 600 }}>
            · {batLines.filter((l) => clubOf.get(l.player_id) === clubs[s].club_id).length}
          </span>
        </button>
      ))}
    </div>
  );

  const numCell = (value: string, onChange: (v: string) => void, r: number, c: string, label: string, bad = false, wide = false) => (
    <input
      className={`ss-in ${bad ? 'bad' : ''} ${wide ? 'wide' : ''}`}
      inputMode="numeric"
      placeholder="0"
      aria-label={label}
      value={value}
      data-r={r}
      data-c={c}
      onKeyDown={gridKeys}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => onChange(digits(e.target.value))}
    />
  );

  const colHead = (c: Col<string>, grp?: boolean) => (
    <th key={c.key} className={grp ? 'grp' : undefined}>
      <abbr title={colTitle(c, lang)}>{c.abbr}</abbr>
    </th>
  );

  const playerCell = (p: Player) => (
    <td className="pl">
      <span style={{ fontWeight: 700 }}>
        {p.first_name} {p.last_name}
      </span>
      <span className="jn">#{p.jersey_number}</span>
      {p.position && <span className="pos">{p.position}</span>}
    </td>
  );

  const battingGrid = (cols: Col<BatKey>[], withLineup: boolean) => {
    const list = roster(side);
    if (!list.length) return <Empty>{L(lang, 'Tiada pemain aktif dalam roster.', 'No active players on the roster.')}</Empty>;
    const rows = [...list].sort((a, b) => batRank.get(a.player_id)! - batRank.get(b.player_id)!);
    const played = rows.filter((p) => bat[p.player_id]?.played);
    return (
      <div className="card sheet-card">
        <div className="sheet-scroll">
          <table className="sheet-tbl">
            <thead>
              <tr>
                <th>
                  <abbr title={L(lang, 'Main dalam perlawanan', 'Played in the game')}>✓</abbr>
                </th>
                {withLineup && (
                  <>
                    <th>
                      <abbr title={L(lang, 'Susunan pukulan', 'Batting order')}>BO</abbr>
                    </th>
                    <th>POS</th>
                    <th>
                      <abbr title={L(lang, 'Pemain permulaan', 'Starter')}>GS</abbr>
                    </th>
                  </>
                )}
                <th className="pl">{L(lang, 'Pemain', 'Player')}</th>
                {cols.map((c) => colHead(c))}
              </tr>
            </thead>
            <tbody>
              {rows.map((p, r) => {
                const e = bat[p.player_id] ?? blankBat();
                const hitsBad = e.played && n(e.hits) > n(e.at_bats);
                const xbhBad = e.played && n(e.doubles) + n(e.triples) + n(e.home_runs) > n(e.hits);
                return (
                  <tr key={p.player_id} className={e.played ? undefined : 'off'}>
                    <td className="chk">
                      <input type="checkbox" aria-label={`${p.first_name} ${p.last_name}`} checked={e.played} onChange={(ev) => setBatField(p.player_id, 'played', ev.target.checked)} />
                    </td>
                    {withLineup && (
                      <>
                        <td>{numCell(e.bo, (v) => setBatField(p.player_id, 'bo', v), r, 'bo', 'BO')}</td>
                        <td>
                          <select className="ss-sel" aria-label="POS" value={e.pos} data-r={r} data-c="pos" onKeyDown={gridKeys} onChange={(ev) => setBatField(p.player_id, 'pos', ev.target.value)}>
                            <option value="">–</option>
                            {POSITIONS.map((pos) => (
                              <option key={pos} value={pos}>
                                {pos}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="chk">
                          <input type="checkbox" aria-label="GS" checked={e.started} onChange={(ev) => setBatField(p.player_id, 'started', ev.target.checked)} />
                        </td>
                      </>
                    )}
                    {playerCell(p)}
                    {cols.map((c) => (
                      <td key={c.key}>
                        {numCell(
                          e[c.key],
                          (v) => setBatField(p.player_id, c.key, v),
                          r,
                          c.key,
                          `${c.abbr} ${p.first_name} ${p.last_name}`,
                          (c.key === 'hits' && hitsBad) || (['doubles', 'triples', 'home_runs'].includes(c.key) && xbhBad),
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
              <tr className="total">
                <td />
                {withLineup && <td colSpan={3} />}
                <td className="pl" style={{ background: 'var(--cream)' }}>
                  {L(lang, 'Jumlah', 'Totals')} · {played.length}
                </td>
                {cols.map((c) => (
                  <td key={c.key}>{sum(played, (p) => n(bat[p.player_id][c.key]))}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const pitchingGrid = () => {
    const list = [...roster(side)].sort((a, b) => pitRank.get(a.player_id)! - pitRank.get(b.player_id)!);
    if (!list.length) return <Empty>{L(lang, 'Tiada pemain aktif dalam roster.', 'No active players on the roster.')}</Empty>;
    const used = list.filter((p) => pit[p.player_id]?.used);
    return (
      <div className="card sheet-card">
        <div className="sheet-scroll">
          <table className="sheet-tbl">
            <thead>
              <tr>
                <th>✓</th>
                <th>
                  <abbr title={L(lang, 'Giliran pitcher', 'Pitching order')}>#</abbr>
                </th>
                <th>
                  <abbr title={L(lang, 'Pitcher permulaan', 'Starting pitcher')}>GS</abbr>
                </th>
                <th className="pl">Pitcher</th>
                <th>
                  <abbr title={L(lang, 'IP — inning dipitch, cth 5.1 = 5⅓ (TM PO ÷ 3)', 'IP — innings pitched, e.g. 5.1 = 5⅓ (TM PO ÷ 3)')}>IP</abbr>
                </th>
                {PITCHING_COLS.map((c) => colHead(c))}
                <th>
                  <abbr title={L(lang, 'Keputusan: menang / kalah / save', 'Decision: win / loss / save')}>W/L/S</abbr>
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((p, r) => {
                const e = pit[p.player_id] ?? blankPitch();
                const ipBad = e.used && e.ip !== '' && parseIp(e.ip) == null;
                return (
                  <tr key={p.player_id} className={e.used ? undefined : 'off'}>
                    <td className="chk">
                      <input type="checkbox" aria-label={`${p.first_name} ${p.last_name}`} checked={e.used} onChange={(ev) => setPitField(p.player_id, 'used', ev.target.checked)} />
                    </td>
                    <td>{numCell(e.order, (v) => setPitField(p.player_id, 'order', v), r, 'order', '#')}</td>
                    <td className="chk">
                      <input type="checkbox" aria-label="GS" checked={e.started} onChange={(ev) => setPitField(p.player_id, 'started', ev.target.checked)} />
                    </td>
                    {playerCell(p)}
                    <td>
                      <input
                        className={`ss-in wide ${ipBad ? 'bad' : ''}`}
                        inputMode="decimal"
                        placeholder="0.0"
                        aria-label={`IP ${p.first_name} ${p.last_name}`}
                        value={e.ip}
                        data-r={r}
                        data-c="ip"
                        onKeyDown={gridKeys}
                        onFocus={(ev) => ev.currentTarget.select()}
                        onChange={(ev) => setPitField(p.player_id, 'ip', ev.target.value.replace(/[^\d.]/g, '').slice(0, 4))}
                      />
                    </td>
                    {PITCHING_COLS.map((c) => (
                      <td key={c.key}>
                        {numCell(e[c.key], (v) => setPitField(p.player_id, c.key, v), r, c.key, `${c.abbr} ${p.first_name} ${p.last_name}`, c.key === 'hits' && e.used && n(e.hits) > n(e.at_bats))}
                      </td>
                    ))}
                    <td>
                      <select className="ss-sel" aria-label="W/L/S" value={e.decision} data-r={r} data-c="dec" onKeyDown={gridKeys} onChange={(ev) => setPitField(p.player_id, 'decision', ev.target.value)}>
                        <option value="">–</option>
                        <option value="win">W</option>
                        <option value="loss">L</option>
                        <option value="save">S</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
              <tr className="total">
                <td colSpan={3} />
                <td className="pl" style={{ background: 'var(--cream)' }}>
                  {L(lang, 'Jumlah', 'Totals')} · {used.length}
                </td>
                <td>{ip(sum(used, (p) => parseIp(pit[p.player_id].ip || '0') ?? 0))}</td>
                {PITCHING_COLS.map((c) => (
                  <td key={c.key}>{sum(used, (p) => n(pit[p.player_id][c.key]))}</td>
                ))}
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const lineGrid = () => {
    const total = (s: Side) => sum(line, (c) => (c[s] === '' || c[s].toUpperCase() === 'X' ? 0 : Number(c[s])));
    const score = { away: match.away_score, home: match.home_score };
    return (
      <div className="card sheet-card">
        <div className="sheet-scroll">
          <table className="sheet-tbl">
            <thead>
              <tr>
                <th className="pl">{L(lang, 'Pasukan', 'Team')}</th>
                {line.map((_, k) => (
                  <th key={k}>{k + 1}</th>
                ))}
                <th className="grp">R</th>
                <th>
                  <abbr title={L(lang, 'Skor rasmi perlawanan', 'Official match score')}>{L(lang, 'Skor', 'Score')}</abbr>
                </th>
                <th className="grp">
                  <abbr title={L(lang, 'LOB — Ditinggal di base', 'LOB — Left on base')}>LOB</abbr>
                </th>
              </tr>
            </thead>
            <tbody>
              {(['away', 'home'] as const).map((s, r) => (
                <tr key={s}>
                  <td className="pl">
                    <span className="row center" style={{ gap: 8 }}>
                      <ClubLogo club={clubs[s]} size={24} />
                      <span style={{ fontWeight: 800 }}>{clubs[s].club_name}</span>
                    </span>
                  </td>
                  {line.map((c, k) => (
                    <td key={k}>
                      <input
                        className="ss-in"
                        inputMode="numeric"
                        placeholder="·"
                        aria-label={`${clubs[s].club_name} inning ${k + 1}`}
                        title={L(lang, 'Nombor, atau X jika tidak dimain', 'Number, or X if not played')}
                        value={c[s]}
                        data-r={r}
                        data-c={`i${k}`}
                        onKeyDown={gridKeys}
                        onFocus={(e) => e.currentTarget.select()}
                        onChange={(e) => {
                          const raw = e.target.value.toUpperCase();
                          const v = raw.includes('X') ? 'X' : digits(raw);
                          setLine((prev) => prev.map((cell, j) => (j === k ? { ...cell, [s]: v } : cell)));
                        }}
                      />
                    </td>
                  ))}
                  <td className="grp" style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 400 }}>
                    {total(s)}
                  </td>
                  <td style={score[s] != null && total(s) !== score[s] ? { color: 'var(--bad)' } : undefined}>{score[s] ?? '—'}</td>
                  <td className="grp">{numCell(lob[s], (v) => setLob((prev) => ({ ...prev, [s]: v })), r, 'lob', `LOB ${clubs[s].club_name}`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="sheet-notes row center wrap-w" style={{ gap: 12, justifyContent: 'space-between' }}>
          <span className="row center wrap-w" style={{ gap: 8 }}>
            <Button type="button" size="sm" variant="ghost" icon={I.plus} onClick={() => setLine((prev) => (prev.length < 30 ? [...prev, { away: '', home: '' }] : prev))}>
              {L(lang, 'Tambah inning', 'Add inning')}
            </Button>
            {line.length > 9 && (
              <Button type="button" size="sm" variant="ghost" icon={I.x} onClick={() => setLine((prev) => prev.slice(0, -1))}>
                {L(lang, 'Buang inning terakhir', 'Remove last inning')}
              </Button>
            )}
          </span>
          <label className="row center" style={{ gap: 8 }}>
            <span className="stat-label">{L(lang, 'Masa tamat (MYT)', 'End time (MYT)')}</span>
            <input className="input" type="datetime-local" style={{ width: 'auto', padding: '6px 10px' }} value={endedAt} onChange={(e) => setEndedAt(e.target.value)} />
          </label>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="row between center wrap-w" style={{ gap: 12, marginBottom: 18 }}>
        <div>
          <Link href="/dashboard/matches" className="btn btn-ghost btn-sm" style={{ marginBottom: 10 }}>
            <I.arrowL />
            {L(lang, 'Semua perlawanan', 'All matches')}
          </Link>
          <div className="kicker">{L(lang, 'Scoresheet rasmi', 'Official scoresheet')} · {match.match_number}</div>
          <h2 className="h-md" style={{ margin: '6px 0 0' }}>
            {away.club_name} <span className="muted">@</span> {home.club_name}
          </h2>
        </div>
        <Link href={`/matches/${match.match_id}`} className="btn btn-ghost btn-sm" target="_blank">
          {L(lang, 'Lihat Match Centre', 'View Match Centre')} <I.arrow />
        </Link>
      </div>

      <div className={`card pad ss-balance ${badChecks ? 'has-bad' : ''}`} aria-live="polite">
        <div className="row between center" style={{ marginBottom: checks.length ? 10 : 0 }}>
          <span className="stat-label">{L(lang, 'Semakan imbangan', 'Balance check')}</span>
          <span className="stat-label" style={{ color: badChecks ? 'var(--bad)' : 'var(--ok)' }}>
            {checks.length === 0 ? L(lang, 'Belum ada data', 'No data yet') : badChecks ? `${badChecks} ${L(lang, 'tidak seimbang', 'out of balance')}` : L(lang, 'Seimbang', 'Balanced')}
          </span>
        </div>
        {checks.length > 0 && (
          <ul>
            {checks.map((c, i) => (
              <li key={i} className={c.ok ? 'ok' : 'bad'}>
                {c.ok ? <I.check /> : <I.alert />}
                {c.text[lang]}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="ss-toolbar">
        <Tabs
          tabs={[
            { id: 'line', label: 'Line Score' },
            { id: 'batting', label: L(lang, 'Pukulan', 'Batting') },
            { id: 'fielding', label: 'Fielding' },
            { id: 'pitching', label: 'Pitching' },
          ]}
          value={tab}
          onChange={(v) => setTab(v as Tab)}
        />
        {tab !== 'line' && teamSwitch}
      </div>

      {tab === 'line' && lineGrid()}
      {tab === 'batting' && battingGrid(BATTING_COLS, true)}
      {tab === 'fielding' && battingGrid([...FIELDING_COLS, ...CATCHER_COLS], false)}
      {tab === 'pitching' && pitchingGrid()}

      <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
        {L(
          lang,
          'Tip: Enter / ↑ ↓ bergerak antara baris, Tab antara kolum. Menaip dalam mana-mana sel menandakan pemain itu bermain. Skor akhir disunting dalam borang perlawanan.',
          'Tip: Enter / ↑ ↓ move between rows, Tab between columns. Typing in any cell marks the player as having played. The final score is edited in the match form.',
        )}
      </p>

      <div className="ss-actions">
        <span className="muted" style={{ fontSize: 13, marginRight: 'auto' }}>
          {batLines.length} {L(lang, 'baris pukulan', 'batting lines')} · {pitLines.length} pitcher · {inningLines.length} inning
        </span>
        <Link href="/dashboard/matches" className="btn btn-ghost">
          {L(lang, 'Batal', 'Cancel')}
        </Link>
        <Button variant="primary" icon={I.check} disabled={saving || badIp || badBat || badPit} onClick={save}>
          {saving ? L(lang, 'Menyimpan…', 'Saving…') : L(lang, 'Simpan Scoresheet', 'Save Scoresheet')}
        </Button>
      </div>
    </div>
  );
}

/* player_id -> position after sorting by the given key tuple (compared element by element). */
function rank(players: Player[], key: (p: Player) => number[]) {
  const keyed = players.map((p) => ({ id: p.player_id, k: key(p) }));
  keyed.sort((a, b) => {
    for (let i = 0; i < a.k.length; i++) if (a.k[i] !== b.k[i]) return a.k[i] - b.k[i];
    return 0;
  });
  return new Map(keyed.map((x, i) => [x.id, i]));
}

/* <input type="datetime-local"> values are Malaysia time (UTC+8, no DST), so the server
   and the browser render the same value regardless of their own timezone. */
const MYT_MS = 8 * 60 * 60 * 1000;
const toMyt = (iso: string) => new Date(Date.parse(iso) + MYT_MS).toISOString().slice(0, 16);
const fromMyt = (local: string) => new Date(`${local}:00+08:00`).toISOString();
