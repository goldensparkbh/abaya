import { ORDER_STATUS } from '../services/orders.js';

export const TRACKING_STEPS = [
  ORDER_STATUS.PAID,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
];

export const SHOP_STATUS_OPTIONS = [
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
];

export const ADMIN_STATUS_OPTIONS = [
  ORDER_STATUS.PAID,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.CANCELLED,
];

export function trackingStepIndex(status) {
  if (status === ORDER_STATUS.CANCELLED || status === ORDER_STATUS.PENDING_PAYMENT) return -1;
  const idx = TRACKING_STEPS.indexOf(status);
  if (idx >= 0) return idx;
  if (status === ORDER_STATUS.PAID) return 0;
  return 0;
}

export function getStepTimestamp(statusHistory, step) {
  if (!statusHistory?.length) return null;
  const matches = statusHistory.filter((e) => e.status === step);
  const entry = matches[matches.length - 1];
  return entry?.at || null;
}

export function buildFallbackHistory(order) {
  if (order?.statusHistory?.length) return order.statusHistory;
  const status = order?.status;
  if (!status || status === ORDER_STATUS.PENDING_PAYMENT) return [];
  const idx = trackingStepIndex(status);
  if (idx < 0 && status !== ORDER_STATUS.CANCELLED) return [];
  const history = [];
  for (let i = 0; i <= idx; i += 1) {
    history.push({
      status: TRACKING_STEPS[i],
      at: i === idx ? order.updatedAt || order.paidAt || order.createdAt : null,
    });
  }
  return history;
}
