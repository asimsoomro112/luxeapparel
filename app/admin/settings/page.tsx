'use client';

import { useAdminStore } from '@/lib/adminStore';
import { useState } from 'react';
import { Check, Settings, ShieldAlert, KeyRound, BellRing, Info } from 'lucide-react';

export default function AdminSettings() {
  const { settings, updateSettings } = useAdminStore();
  const [success, setSuccess] = useState(false);

  // Form states
  const [storeName, setStoreName] = useState(settings.storeName);
  const [storeDescription, setStoreDescription] = useState(settings.storeDescription);
  const [adminPin, setAdminPin] = useState(settings.adminPin);
  const [notifyOnOrder, setNotifyOnOrder] = useState(settings.notifyOnOrder);
  const [notifyOnLowStock, setNotifyOnLowStock] = useState(settings.notifyOnLowStock);
  const [lowStockThreshold, setLowStockThreshold] = useState(settings.lowStockThreshold);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName,
      storeDescription,
      adminPin,
      notifyOnOrder,
      notifyOnLowStock,
      lowStockThreshold: Number(lowStockThreshold),
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-display font-bold text-[var(--color-ink)]">Settings</h1>
        <p className="text-sm text-[var(--color-ink-muted)]">Configure parameters, admin keys, parameters, hooks.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Basic settings */}
        <div className="glass-2 rounded-3xl p-6 flex flex-col gap-5">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Info className="w-4 h-4 text-[var(--color-accent)]" /> Store Profile Metadata
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Store Brand Title</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="px-4 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-glass)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-[var(--color-ink)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Functional Currency</label>
              <input
                type="text"
                disabled
                value="PKR (Rs.)"
                className="px-4 py-3 rounded-xl bg-[var(--color-bg)]/50 border border-[var(--color-border-glass)] text-sm text-[var(--color-ink-muted)] cursor-not-allowed"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Store Description / Subtext</label>
            <input
              type="text"
              value={storeDescription}
              onChange={(e) => setStoreDescription(e.target.value)}
              className="px-4 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-glass)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-[var(--color-ink)]"
            />
          </div>
        </div>

        {/* Access security */}
        <div className="glass-2 rounded-3xl p-6 flex flex-col gap-5">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[var(--color-accent)]" /> Administrator Security
          </h3>
          <div className="flex flex-col gap-1.5 max-w-sm">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Dashboard PIN Code</label>
            <input
              type="password"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              className="px-4 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-glass)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-[var(--color-ink)] font-mono tracking-widest text-center"
              maxLength={10}
            />
          </div>
        </div>

        {/* Notifications and Alert parameters */}
        <div className="glass-2 rounded-3xl p-6 flex flex-col gap-5">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <BellRing className="w-4 h-4 text-[var(--color-accent)]" /> Alert Protocols & Thresholds
          </h3>
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyOnOrder}
                onChange={(e) => setNotifyOnOrder(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--color-accent)] border-[var(--color-border-glass)] focus:ring-0"
              />
              <span className="text-sm font-medium text-[var(--color-ink)]">Trigger notifications on incoming customer orders</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyOnLowStock}
                onChange={(e) => setNotifyOnLowStock(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--color-accent)] border-[var(--color-border-glass)] focus:ring-0"
              />
              <span className="text-sm font-medium text-[var(--color-ink)]">Trigger warning flags on low stock levels</span>
            </label>

            {notifyOnLowStock && (
              <div className="flex flex-col gap-1.5 max-w-xs pl-7 mt-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Low Stock Threshold Limit</label>
                <input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                  className="px-4 py-2.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-glass)] text-sm focus:outline-none"
                  min={1}
                />
              </div>
            )}
          </div>
        </div>

        {/* Save button with status feedback */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="px-6 py-3.5 bg-[var(--color-ink)] text-[var(--color-bg)] rounded-full text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Save Parameters
          </button>
          {success && (
            <span className="text-xs font-semibold text-[var(--color-success)] flex items-center gap-1.5 animate-[fadeIn_0.3s_ease-out]">
              <Check className="w-4 h-4" /> Parameters updated successfully
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
