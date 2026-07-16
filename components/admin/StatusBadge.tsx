'use client';

import { OrderStatus } from '@/lib/adminStore';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  confirmed: { label: 'Confirmed', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
  processing: { label: 'Processing', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10' },
  shipped: { label: 'Shipped', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500/10' },
  delivered: { label: 'Delivered', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  cancelled: { label: 'Cancelled', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${config.color} ${config.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.bg.replace('/10', '/60')}`} />
      {config.label}
    </span>
  );
}

export { STATUS_CONFIG };
