import { SectionHead } from '@/components/dashboard/DashShell';
import { UserRow } from './UserRow';
import { t as translate, type Lang } from '@/lib/i18n';
import type { AppUserRow, Club } from '@/lib/types';

export function UsersAdmin({ users, clubs, lang }: { users: AppUserRow[]; clubs: Club[]; lang: Lang }) {
  return (
    <div>
      <SectionHead title={translate('dash.users', lang)} />
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>{lang === 0 ? 'Pengguna' : 'User'}</th>
              <th colSpan={2}>{lang === 0 ? 'Peranan & Kelab' : 'Role & Club'}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserRow key={u.user_id} u={u} clubs={clubs} lang={lang} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
