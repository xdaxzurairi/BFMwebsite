'use client';

import { useEffect, useState } from 'react';
import { Diamond } from './ui/icons';

type ToastItem = { id: number; msg: string; bad?: boolean };

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const h = (e: Event) => {
      const detail = (e as CustomEvent<{ msg: string; bad?: boolean }>).detail;
      const id = Math.random();
      setItems((s) => [...s, { id, ...detail }]);
      setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 2800);
    };
    window.addEventListener('bfm-toast', h);
    return () => window.removeEventListener('bfm-toast', h);
  }, []);

  return (
    <div className="toast-wrap">
      {items.map((it) => (
        <div key={it.id} className={`toast ${it.bad ? 'bad' : ''}`}>
          <Diamond />
          {it.msg}
        </div>
      ))}
    </div>
  );
}
