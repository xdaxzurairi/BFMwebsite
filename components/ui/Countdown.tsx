'use client';

import { useEffect, useState } from 'react';
import { t as translate, type Lang } from '@/lib/i18n';

export function Countdown({ target, lang }: { target: string; lang: Lang }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, new Date(target).getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const units: [number, string][] = [
    [d, translate('sec.days', lang)],
    [h, translate('sec.hours', lang)],
    [m, translate('sec.mins', lang)],
    [s, translate('sec.secs', lang)],
  ];

  return (
    <div className="cd-wrap">
      {units.map(([v, lbl], i) => (
        <div key={i} className="cd-item">
          <span className="display tnum cd-num" style={{ color: '#fff', lineHeight: 1 }}>
            {String(v).padStart(2, '0')}
          </span>
          <span className="stat-label" style={{ color: 'var(--field-glow)', marginTop: 6 }}>
            {lbl}
          </span>
        </div>
      ))}
    </div>
  );
}
