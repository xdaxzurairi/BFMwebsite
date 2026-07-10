import Link from 'next/link';
import type { ComponentType, ReactNode, SVGProps } from 'react';
import { Counter } from '@/components/ui/Counter';

export type DashItem = { id: string; href: string; icon: ComponentType<SVGProps<SVGSVGElement>>; label: string; count?: number | null };

export function DashShell({
  items,
  active,
  title,
  subtitle,
  children,
}: {
  items: DashItem[];
  active: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="wrap section tight">
      <div style={{ marginBottom: 30 }}>
        <div className="kicker" style={{ marginBottom: 12 }}>
          {title}
        </div>
        <h1 className="h-lg">{subtitle}</h1>
      </div>
      <div className="dash-layout" style={{ display: 'grid', alignItems: 'start' }}>
        <aside className="card pad dash-side">
          <div className="side">
            {items.map((it) => (
              <Link key={it.id} href={it.href} className={`side-item ${active === it.id ? 'active' : ''}`}>
                <it.icon />
                {it.label}
                {it.count != null && <span className="count">{it.count}</span>}
              </Link>
            ))}
          </div>
        </aside>
        <main style={{ minWidth: 0 }}>{children}</main>
      </div>
    </div>
  );
}

export function SectionHead({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="row between center" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
      <h2 className="h-md">{title}</h2>
      {action}
    </div>
  );
}

export function Metric({ icon: Icon, label, value, tone = 'field' }: { icon: ComponentType<SVGProps<SVGSVGElement>>; label: string; value: number; tone?: string }) {
  return (
    <div className="card pad">
      <div className="row between center">
        <div className="stat-label muted">{label}</div>
        <Icon style={{ width: 18, height: 18, color: `var(--${tone})` }} />
      </div>
      <div className="display" style={{ fontSize: 46, marginTop: 8, color: `var(--${tone})` }}>
        <Counter to={value} />
      </div>
    </div>
  );
}
