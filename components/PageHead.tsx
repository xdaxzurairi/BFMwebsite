import type { ReactNode } from 'react';

export function PageHead({ kicker, title, sub, right }: { kicker: string; title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="row between" style={{ alignItems: 'flex-end', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
      <div>
        <div className="kicker" style={{ marginBottom: 14 }}>
          {kicker}
        </div>
        <h1 className="h-lg">{title}</h1>
        {sub && (
          <p className="muted" style={{ fontSize: 16, marginTop: 8, maxWidth: 560 }}>
            {sub}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}
