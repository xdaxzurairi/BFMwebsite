import { Avatar } from '@/components/ui/ClubLogo';
import { Empty } from '@/components/ui/Empty';
import type { Lang } from '@/lib/i18n';
import type { Official } from '@/lib/types';

export function OfficialsList({ officials, lang }: { officials: Official[]; lang: Lang }) {
  if (!officials.length) {
    return <Empty>{lang === 0 ? 'Tiada pegawai disenaraikan.' : 'No officials listed.'}</Empty>;
  }
  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))' }}>
      {officials.map((o) => (
        <div key={o.official_id} className="card pad row center" style={{ gap: 14 }}>
          <Avatar a={o.first_name} b={o.last_name} size={48} color="var(--clay)" />
          <div>
            <div style={{ fontWeight: 800 }}>
              {o.first_name} {o.last_name}
            </div>
            <div className="muted" style={{ fontSize: 13 }}>
              {o.position}
            </div>
            <div className="badge" style={{ marginTop: 6 }}>
              {o.role}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
