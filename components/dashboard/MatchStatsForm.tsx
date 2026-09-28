'use client';

import { useEffect, useState, useTransition } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ClubLogo } from '@/components/ui/ClubLogo';
import { Empty } from '@/components/ui/Empty';
import { I } from '@/components/ui/icons';
import { toast } from '@/lib/toast';
import { StatReviewBadge } from './StatReviewBadge';
import { loadMatchStatsAction, saveMatchStatsAction, type StatLine } from '@/app/actions/stats';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Match, Club, Player, StatReview } from '@/lib/types';

type Key = 'at_bats' | 'hits' | 'runs' | 'rbi';
type Entry = { played: boolean } & Record<Key, string>;

const KEYS: Key[] = ['at_bats', 'hits', 'runs', 'rbi'];
const blank: Entry = { played: false, at_bats: '', hits: '', runs: '', rbi: '' };
const num = (s: string) => (s === '' ? 0 : Number(s));

/* `teams` limits which rosters are shown: both for admins, the manager's own club for managers. */
export function MatchStatsForm({ m, home, away, teams, isAdmin = false, lang, onClose }: { m: Match; home?: Club; away?: Club; teams: Club[]; isAdmin?: boolean; lang: Lang; onClose: () => void }) {
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [entries, setEntries] = useState<Record<number, Entry>>({});
  const [reviews, setReviews] = useState<StatReview[]>([]);
  const [loadError, setLoadError] = useState('');
  const [saving, startSave] = useTransition();

  useEffect(() => {
    loadMatchStatsAction(m.match_id).then((res) => {
      if (res.error) return setLoadError(res.error);
      const next: Record<number, Entry> = {};
      for (const s of res.stats ?? []) {
        next[s.player_id] = { played: true, at_bats: String(s.at_bats), hits: String(s.hits), runs: String(s.runs), rbi: String(s.rbi) };
      }
      setEntries(next);
      setReviews(res.reviews ?? []);
      setPlayers(res.players ?? []);
    });
  }, [m.match_id]);

  const setField = (pid: number, key: Key | 'played', value: string | boolean) =>
    setEntries((prev) => {
      const cur = prev[pid] ?? blank;
      const next = { ...cur, [key]: value } as Entry;
      if (key !== 'played' && value !== '') next.played = true;
      return { ...prev, [pid]: next };
    });

  const lines: StatLine[] = Object.entries(entries)
    .filter(([, e]) => e.played)
    .map(([pid, e]) => ({ player_id: Number(pid), at_bats: num(e.at_bats), hits: num(e.hits), runs: num(e.runs), rbi: num(e.rbi) }));
  const badHits = lines.some((l) => l.hits > l.at_bats);

  const save = () =>
    startSave(async () => {
      const res = await saveMatchStatsAction(m.match_id, lines);
      if (res.error) return toast(res.error, true);
      toast(translate('stats.saved', lang));
      onClose();
    });

  const team = (club: Club) => {
    const score = club.club_id === m.home_team_id ? m.home_score : m.away_score;
    const roster = (players ?? []).filter((p) => p.club_id === club.club_id);
    const teamLines = lines.filter((l) => roster.some((p) => p.player_id === l.player_id));
    const total = (k: Key) => teamLines.reduce((n, l) => n + l[k], 0);
    const review = reviews.find((r) => r.club_id === club.club_id);
    const runsOff = m.status === 'completed' && score != null && teamLines.length > 0 && total('runs') !== score;
    return (
      <div key={club.club_id} style={{ marginBottom: 22 }}>
        <div className="row center" style={{ gap: 10, marginBottom: 10 }}>
          <ClubLogo club={club} size={30} />
          <span style={{ fontWeight: 800 }}>{club.club_name}</span>
          {m.status === 'completed' && <span className="muted">· {score}</span>}
          <span style={{ marginLeft: 'auto' }}>
            <StatReviewBadge review={review} lang={lang} />
          </span>
        </div>
        {review?.status === 'disputed' && review.review_note && (
          <p className="review-note" style={{ marginTop: 0, marginBottom: 10 }}>
            <strong>{translate('review.disputedby', lang)}:</strong> “{review.review_note}” {translate('review.resubmit', lang)}
          </p>
        )}
        {roster.length === 0 ? (
          <Empty>{translate('stats.noroster', lang)}</Empty>
        ) : (
          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="tbl stats-entry">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>{translate('stats.played', lang)}</th>
                  <th>{lang === 0 ? 'Pemain' : 'Player'}</th>
                  <th className="num">{translate('tbl.ab', lang)}</th>
                  <th className="num">{translate('tbl.h', lang)}</th>
                  <th className="num">{translate('tbl.r', lang)}</th>
                  <th className="num">RBI</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((p) => {
                  const e = entries[p.player_id] ?? blank;
                  const hitsOver = e.played && num(e.hits) > num(e.at_bats);
                  return (
                    <tr key={p.player_id} style={{ opacity: e.played ? 1 : 0.6 }}>
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`${p.first_name} ${p.last_name}`}
                          checked={e.played}
                          onChange={(ev) => setField(p.player_id, 'played', ev.target.checked)}
                        />
                      </td>
                      <td>
                        <span style={{ fontWeight: 700 }}>
                          {p.first_name} {p.last_name}
                        </span>{' '}
                        <span className="muted" style={{ fontSize: 12 }}>
                          #{p.jersey_number} {p.position}
                        </span>
                      </td>
                      {KEYS.map((k) => (
                        <td key={k} className="num">
                          <input
                            className={`input stat-input ${k === 'hits' && hitsOver ? 'invalid' : ''}`}
                            type="number"
                            min={0}
                            max={99}
                            inputMode="numeric"
                            placeholder="0"
                            value={e[k]}
                            onChange={(ev) => setField(p.player_id, k, ev.target.value.replace(/\D/g, '').slice(0, 2))}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
                <tr style={{ background: 'var(--cream)' }}>
                  <td />
                  <td style={{ fontWeight: 800 }}>{lang === 0 ? 'Jumlah' : 'Totals'}</td>
                  {KEYS.map((k) => (
                    <td key={k} className="num" style={k === 'runs' && runsOff ? { color: 'var(--bad)' } : undefined}>
                      {total(k)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {runsOff && (
          <p style={{ color: 'var(--bad)', fontSize: 13, marginTop: 8 }}>
            {translate('stats.runsoff', lang)} ({total('runs')} / {score})
          </p>
        )}
      </div>
    );
  };

  return (
    <Modal title={translate('stats.title', lang)} onClose={onClose} wide>
      <p className="muted" style={{ fontSize: 14, marginBottom: 18 }}>
        {away?.club_name} @ {home?.club_name} · {m.match_number}
        {isAdmin && <> · {translate('review.adminnote', lang)}</>}
      </p>
      {loadError ? (
        <Empty>{loadError}</Empty>
      ) : !players ? (
        <p className="muted">{lang === 0 ? 'Memuatkan…' : 'Loading…'}</p>
      ) : (
        teams.map(team)
      )}
      {badHits && (
        <p style={{ color: 'var(--bad)', fontSize: 13 }}>{translate('stats.hitsover', lang)}</p>
      )}
      <div className="row center" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
        <span className="muted" style={{ fontSize: 13, marginRight: 'auto' }}>
          {lines.length} {translate('stats.lines', lang)}
        </span>
        <Button type="button" variant="ghost" onClick={onClose}>
          {translate('cta.cancel', lang)}
        </Button>
        <Button variant="primary" icon={I.check} disabled={saving || !players || badHits} onClick={save}>
          {translate('cta.save', lang)}
        </Button>
      </div>
    </Modal>
  );
}
