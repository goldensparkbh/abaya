import React from 'react';
import { useT } from '../i18n/I18nContext.jsx';

const BADGE_MAP = {
  open: 'badge-warn',
  awarded: 'badge-warn',
  paid: 'badge-done',
  in_progress: 'badge-info',
  processing: 'badge-info',
  shipped: 'badge-info',
  delivered: 'badge-done',
  completed: 'badge-done',
  disputed: 'badge-danger',
  cancelled: 'badge-muted',
  refunded: 'badge-muted',
  pending_payment: 'badge-warn',
  pending: 'badge-warn',
  withdrawn: 'badge-muted',
};

export default function StatusBadge({ status }) {
  const t = useT();
  const cls = BADGE_MAP[status] || 'badge-muted';
  const label = t(`status.${status}`) !== `status.${status}` ? t(`status.${status}`) : status;
  return <span className={`status-badge ${cls}`}>{label}</span>;
}
