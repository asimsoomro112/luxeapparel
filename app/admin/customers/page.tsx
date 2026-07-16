'use client';

import { useState } from 'react';
import { useAdminStore, Customer, Order } from '@/lib/adminStore';
import AdminTable from '@/components/admin/AdminTable';
import AdminModal from '@/components/admin/AdminModal';
import StatusBadge from '@/components/admin/StatusBadge';
import { ShoppingBag, Calendar, MapPin, User, Mail, Phone, DollarSign } from 'lucide-react';

export default function AdminCustomers() {
  const { customers, getCustomerOrders } = useAdminStore();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);

  const openCustomerOrders = (customer: Customer) => {
    setSelectedCustomer(customer);
    const ordersList = getCustomerOrders(customer.id);
    setCustomerOrders(ordersList);
    setOrdersModalOpen(true);
  };

  const columns = [
    {
      key: 'name',
      label: 'Customer Name',
      sortable: true,
      render: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--color-ink)]/5 flex items-center justify-center font-bold text-xs">
            {item.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">{item.name}</span>
            <span className="text-[10px] text-[var(--color-ink-muted)]">{item.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone Number',
    },
    {
      key: 'city',
      label: 'City',
      sortable: true,
      render: (item: any) => (
        <span className="inline-flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[var(--color-ink-muted)]" />
          {item.city}
        </span>
      ),
    },
    {
      key: 'totalOrders',
      label: 'Total Orders',
      sortable: true,
      render: (item: any) => <span className="font-mono">{item.totalOrders} orders</span>,
    },
    {
      key: 'totalSpent',
      label: 'Total Spent',
      sortable: true,
      render: (item: any) => <span className="font-semibold">Rs. {item.totalSpent.toLocaleString()}</span>,
    },
    {
      key: 'joinedAt',
      label: 'Joined Date',
      sortable: true,
      render: (item: any) => {
        const d = new Date(item.joinedAt);
        return <span className="text-xs text-[var(--color-ink-muted)] font-mono">{d.toLocaleDateString('en-PK')}</span>;
      },
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-display font-bold text-[var(--color-ink)]">Customers</h1>
        <p className="text-sm text-[var(--color-ink-muted)]">Manage registered accounts and customer purchase history.</p>
      </div>

      {/* Table Card */}
      <div className="glass-2 rounded-3xl p-6">
        <AdminTable
          data={customers}
          columns={columns}
          searchKeys={['name', 'email', 'phone', 'city']}
          searchPlaceholder="Search customers by name, city, email..."
          onRowClick={(item) => openCustomerOrders(item)}
        />
      </div>

      {/* Customer Orders Modal */}
      <AdminModal
        isOpen={ordersModalOpen}
        onClose={() => setOrdersModalOpen(false)}
        title={`Purchase History: ${selectedCustomer?.name}`}
        maxWidth="max-w-2xl"
      >
        {selectedCustomer && (
          <div className="flex flex-col gap-6">
            {/* Customer stats block */}
            <div className="grid grid-cols-2 gap-4 bg-[var(--color-surface)]/20 border border-[var(--color-border-glass)] p-4 rounded-2xl">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Total Orders</span>
                <span className="text-xl font-bold font-mono mt-1 flex items-center gap-1.5">
                  <ShoppingBag className="w-5 h-5 text-[var(--color-accent)]" /> {selectedCustomer.totalOrders}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Total Purchases Value</span>
                <span className="text-xl font-bold mt-1 flex items-center gap-1">
                  Rs. {selectedCustomer.totalSpent.toLocaleString()}
                </span>
              </div>
            </div>

            {/* List of customer orders */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Orders List</h4>
              {customerOrders.length === 0 ? (
                <p className="text-sm text-[var(--color-ink-muted)] text-center py-6">No orders found for this customer.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {customerOrders.map((order) => (
                    <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-surface)]/20 border border-[var(--color-border-glass)] p-4 rounded-2xl">
                      <div className="flex flex-col">
                        <span className="text-sm font-mono font-bold text-[var(--color-ink)]">{order.id}</span>
                        <span className="text-[10px] text-[var(--color-ink-muted)] font-mono mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-PK')}
                        </span>
                      </div>
                      <div className="flex flex-col sm:items-end">
                        <span className="text-sm font-bold">Rs. {order.total.toLocaleString()}</span>
                        <div className="mt-1">
                          <StatusBadge status={order.status} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
