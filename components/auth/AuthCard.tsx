import Image from 'next/image';
import type { ReactNode } from 'react';

/* Centered crest + title + card layout shared by the sign-in and password pages. */
export function AuthCard({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-h))', display: 'grid', placeItems: 'center', padding: '60px 20px', background: 'var(--sand)' }}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Image src="/assets/bfm-crest.png" alt="BFM" width={64} height={64} style={{ objectFit: 'contain', margin: '0 auto 18px' }} />
          <div className="kicker" style={{ justifyContent: 'center', marginBottom: 14 }}>
            {title}
          </div>
          {sub && (
            <p className="muted" style={{ fontSize: 15, marginTop: 6 }}>
              {sub}
            </p>
          )}
        </div>
        <div className="card pad">{children}</div>
      </div>
    </div>
  );
}
