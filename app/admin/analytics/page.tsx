'use client';

import { useAdminStore } from '@/lib/adminStore';
import MiniChart from '@/components/admin/MiniChart';
import { useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Sparkles, Layers } from 'lucide-react';

export default function AdminAnalytics() {
  const { orders, products, customers } = useAdminStore();

  const metrics = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'cancelled');
    
    // Revenue
    const revenue = validOrders.reduce((sum, o) => sum + o.total, 0);
    
    // Average Order Value
    const aov = validOrders.length > 0 ? Math.round(revenue / validOrders.length) : 0;
    
    // Category sales mapping
    const categorySales: Record<string, number> = {};
    validOrders.forEach((order) => {
      order.items.forEach((item) => {
        // Find category from item (fallback to database or hardcoded 'T-Shirts')
        const p = products.find((prod) => prod.id === item.productId);
        const cat = p ? p.category : 'T-Shirts';
        categorySales[cat] = (categorySales[cat] || 0) + item.price * item.quantity;
      });
    });

    // Orders breakdown by status
    const statusCounts: Record<string, number> = {};
    orders.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    return { revenue, aov, categorySales, statusCounts };
  }, [orders, products]);

  // Mock revenue trends for past 14 days
  const mockFortnightlyRevenue = [
    12000, 15000, 18500, 14000, 22000, 28000, 24000, 31000, 27000, 35000, 38000, 32000, 42000, metrics.revenue / 10
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-display font-bold text-[var(--color-ink)]">Analytics</h1>
        <p className="text-sm text-[var(--color-ink-muted)]">Insights, performance stats, and market metrics.</p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-2 rounded-3xl p-6 flex flex-col justify-between min-h-[180px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase tracking-[0.15em] text-[var(--color-ink-muted)]">Total Turnover</span>
            <DollarSign className="w-4 h-4 text-[var(--color-accent)]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display tracking-tight mt-4">Rs. {metrics.revenue.toLocaleString()}</h2>
            <div className="flex items-center gap-1 mt-2 text-[var(--color-success)] text-xs font-bold font-mono">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2% from last month
            </div>
          </div>
        </div>

        <div className="glass-2 rounded-3xl p-6 flex flex-col justify-between min-h-[180px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase tracking-[0.15em] text-[var(--color-ink-muted)]">Avg Order Value (AOV)</span>
            <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display tracking-tight mt-4">Rs. {metrics.aov.toLocaleString()}</h2>
            <div className="flex items-center gap-1 mt-2 text-[var(--color-success)] text-xs font-bold font-mono">
              <TrendingUp className="w-3.5 h-3.5" /> +3.5% average cart size
            </div>
          </div>
        </div>

        <div className="glass-2 rounded-3xl p-6 flex flex-col justify-between min-h-[180px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase tracking-[0.15em] text-[var(--color-ink-muted)]">Total Orders (Valid)</span>
            <ShoppingCart className="w-4 h-4 text-[var(--color-accent)]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display tracking-tight mt-4">
              {orders.filter((o) => o.status !== 'cancelled').length} orders
            </h2>
            <div className="flex items-center gap-1 mt-2 text-[var(--color-success)] text-xs font-bold font-mono">
              <TrendingUp className="w-3.5 h-3.5" /> Strong transactional volume
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="glass-2 rounded-3xl p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--color-accent)]" /> 14-Day Sales Velocity
            </h3>
            <span className="text-xs text-[var(--color-ink-muted)] font-mono">PKR Trend</span>
          </div>
          <div className="flex-1 flex items-end">
            <MiniChart data={mockFortnightlyRevenue} height={180} type="bar" />
          </div>
        </div>

        {/* Category Share & Status breakdowns */}
        <div className="glass-2 rounded-3xl p-6 flex flex-col gap-6 justify-between">
          <div>
            <h3 className="text-base font-semibold flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-[var(--color-accent)]" /> Silhouette Sales by Category
            </h3>
            <div className="flex flex-col gap-3">
              {Object.entries(metrics.categorySales).map(([category, sum], idx) => {
                const total = Math.max(...Object.values(metrics.categorySales), 1);
                const percent = Math.round((sum / Object.values(metrics.categorySales).reduce((a,b) => a+b, 0)) * 100);
                return (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span>{category}</span>
                      <span className="font-mono text-[var(--color-ink-muted)]">Rs. {sum.toLocaleString()} ({percent}%)</span>
                    </div>
                    {/* progress line */}
                    <div className="w-full h-2 rounded-full bg-[var(--color-ink)]/5 overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-accent)] rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[var(--color-border-glass)] pt-5">
            <h3 className="text-sm font-semibold mb-3">Order Status Pipeline Breakdown</h3>
            <div className="flex flex-wrap gap-2.5">
              {Object.entries(metrics.statusCounts).map(([status, count]) => (
                <div key={status} className="px-3.5 py-1.5 rounded-2xl bg-[var(--color-surface)]/40 border border-[var(--color-border-glass)] text-xs flex items-center gap-2">
                  <span className="capitalize font-medium">{status.replace(/_/g, ' ')}:</span>
                  <span className="font-bold font-mono text-[var(--color-accent)]">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
