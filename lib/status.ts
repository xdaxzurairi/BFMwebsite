import type { Lang } from './i18n';

const STATUS_LABELS: Record<string, [string, string]> = {
  upcoming: ['Akan Datang', 'Upcoming'],
  ongoing: ['Berlangsung', 'Ongoing'],
  completed: ['Selesai', 'Completed'],
  cancelled: ['Batal', 'Cancelled'],
  scheduled: ['Dijadual', 'Scheduled'],
  live: ['Langsung', 'Live'],
  postponed: ['Ditangguh', 'Postponed'],
  pending: ['Menunggu', 'Pending'],
  approved: ['Lulus', 'Approved'],
  rejected: ['Ditolak', 'Rejected'],
  withdrawn: ['Tarik Diri', 'Withdrawn'],
  failed: ['Gagal', 'Failed'],
  refunded: ['Dipulang', 'Refunded'],
};

export function statusLbl(status: string, lang: Lang): string {
  const entry = STATUS_LABELS[status];
  return entry ? entry[lang] : status;
}
