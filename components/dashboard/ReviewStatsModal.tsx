'use client';

import { useEffect, useState, useTransition } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ClubLogo } from '@/components/ui/ClubLogo';
import { Empty } from '@/components/ui/Empty';
import { Textarea } from '@/components/ui/Field';
import { I } from '@/components/ui/icons';
import { toast } from '@/lib/toast';
import { loadStatsForReviewAction, reviewMatchStatsAction } from '@/app/actions/stats';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Match, Club, Player, PlayerMatchStat, StatReview } from '@/lib/types';

type Row = PlayerMatchStat & { player: Player };

/* Read-only view of the other club's submitted stats, with Approve / Dispute. */
export function ReviewStatsModal({ m, club, lang, onClose }: { m: Match; club: Club; lang: Lang; onClose: () => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [review, setReview] = useState<StatReview | undefined>();
  const [loadError, setLoadError] = useState('');
  const [disputing, setDisputing] = useState(false);
  const [note, setNote] = useState('');
  const [busy, start] = useTransition();

  useEffect(() => {
    loadStatsForReviewAction(m.match_id, club.club_id).then((res) => {
      if (res.error) return setLoadError(res.error);
      setRows(res.rows ?? []);
      setReview(res.review);
    });
  }, [m.match_id, club.club_id]);

  const submit = (approve: boolean) =>
    start(async () => {
      const res = await reviewMatchStatsAction(m.match_id, club.club_id, approve, approve ? '' : note);
      if (res.error) return toast(res.error, true);
      toast(translate(approve ? 'review.done.approved' : 'review.done.disputed', lang));
      onClose();
    });

  const score = club.club_id === m.home_team_id ? m.home_score : m.away_score;
  const sum = (k: 'at_bats' | 'hits' | 'runs' | 'rbi') => (rows ?? []).reduce((n, r) => n + r[k], 0);
  const runsOff = rows && rows.length > 0 && m.status === 'completed' && score != null && sum('runs') !== score;

  return (
    <Modal title={translate('review.title', lang)} onClose={onClose} wide>
      <div className="row center" style={{ gap: 10, marginBottom: 16 }}>
        <ClubLogo club={club} size={30} />
        <span style={{ fontWeight: 800 }}>{club.club_name}</span>
        {m.status === 'completed' && <span className="muted">· {score}</span>}
        <span className="muted" style={{ marginLeft: 'auto', fontSize: 13 }}>
          {m.match_number}
        </span>
      </div>
      {loadError ? (
        <Empty>{loadError}</Empty>
      ) : !rows ? (
        <p className="muted">{lang === 0 ? 'Memuatkan…' : 'Loading…'}</p>
      ) : rows.length === 0 ? (
        <Empty>{translate('mc.nobox', lang)}</Empty>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>{lang === 0 ? 'Pemain' : 'Player'}</th>
                <th className="num">{translate('tbl.ab', lang)}</th>
                <th className="num">{translate('tbl.h', lang)}</th>
                <th className="num">{translate('tbl.r', lang)}</th>
                <th className="num">RBI</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.stat_id}>
                  <td>
                    <span style={{ fontWeight: 700 }}>
                      {r.player.first_name} {r.player.last_name}
                    </span>{' '}
                    <span className="muted" style={{ fontSize: 12 }}>
                      #{r.player.jersey_number} {r.player.position}
                    </span>
                  </td>
                  <td className="num">{r.at_bats}</td>
                  <td className="num">{r.hits}</td>
                  <td className="num">{r.runs}</td>
                  <td className="num">{r.rbi}</td>
                </tr>
              ))}
              <tr style={{ background: 'var(--cream)' }}>
                <td style={{ fontWeight: 800 }}>{lang === 0 ? 'Jumlah' : 'Totals'}</td>
                <td className="num">{sum('at_bats')}</td>
                <td className="num">{sum('hits')}</td>
                <td className="num" style={runsOff ? { color: 'var(--bad)' } : undefined}>
                  {sum('runs')}
                </td>
                <td className="num">{sum('rbi')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {runsOff && (
        <p style={{ color: 'var(--bad)', fontSize: 13, marginTop: 8 }}>
          {translate('stats.runsoff', lang)} ({sum('runs')} / {score})
        </p>
      )}
      {review?.status === 'disputed' && review.review_note && (
        <p className="review-note">
          <strong>{translate('review.yournote', lang)}:</strong> {review.review_note}
        </p>
      )}
      {disputing && (
        <div style={{ marginTop: 16 }}>
          <Textarea
            placeholder={translate('review.noteph', lang)}
            value={note}
            maxLength={500}
            rows={3}
            autoFocus
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      )}
      <div className="row center" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
        <Button type="button" variant="ghost" onClick={onClose}>
          {translate('cta.cancel', lang)}
        </Button>
        {disputing ? (
          <Button type="button" variant="primary" icon={I.x} disabled={busy || !note.trim()} onClick={() => submit(false)}>
            {translate('review.senddispute', lang)}
          </Button>
        ) : (
          <>
            <Button type="button" variant="ghost" icon={I.x} disabled={busy || !rows?.length || review?.status === 'disputed'} onClick={() => setDisputing(true)}>
              {translate('review.dispute', lang)}
            </Button>
            <Button type="button" variant="field" icon={I.check} disabled={busy || !rows?.length} onClick={() => submit(true)}>
              {translate('review.approve', lang)}
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
