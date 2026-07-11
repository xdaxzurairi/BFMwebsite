import { Diamond } from './icons';
import type { ReactNode } from 'react';

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="empty">
      <Diamond cls="outline" />
      <div>{children}</div>
    </div>
  );
}
