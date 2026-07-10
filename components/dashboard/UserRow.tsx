'use client';

import { useActionState, useState } from 'react';
import { Avatar } from '@/components/ui/ClubLogo';
import { Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useActionToast } from '@/components/ui/useActionToast';
import { updateUserRoleAction } from '@/app/actions/users';
import { t as translate, type Lang } from '@/lib/i18n';
import type { AppUserRow, Club } from '@/lib/types';

const ROLES = ['user', 'club_manager', 'admin', 'technical_admin'] as const;

export function UserRow({ u, clubs, lang }: { u: AppUserRow; clubs: Club[]; lang: Lang }) {
  const action = updateUserRoleAction.bind(null, u.user_id);
  const [state, formAction, pending] = useActionState(action, null);
  useActionToast(state, pending, translate('user.updated', lang));
  const [role, setRole] = useState(u.role);

  return (
    <tr>
      <td>
        <div className="row center" style={{ gap: 10 }}>
          <Avatar a={u.full_name.split(' ')[0]} b={u.full_name.split(' ')[1]} size={32} />
          <div>
            <div style={{ fontWeight: 700 }}>{u.full_name}</div>
            <div className="muted" style={{ fontSize: 12 }}>
              {u.email}
            </div>
          </div>
        </div>
      </td>
      <td colSpan={2}>
        <form action={formAction} className="row center" style={{ gap: 8, flexWrap: 'wrap' }}>
          <Select name="role" value={role} onChange={(e) => setRole(e.target.value as typeof role)} style={{ minWidth: 150 }}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {translate(`role.${r}`, lang)}
              </option>
            ))}
          </Select>
          {role === 'club_manager' && (
            <Select name="club_id" defaultValue={u.club_id ?? ''} style={{ minWidth: 180 }}>
              <option value="">—</option>
              {clubs.map((c) => (
                <option key={c.club_id} value={c.club_id}>
                  {c.club_name}
                </option>
              ))}
            </Select>
          )}
          <Button size="sm" variant="field" disabled={pending}>
            {translate('cta.save', lang)}
          </Button>
        </form>
        {state?.error && (
          <div className="field-err" style={{ marginTop: 6 }}>
            {state.error}
          </div>
        )}
      </td>
    </tr>
  );
}
