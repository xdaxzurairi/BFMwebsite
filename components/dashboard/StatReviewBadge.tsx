import { t as translate, type Lang } from '@/lib/i18n';
import type { StatReview } from '@/lib/types';

const CLS = { pending: 'badge-pending', approved: 'badge-approved', disputed: 'badge-rejected' } as const;
const KEY = { pending: 'review.pending', approved: 'review.approved', disputed: 'review.disputed' } as const;

/* Status of one club's stats for one match; "Not entered" when nothing was submitted. */
export function StatReviewBadge({ review, lang }: { review?: StatReview; lang: Lang }) {
  if (!review) return <span className="badge">{translate('stats.none', lang)}</span>;
  return (
    <span className={`badge ${CLS[review.status]}`} title={review.review_note ?? undefined}>
      {translate(KEY[review.status], lang)}
    </span>
  );
}
