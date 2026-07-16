'use client';

import { useState } from 'react';
import { useAdminStore, OrderStatus } from '@/lib/adminStore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StatusBadge, { STATUS_CONFIG } from '@/components/admin/StatusBadge';
import { Search, MapPin, Truck, Calendar, Box, Package, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TRACKING_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'pending', label: 'Order Placed', desc: 'We have received your order request.' },
  { status: 'confirmed', label: 'Order Confirmed', desc: 'Your payment or COD order is verified.' },
  { status: 'processing', label: 'Processing', desc: 'Your items are being packed at our Lahore warehouse.' },
  { status: 'shipped', label: 'Shipped', desc: 'Handed over to the courier partner.' },
  { status: 'out_for_delivery', label: 'Out for Delivery', desc: 'Courier agent is delivering in your area.' },
  { status: 'delivered', label: 'Delivered', desc: 'Package has been handed over successfully.' },
];

export default function TrackingPage() {
  const { orders } = useAdminStore();
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [foundOrder, setFoundOrder] = useState<any>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    if (!query.trim()) {
      setFoundOrder(null);
      return;
    }
    const cleanQuery = query.trim().toLowerCase();
    // Search by Order ID or Tracking ID
    const match = orders.find(
      (o) => o.id.toLowerCase() === cleanQuery || o.trackingId.toLowerCase() === cleanQuery
    );
    setFoundOrder(match || null);
  };

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'cancelled') return -1;
    return TRACKING_STEPS.findIndex((step) => step.status === status);
  };

  const currentStepIdx = foundOrder ? getStepIndex(foundOrder.status) : -1;

  return (
    <main className="min-h-screen pt-24 pb-20 sm:pb-0 flex flex-col justify-between">
      <Navbar />

      <div className="max-w-3xl mx-auto w-full px-6 py-12 flex-1">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-display font-bold tracking-tight text-[var(--color-ink)]">Track Silhouette Order</h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-2">
            Enter your order ID (e.g. ORD-1001) or courier tracking number.
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-3 w-full bg-[var(--color-surface)]/40 border border-[var(--color-border-glass)] rounded-full p-2 pl-5 shadow-sm max-w-xl mx-auto mb-12">
          <Search className="w-5 h-5 text-[var(--color-ink-muted)] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Order ID / Tracking ID"
            className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-muted)]/50 font-medium"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[var(--color-ink)] text-[var(--color-bg)] rounded-full text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Track Order
          </button>
        </form>

        {/* Output */}
        <AnimatePresence mode="wait">
          {searched && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full"
            >
              {foundOrder ? (
                <div className="flex flex-col gap-8">
                  {/* Order Overview Header Card */}
                  <div className="glass-2 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Order Reference</span>
                      <h2 className="text-xl font-bold font-mono text-[var(--color-ink)] mt-0.5">{foundOrder.id}</h2>
                      <p className="text-xs text-[var(--color-ink-muted)] mt-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Placed on {new Date(foundOrder.createdAt).toLocaleDateString('en-PK')}
                      </p>
                    </div>

                    <div className="flex flex-col sm:items-end">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Status</span>
                      <div className="mt-1">
                        <StatusBadge status={foundOrder.status} />
                      </div>
                    </div>
                  </div>

                  {/* Courier tracking segment */}
                  {foundOrder.trackingId && (
                    <div className="glass-2 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
                          <Truck className="w-5 h-5 text-[var(--color-accent)]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold">{foundOrder.courier} Shipment</h4>
                          <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">Tracking Number: <span className="font-mono font-bold text-[var(--color-ink)]">{foundOrder.trackingId}</span></p>
                        </div>
                      </div>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="text-xs font-semibold text-[var(--color-accent)] hover:underline"
                      >
                        Track partner page
                      </a>
                    </div>
                  )}

                  {/* Timeline block */}
                  {foundOrder.status === 'cancelled' ? (
                    <div className="glass-2 rounded-3xl p-8 text-center text-[var(--color-danger)] bg-[var(--color-danger)]/5 border border-[var(--color-danger)]/20">
                      <h3 className="font-bold text-base">This order has been cancelled.</h3>
                      <p className="text-xs text-[var(--color-ink-muted)] mt-1.5">
                        Please contact LUXE customer support if you believe this was an error.
                      </p>
                    </div>
                  ) : (
                    <div className="glass-2 rounded-3xl p-6 md:p-8">
                      <h3 className="text-base font-semibold mb-6 flex items-center gap-2">
                        <Box className="w-4 h-4 text-[var(--color-accent)]" /> Tracking Progress Timeline
                      </h3>
                      <div className="flex flex-col gap-6 ml-3 pl-6 border-l-2 border-[var(--color-border-glass)] relative">
                        {TRACKING_STEPS.map((step, idx) => {
                          const isDone = idx <= currentStepIdx;
                          const isCurrent = idx === currentStepIdx;
                          
                          // Find matching timestamp in statusHistory if done
                          const hist = foundOrder.statusHistory.find((h: any) => h.status === step.status);
                          const formattedTime = hist ? new Date(hist.timestamp).toLocaleString('en-PK', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                            month: 'short',
                            day: 'numeric'
                          }) : null;

                          return (
                            <div key={idx} className="relative">
                              {/* Connector dot */}
                              <span className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 bg-[var(--color-bg)] transition-colors duration-300 ${
                                isDone
                                  ? isCurrent
                                    ? 'bg-[var(--color-accent)] border-[var(--color-accent)] scale-125'
                                    : 'bg-[var(--color-success)] border-[var(--color-success)]'
                                  : 'border-[var(--color-border-glass)] bg-[var(--color-bg)]'
                              }`} />
                              
                              <div className="flex flex-col">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                  <span className={`text-sm font-bold transition-colors ${isDone ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-muted)]'}`}>
                                    {step.label}
                                  </span>
                                  {formattedTime && (
                                    <span className="text-[10px] font-mono text-[var(--color-ink-muted)]">{formattedTime}</span>
                                  )}
                                </div>
                                <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{step.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Order Details (Shipping items) */}
                  <div className="glass-2 rounded-3xl p-6">
                    <h3 className="text-base font-semibold mb-4">Package Details</h3>
                    <div className="flex flex-col gap-3">
                      {foundOrder.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-4 items-center bg-[var(--color-surface)]/20 p-3 rounded-2xl border border-[var(--color-border-glass)]">
                          <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs truncate text-[var(--color-ink)]">{item.name}</span>
                              <span className="text-[8px] uppercase tracking-wider bg-[var(--color-ink)]/10 text-[var(--color-ink)] px-1 py-0.2 rounded-full font-bold">
                                {item.size}
                              </span>
                            </div>
                            <p className="text-[var(--color-ink-muted)] text-[10px] mt-0.5">Qty: {item.quantity}</p>
                          </div>
                          <span className="font-bold text-xs">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-2 rounded-3xl p-10 text-center flex flex-col items-center gap-4">
                  <Package className="w-12 h-12 text-[var(--color-ink-muted)] opacity-20" />
                  <div>
                    <h3 className="font-bold text-base">No order found matching search query.</h3>
                    <p className="text-xs text-[var(--color-ink-muted)] mt-1">
                      Check your order ID syntax (e.g. ORD-1001) or retry with the courier tracking ID.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </main>
  );
}
