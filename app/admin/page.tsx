'use client';

import { useAdminStore } from '@/lib/adminStore';
import StatCard from '@/components/admin/StatCard';
import StatusBadge from '@/components/admin/StatusBadge';
import MiniChart from '@/components/admin/MiniChart';
import AdminTable from '@/components/admin/AdminTable';
import { DollarSign, ShoppingBag, Users, AlertTriangle, ArrowUpRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

export default function AdminDashboard() {
  const { orders, products, customers } = useAdminStore();

  // Compute stats
  const stats = useMemo(() => {
    // Total Revenue (all non-cancelled orders)
    const revenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    // Orders today (mocking today's orders using the last 24h or orders made 0 days ago)
    const todayOrders = orders.filter((o) => {
      const date = new Date(o.createdAt);
      const diffTime = Math.abs(new Date().getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 1;
    }).length;

    // Total Customers
    const totalCusts = customers.length;

    // Low stock products (< 15 items)
    const lowStock = products.filter((p) => p.stock < 15).length;

    return { revenue, todayOrders, totalCusts, lowStock };
  }, [orders, products, customers]);

  // Order history chart data (last 7 orders)
  const chartData = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'cancelled')
      .slice(0, 7)
      .reverse()
      .map((o) => o.total);
  }, [orders]);

  // Columns for recent orders
  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      render: (item: any) => <span className="font-mono font-bold">{item.id}</span>,
    },
    {
      key: 'customerName',
      label: 'Customer',
    },
    {
      key: 'total',
      label: 'Total',
      render: (item: any) => <span className="font-semibold">Rs. {item.total.toLocaleString()}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: any) => <StatusBadge status={item.status} />,
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (item: any) => {
        const d = new Date(item.createdAt);
        return <span className="text-xs font-mono">{d.toLocaleDateString('en-PK')}</span>;
      },
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Title / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-ink)]">Dashboard</h1>
          <p className="text-sm text-[var(--color-ink-muted)]">Real-time store overview & operations.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/products"
            className="px-4 py-2.5 rounded-full text-xs font-semibold bg-[var(--color-ink)] text-[var(--color-bg)] hover:opacity-90 transition-opacity"
          >
            Manage Products
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 rounded-full text-xs font-semibold glass text-[var(--color-ink)] hover:bg-[var(--color-ink)]/5 transition-colors"
          >
            View Orders
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Revenue"
          value={`Rs. ${stats.revenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: '12.4%', positive: true }}
          delay={0.05}
        />
        <StatCard
          label="Orders Today"
          value={stats.todayOrders.toString()}
          icon={ShoppingBag}
          trend={{ value: '8.2%', positive: true }}
          delay={0.1}
        />
        <StatCard
          label="Total Customers"
          value={stats.totalCusts.toString()}
          icon={Users}
          trend={{ value: '4.8%', positive: true }}
          delay={0.15}
        />
        <StatCard
          label="Low Stock Items"
          value={stats.lowStock.toString()}
          icon={AlertTriangle}
          trend={stats.lowStock > 0 ? { value: `${stats.lowStock} alerts`, positive: false } : undefined}
          delay={0.2}
        />
      </div>

      {/* Charts & Mini widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-2 rounded-3xl p-6 flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--color-accent)]" /> Revenue Trend (Last 7 Orders)
              </h3>
              <span className="text-xs font-mono text-[var(--color-ink-muted)]">Updated just now</span>
            </div>
            <p className="text-xs text-[var(--color-ink-muted)] mb-6">Visualizes transactional value of last 7 valid orders placed on your store.</p>
          </div>
          <div className="flex-1 flex items-end">
            <MiniChart data={chartData} height={160} type="line" />
          </div>
        </div>

        {/* Top Products */}
        <div className="glass-2 rounded-3xl p-6 flex flex-col gap-6">
          <h3 className="text-base font-semibold">Top Performing Silhouettes</h3>
          <div className="flex flex-col gap-4">
            {products.slice(0, 3).map((product, i) => (
              <div key={product.id} className="flex items-center gap-3 bg-[var(--color-surface)]/30 border border-[var(--color-border-glass)] p-3 rounded-2xl">
                <span className="font-mono text-xs font-bold text-[var(--color-ink-muted)] opacity-55">#{i+1}</span>
                <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-xs truncate text-[var(--color-ink)]">{product.name}</h4>
                  <p className="text-[10px] text-[var(--color-ink-muted)] mt-0.5">{product.stock} in stock</p>
                </div>
                <span className="font-bold text-xs">Rs. {product.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="glass-2 rounded-3xl p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Recent Sales Activity</h3>
          <Link href="/admin/orders" className="text-xs font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-0.5">
            View All Orders <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <AdminTable
          data={orders.slice(0, 4)}
          columns={columns}
          emptyMessage="No orders have been placed yet."
        />
      </div>
    </div>
  );
}
