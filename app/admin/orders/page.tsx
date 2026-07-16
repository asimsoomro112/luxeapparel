'use client';

import { useState } from 'react';
import { useAdminStore, Order, OrderStatus } from '@/lib/adminStore';
import AdminTable from '@/components/admin/AdminTable';
import AdminModal from '@/components/admin/AdminModal';
import StatusBadge from '@/components/admin/StatusBadge';
import { Eye, Check, Edit3, Truck, ExternalLink, Calendar, MapPin, Phone, Mail } from 'lucide-react';

export default function AdminOrders() {
  const { orders, updateOrderStatus, assignTracking } = useAdminStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Status adjustment state
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [statusNote, setStatusNote] = useState('');

  // Courier state
  const [trackingId, setTrackingId] = useState('');
  const [courier, setCourier] = useState('');

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNote('');
    setTrackingId(order.trackingId || '');
    setCourier(order.courier || 'TCS');
    setDetailModalOpen(true);
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    updateOrderStatus(selectedOrder.id, newStatus, statusNote || `Status updated to ${newStatus}`);
    setStatusNote('');
    // Refresh modal data
    const updated = useAdminStore.getState().orders.find((o) => o.id === selectedOrder.id);
    if (updated) setSelectedOrder(updated);
  };

  const handleUpdateCourier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    assignTracking(selectedOrder.id, trackingId, courier);
    // Refresh modal data
    const updated = useAdminStore.getState().orders.find((o) => o.id === selectedOrder.id);
    if (updated) setSelectedOrder(updated);
  };

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      sortable: true,
      render: (item: any) => <span className="font-mono font-bold">{item.id}</span>,
    },
    {
      key: 'customerName',
      label: 'Customer Name',
      sortable: true,
      render: (item: any) => (
        <div className="flex flex-col">
          <span>{item.customerName}</span>
          <span className="text-[10px] text-[var(--color-ink-muted)]">{item.customerEmail}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (item: any) => {
        const d = new Date(item.createdAt);
        return <span className="font-mono text-xs">{d.toLocaleDateString('en-PK')}</span>;
      },
    },
    {
      key: 'total',
      label: 'Total Amount',
      sortable: true,
      render: (item: any) => <span className="font-semibold">Rs. {item.total.toLocaleString()}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item: any) => <StatusBadge status={item.status} />,
    },
    {
      key: 'trackingId',
      label: 'Tracking / Courier',
      render: (item: any) => {
        if (!item.trackingId) return <span className="text-xs text-[var(--color-ink-muted)]">Not assigned</span>;
        return (
          <div className="flex flex-col">
            <span className="text-xs font-mono font-semibold">{item.trackingId}</span>
            <span className="text-[9px] uppercase tracking-wider text-[var(--color-accent)] font-bold">{item.courier}</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-display font-bold text-[var(--color-ink)]">Orders</h1>
        <p className="text-sm text-[var(--color-ink-muted)]">Track order pipeline, shipping tracking, updates.</p>
      </div>

      {/* Table Card */}
      <div className="glass-2 rounded-3xl p-6">
        <AdminTable
          data={orders}
          columns={columns}
          searchKeys={['id', 'customerName', 'customerEmail', 'trackingId', 'courier']}
          searchPlaceholder="Search by ID, customer name, courier tracking..."
          onRowClick={(item) => openOrderDetail(item)}
          actions={(item: Order) => (
            <button
              onClick={() => openOrderDetail(item)}
              className="p-2 hover:bg-[var(--color-ink)]/5 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
              title="View Order Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        />
      </div>

      {/* Order Detail Modal */}
      <AdminModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Order Details: ${selectedOrder?.id}`}
        maxWidth="max-w-3xl"
      >
        {selectedOrder && (
          <div className="flex flex-col gap-8">
            {/* Split layout: Order info & Status controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Customer Info (2 cols) */}
              <div className="md:col-span-2 flex flex-col gap-4">
                <div className="bg-[var(--color-surface)]/30 border border-[var(--color-border-glass)] p-5 rounded-2xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-3">Customer Information</h4>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                      <span className="font-semibold">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-ink-muted)]">
                      <Mail className="w-3.5 h-3.5" /> {selectedOrder.customerEmail}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-ink-muted)]">
                      <Phone className="w-3.5 h-3.5" /> {selectedOrder.customerPhone}
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--color-surface)]/30 border border-[var(--color-border-glass)] p-5 rounded-2xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-3">Shipping Address</h4>
                  <div className="flex items-start gap-2 text-xs text-[var(--color-ink-muted)]">
                    <MapPin className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[var(--color-ink)] font-medium">{selectedOrder.shippingAddress}</p>
                      <p className="mt-1 font-mono uppercase tracking-wider">{selectedOrder.city}, Pakistan</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update Form (1 col) */}
              <div className="flex flex-col gap-4">
                <form onSubmit={handleUpdateStatus} className="bg-[var(--color-surface)]/30 border border-[var(--color-border-glass)] p-5 rounded-2xl flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Update Status</h4>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-glass)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-[var(--color-ink)]"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Status update note (optional)"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-glass)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-[var(--color-ink)]"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-[var(--color-ink)] text-[var(--color-bg)] text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Save Status
                  </button>
                </form>

                {/* Tracking assignment */}
                <form onSubmit={handleUpdateCourier} className="bg-[var(--color-surface)]/30 border border-[var(--color-border-glass)] p-5 rounded-2xl flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Assign Tracking</h4>
                  <select
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-glass)] text-xs focus:outline-none"
                  >
                    <option value="TCS">TCS</option>
                    <option value="Leopards Courier">Leopards Courier</option>
                    <option value="M&P">M&P</option>
                    <option value="PostEx">PostEx</option>
                    <option value="Trax">Trax</option>
                  </select>
                  <input
                    type="text"
                    required
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="Tracking number"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-glass)] text-xs focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 glass text-[var(--color-ink)] text-xs font-bold rounded-lg hover:bg-[var(--color-ink)]/5 transition-colors"
                  >
                    Save Tracking
                  </button>
                </form>
              </div>
            </div>

            {/* Order Items */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Order Items</h4>
              <div className="flex flex-col gap-3">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-[var(--color-surface)]/20 p-3 rounded-2xl border border-[var(--color-border-glass)]">
                    <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate text-[var(--color-ink)]">{item.name}</span>
                        <span className="text-[9px] uppercase tracking-wider bg-[var(--color-ink)]/10 text-[var(--color-ink)] px-1.5 py-0.5 rounded-full font-bold">
                          {item.size}
                        </span>
                      </div>
                      <p className="text-[var(--color-ink-muted)] text-xs mt-0.5">Quantity: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-sm">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status History Timeline */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Status Updates History</h4>
              <div className="flex flex-col gap-5 border-l border-[var(--color-border-glass)] ml-2 pl-4 py-2">
                {selectedOrder.statusHistory.slice().reverse().map((history, idx) => {
                  const date = new Date(history.timestamp);
                  return (
                    <div key={idx} className="relative">
                      {/* dot */}
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] border-2 border-[var(--color-bg)]" />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold capitalize text-[var(--color-ink)]">{history.status.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] font-mono text-[var(--color-ink-muted)]">{date.toLocaleString('en-PK')}</span>
                        </div>
                        {history.note && (
                          <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{history.note}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
