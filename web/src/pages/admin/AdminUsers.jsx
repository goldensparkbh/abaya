import React, { useEffect, useState } from 'react';
import { useT } from '../../i18n/I18nContext.jsx';
import { listAllUsers, updateUserRole } from '../../services/admin.js';

const ROLES = ['customer', 'shop', 'business', 'admin'];

export default function AdminUsers() {
  const t = useT();
  const [users, setUsers] = useState([]);

  async function load() {
    setUsers(await listAllUsers());
  }

  useEffect(() => { load(); }, []);

  async function changeRole(uid, role) {
    await updateUserRole(uid, role);
    await load();
  }

  return (
    <div>
      <h1 className="cart-page-title mb-4">{t('admin.users_title')}</h1>
      <div className="table-responsive panel-card">
        <table className="table table-sm mb-0">
          <thead>
            <tr>
              <th>{t('admin.col_name')}</th>
              <th>{t('admin.col_email')}</th>
              <th>{t('admin.col_role')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.displayName || '—'}</td>
                <td className="small">{u.email}</td>
                <td>
                  <select className="form-control form-control-sm" style={{ width: 140 }} value={u.role || 'customer'} onChange={(e) => changeRole(u.id, e.target.value)}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
