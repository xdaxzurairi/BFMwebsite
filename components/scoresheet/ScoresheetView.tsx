'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Tabs } from '@/components/ui/Tabs';
import { ClubLogo } from '@/components/ui/ClubLogo';
import { Button } from '@/components/ui/Button';
import { I } from '@/components/ui/icons';
import { BATTING_COLS, FIELDING_COLS, CATCHER_COLS, colTitle, dot, ip, era, sum, strikeouts, type Col } from '@/lib/scoresheet';
import type { Lang } from '@/lib/i18n';
import type { BattingCounts, Club, PitchingLine, Player, PlayerMatchStat } from '@/lib/types';

export type BatRow = PlayerMatchStat & { player: Player };
export type PitchRow = PitchingLine & { player: Player };
export type TeamSheet = { club: Club; batting: BatRow[]; pitching: PitchRow[] };

type Tab = 'batting' | 'pitching' | 'fielding';

const L = (lang: Lang, bm: string, en: string) => (lang === 0 ? bm : en);
const name = (p: Player) => `${p.first_name} ${p.last_name}`.trim();
const short = (p: Player) => `${p.first_name.charAt(0)}. ${p.last_name}`.trim();

/* Batting order first (starter before the subs who took the same slot), unslotted players last. */
function lineup(rows: BatRow[]) {
  return [...rows].sort((a, b) => (a.batting_order ?? 99) - (b.batting_order ?? 99) || Number(b.started) - Number(a.started) || a.player.jersey_number - b.player.jersey_number);
}

export function ScoresheetView({ away, home, lang, gameInnings = 9 }: { away: TeamSheet; home: TeamSheet; lang: Lang; gameInnings?: number }) {
  const [tab, setTab] = useState<Tab>('batting');
  const [side, setSide] = useState<'away' | 'home'>('away');
  const teams = { away, home };
  const opp = (s: 'away' | 'home') => teams[s === 'away' ? 'home' : 'away'];

  const decisions = (['win', 'loss', 'save'] as const).flatMap((d) =>
    [away, home].flatMap((t) => t.pitching.filter((p) => p.decision === d).map((p) => ({ d, p, club: t.club }))),
  );

  return (
    <div>
      <div className="ss-toolbar">
        <Tabs
          tabs={[
            { id: 'batting', label: L(lang, 'Pukulan', 'Batting') },
            { id: 'pitching', label: 'Pitching' },
            { id: 'fielding', label: 'Fielding' },
          ]}
          value={tab}
          onChange={(v) => setTab(v as Tab)}
        />
        <div className="row center" style={{ gap: 10 }}>
          <div className="seg" role="group" aria-label={L(lang, 'Pilih pasukan', 'Choose team')}>
            {(['away', 'home'] as const).map((s) => (
              <button key={s} className={side === s ? 'on' : ''} aria-pressed={side === s} onClick={() => setSide(s)}>
                <ClubLogo club={teams[s].club} size={22} />
                {teams[s].club.club_name}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" icon={I.print} onClick={() => window.print()}>
            {L(lang, 'Cetak', 'Print')}
          </Button>
        </div>
      </div>

      {(['away', 'home'] as const).map((s) => (
        <div key={s}>
          <div className={tab === 'batting' && side === s ? '' : 'ss-hide'}>
            <BattingTable team={teams[s]} lang={lang} />
          </div>
          <div className={tab === 'pitching' && side === s ? '' : 'ss-hide'}>
            <PitchingTable team={teams[s]} battedAgainst={opp(s)} lang={lang} gameInnings={gameInnings} />
          </div>
          <div className={tab === 'fielding' && side === s ? '' : 'ss-hide'}>
            <FieldingTable team={teams[s]} lang={lang} />
          </div>
        </div>
      ))}

      {decisions.length > 0 && (
        <div className="card dec-strip" style={{ marginTop: 14 }}>
          {decisions.map(({ d, p, club }) => (
            <span key={p.pitch_id}>
              <span className="stat-label">{d === 'win' ? 'W' : d === 'loss' ? 'L' : 'S'}</span>
              <Link href={`/players/${p.player.player_id}`} style={{ fontWeight: 800 }}>
                {name(p.player)}
              </Link>{' '}
              <span className="muted">({club.club_name})</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Head({ team, label }: { team: TeamSheet; label: string }) {
  return (
    <div className="sheet-head">
      <ClubLogo club={team.club} size={30} />
      <div>
        <div className="stat-label">{label}</div>
        <div style={{ fontWeight: 800 }}>{team.club.club_name}</div>
      </div>
    </div>
  );
}

function Num({ n, hl }: { n: number; hl?: boolean }) {
  return <td className={n ? (hl ? 'hl' : undefined) : 'z'}>{dot(n)}</td>;
}

function PlayerCell({ p, pos }: { p: Player; pos?: string | null }) {
  return (
    <td className="pl">
      <Link href={`/players/${p.player_id}`} style={{ fontWeight: 700 }}>
        {name(p)}
      </Link>
      <span className="jn">#{p.jersey_number}</span>
      {pos && <span className="pos">{pos}</span>}
    </td>
  );
}

/* "2B: Ali, Tan 2 · HR: Wong" — the newspaper-style notes under a box score. */
function Notes({ rows, cols, lang }: { rows: BatRow[]; cols: { key: keyof BattingCounts; label: string }[]; lang: Lang }) {
  const parts = cols.flatMap(({ key, label }) => {
    const who = rows.filter((r) => r[key] > 0).map((r) => `${short(r.player)}${r[key] > 1 ? ` ${r[key]}` : ''}`);
    return who.length ? [{ label, text: who.join(', ') }] : [];
  });
  if (!parts.length) return null;
  return (
    <div className="sheet-notes" aria-label={L(lang, 'Nota', 'Notes')}>
      {parts.map((p) => (
        <span key={p.label}>
          <b>{p.label}:</b>
          {p.text}
        </span>
      ))}
    </div>
  );
}

function Th({ c, lang, grp }: { c: Col<string>; lang: Lang; grp?: boolean }) {
  return (
    <th className={grp ? 'grp' : undefined}>
      <abbr title={colTitle(c, lang)}>{c.abbr}</abbr>
    </th>
  );
}

/* Group dividers after RBI (counting), HR (power), CS (baserunning). */
const BAT_GROUP_START = new Set<keyof BattingCounts>(['doubles', 'sac_hits', 'walks', 'strikeouts_swinging', 'stolen_bases']);

function BattingTable({ team, lang }: { team: TeamSheet; lang: Lang }) {
  const rows = lineup(team.batting);
  const seen = new Set<number>();
  return (
    <div className="card sheet-card">
      <Head team={team} label={L(lang, 'Pukulan', 'Batting')} />
      {rows.length === 0 ? (
        <p className="muted" style={{ padding: '0 18px 18px' }}>
          {L(lang, 'Tiada stats pukulan.', 'No batting stats.')}
        </p>
      ) : (
        <>
          <div className="sheet-scroll">
            <table className="sheet-tbl">
              <thead>
                <tr>
                  <th className="bo">BO</th>
                  <th className="pl">{L(lang, 'Pemain', 'Player')}</th>
                  {BATTING_COLS.map((c) => (
                    <Th key={c.key} c={c} lang={lang} grp={BAT_GROUP_START.has(c.key)} />
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const sub = r.batting_order != null && seen.has(r.batting_order);
                  if (r.batting_order != null) seen.add(r.batting_order);
                  return (
                    <tr key={r.stat_id} className={sub ? 'sub' : undefined}>
                      <td className="bo">{sub ? '' : (r.batting_order ?? '–')}</td>
                      <PlayerCell p={r.player} pos={r.position_played} />
                      {BATTING_COLS.map((c) => (
                        <td key={c.key} className={`${r[c.key] ? (c.key === 'home_runs' || c.key === 'hits' ? 'hl' : '') : 'z'} ${BAT_GROUP_START.has(c.key) ? 'grp' : ''}`}>
                          {dot(r[c.key])}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                <tr className="total">
                  <td className="bo" />
                  <td className="pl" style={{ background: 'var(--cream)' }}>
                    {L(lang, 'Jumlah', 'Totals')}
                  </td>
                  {BATTING_COLS.map((c) => (
                    <td key={c.key} className={BAT_GROUP_START.has(c.key) ? 'grp' : undefined}>
                      {sum(rows, (r) => r[c.key])}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <Notes
            rows={rows}
            lang={lang}
            cols={[
              { key: 'doubles', label: '2B' },
              { key: 'triples', label: '3B' },
              { key: 'home_runs', label: 'HR' },
              { key: 'rbi', label: 'RBI' },
              { key: 'sac_hits', label: 'SH' },
              { key: 'sac_flies', label: 'SF' },
              { key: 'hit_by_pitch', label: 'HBP' },
              { key: 'stolen_bases', label: 'SB' },
              { key: 'caught_stealing', label: 'CS' },
            ]}
          />
        </>
      )}
    </div>
  );
}

function PitchingTable({ team, battedAgainst, lang, gameInnings }: { team: TeamSheet; battedAgainst: TeamSheet; lang: Lang; gameInnings: number }) {
  const rows = [...team.pitching].sort((a, b) => a.pitch_order - b.pitch_order);
  const oppRuns = sum(battedAgainst.batting, (b) => b.runs);
  const complete = rows.length === 1 && rows[0].started;
  return (
    <div className="card sheet-card">
      <Head team={team} label="Pitching" />
      {rows.length === 0 ? (
        <p className="muted" style={{ padding: '0 18px 18px' }}>
          {L(lang, 'Tiada stats pitching.', 'No pitching stats.')}
        </p>
      ) : (
        <>
          <div className="sheet-scroll">
            <table className="sheet-tbl">
              <thead>
                <tr>
                  <th className="pl">Pitcher</th>
                  <th>
                    <abbr title={L(lang, 'IP — Inning dipitch', 'IP — Innings pitched')}>IP</abbr>
                  </th>
                  <th>H</th>
                  <th>
                    <abbr title={L(lang, 'R — Jumlah larian (ER + UR)', 'R — Total runs (ER + UR)')}>R</abbr>
                  </th>
                  <th>ER</th>
                  <th>BB</th>
                  <th>
                    <abbr title={L(lang, 'SO — Strikeout (SOS + SOL)', 'SO — Strikeouts (SOS + SOL)')}>SO</abbr>
                  </th>
                  <th className="grp">WP</th>
                  <th>BK</th>
                  <th>AB</th>
                  <th className="grp">
                    <abbr title={L(lang, `ERA perlawanan (skala ${gameInnings} inning)`, `Game ERA (scaled to ${gameInnings} innings)`)}>ERA</abbr>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.pitch_id}>
                    <td className="pl">
                      <Link href={`/players/${p.player.player_id}`} style={{ fontWeight: 700 }}>
                        {name(p.player)}
                      </Link>
                      <span className="jn">#{p.player.jersey_number}</span>
                      {p.decision && <span className={`dec dec-${p.decision}`}>{p.decision === 'win' ? 'W' : p.decision === 'loss' ? 'L' : 'S'}</span>}
                    </td>
                    <td>{ip(p.outs)}</td>
                    <Num n={p.hits} />
                    <Num n={p.earned_runs + p.unearned_runs} />
                    <Num n={p.earned_runs} />
                    <Num n={p.walks} />
                    <Num n={strikeouts(p)} hl />
                    <td className={`grp ${p.wild_pitches ? '' : 'z'}`}>{dot(p.wild_pitches)}</td>
                    <Num n={p.balks} />
                    <Num n={p.at_bats} />
                    <td className="grp">{era(p.earned_runs, p.outs, gameInnings)}</td>
                  </tr>
                ))}
                <tr className="total">
                  <td className="pl" style={{ background: 'var(--cream)' }}>
                    {L(lang, 'Jumlah', 'Totals')}
                  </td>
                  <td>{ip(sum(rows, (p) => p.outs))}</td>
                  <td>{sum(rows, (p) => p.hits)}</td>
                  <td>{sum(rows, (p) => p.earned_runs + p.unearned_runs)}</td>
                  <td>{sum(rows, (p) => p.earned_runs)}</td>
                  <td>{sum(rows, (p) => p.walks)}</td>
                  <td>{sum(rows, strikeouts)}</td>
                  <td className="grp">{sum(rows, (p) => p.wild_pitches)}</td>
                  <td>{sum(rows, (p) => p.balks)}</td>
                  <td>{sum(rows, (p) => p.at_bats)}</td>
                  <td className="grp">{era(sum(rows, (p) => p.earned_runs), sum(rows, (p) => p.outs), gameInnings)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {complete && (
            <div className="sheet-notes">
              <span>
                <b>CG:</b>
                {name(rows[0].player)}
              </span>
              {oppRuns === 0 && battedAgainst.batting.length > 0 && (
                <span>
                  <b>SHO:</b>
                  {name(rows[0].player)}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FieldingTable({ team, lang }: { team: TeamSheet; lang: Lang }) {
  const rows = lineup(team.batting);
  const catchers = rows.filter((r) => r.position_played === 'C' || CATCHER_COLS.some((c) => r[c.key] > 0));
  return (
    <div className="card sheet-card">
      <Head team={team} label="Fielding" />
      {rows.length === 0 ? (
        <p className="muted" style={{ padding: '0 18px 18px' }}>
          {L(lang, 'Tiada stats fielding.', 'No fielding stats.')}
        </p>
      ) : (
        <>
          <div className="sheet-scroll">
            <table className="sheet-tbl">
              <thead>
                <tr>
                  <th className="pl">{L(lang, 'Pemain', 'Player')}</th>
                  {FIELDING_COLS.map((c) => (
                    <Th key={c.key} c={c} lang={lang} />
                  ))}
                  <th className="grp">
                    <abbr title={L(lang, 'TC — Jumlah peluang (PO + A + E)', 'TC — Total chances (PO + A + E)')}>TC</abbr>
                  </th>
                  <th>
                    <abbr title={L(lang, 'FPCT — Peratus fielding', 'FPCT — Fielding percentage')}>FPCT</abbr>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const tc = r.putouts + r.assists + r.errors;
                  return (
                    <tr key={r.stat_id}>
                      <PlayerCell p={r.player} pos={r.position_played} />
                      <Num n={r.putouts} />
                      <Num n={r.assists} />
                      <td className={r.errors ? '' : 'z'} style={r.errors ? { color: 'var(--bad)' } : undefined}>
                        {dot(r.errors)}
                      </td>
                      <td className={`grp ${tc ? '' : 'z'}`}>{dot(tc)}</td>
                      <td>{tc ? ((r.putouts + r.assists) / tc).toFixed(3).replace(/^0/, '') : '—'}</td>
                    </tr>
                  );
                })}
                <tr className="total">
                  <td className="pl" style={{ background: 'var(--cream)' }}>
                    {L(lang, 'Jumlah', 'Totals')}
                  </td>
                  {FIELDING_COLS.map((c) => (
                    <td key={c.key}>{sum(rows, (r) => r[c.key])}</td>
                  ))}
                  <td className="grp">{sum(rows, (r) => r.putouts + r.assists + r.errors)}</td>
                  <td>
                    {(() => {
                      const tc = sum(rows, (r) => r.putouts + r.assists + r.errors);
                      return tc ? (sum(rows, (r) => r.putouts + r.assists) / tc).toFixed(3).replace(/^0/, '') : '—';
                    })()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {catchers.length > 0 && (
            <div className="sheet-scroll" style={{ borderTop: '1px solid var(--line-soft)' }}>
              <table className="sheet-tbl">
                <thead>
                  <tr>
                    <th className="pl">{L(lang, 'Catcher', 'Catcher')}</th>
                    {CATCHER_COLS.map((c) => (
                      <Th key={c.key} c={c} lang={lang} />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {catchers.map((r) => (
                    <tr key={r.stat_id}>
                      <PlayerCell p={r.player} pos={r.position_played} />
                      {CATCHER_COLS.map((c) => (
                        <Num key={c.key} n={r[c.key]} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Notes rows={rows} lang={lang} cols={[{ key: 'errors', label: 'E' }]} />
        </>
      )}
    </div>
  );
}
