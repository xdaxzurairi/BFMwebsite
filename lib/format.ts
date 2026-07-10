/* Ported from design/app/ui.jsx's `fmt` helpers. */

export const fmt = {
  money: (n: number | null | undefined, cur = 'MYR') =>
    n || n === 0
      ? `${cur === 'MYR' ? 'RM' : cur + ' '}${Number(n).toLocaleString('en-MY', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })}`
      : '—',
  avg: (n: number) => n.toFixed(3).replace(/^0/, ''),
  date: (s: string | null | undefined, lang: 0 | 1) => {
    if (!s) return '—';
    const d = new Date(s);
    return d.toLocaleDateString(lang === 0 ? 'ms-MY' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  },
  dateRange: (a: string, b: string, lang: 0 | 1) => `${fmt.date(a, lang)} – ${fmt.date(b, lang)}`,
  time: (s: string) => {
    const d = new Date(s);
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  },
  initials: (a?: string | null, b?: string | null) => `${(a || '?')[0]}${(b || '')[0] || ''}`.toUpperCase(),
};
