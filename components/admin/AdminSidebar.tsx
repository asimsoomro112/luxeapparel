'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
  Settings, MapPin, LogOut, Menu, X, ChevronLeft,
} from 'lucide-react';
import { useAdminStore } from '@/lib/adminStore';
import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const SECONDARY_ITEMS = [
  { href: '/tracking', label: 'Track Order', icon: MapPin },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 flex items-center justify-between border-b border-[var(--color-border-glass)]">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl font-bold font-display tracking-[0.15em] text-[var(--color-ink)]">LUXE</span>
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2 py-0.5 rounded-full">
              ADMIN
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden lg:flex p-2 rounded-lg hover:bg-[var(--color-ink)]/5 text-[var(--color-ink-muted)] transition-colors"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                  : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-ink)]/5'
              }`}
              title={collapsed ? item.label : undefined}
            >
              {active && (
                <motion.div
                  layoutId="admin-nav-active"
                  className="absolute inset-0 bg-[var(--color-accent)]/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon className="w-5 h-5 relative z-10 shrink-0" />
              {!collapsed && <span className="relative z-10">{item.label}</span>}
            </Link>
          );
        })}

        <div className="my-3 border-t border-[var(--color-border-glass)]" />

        {SECONDARY_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            target="_blank"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-ink)]/5 transition-all duration-200"
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[var(--color-border-glass)]">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-ink)]/5 transition-all duration-200 mb-1"
          title={collapsed ? 'View Store' : undefined}
        >
          <Package className="w-5 h-5 shrink-0" />
          {!collapsed && <span>View Store</span>}
        </Link>
        <button
          onClick={() => { signOut(auth); setMobileOpen(false); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-all duration-200"
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 glass-2 rounded-xl text-[var(--color-ink)]"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[280px] glass z-50 lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-[var(--color-ink)]/5 rounded-full text-[var(--color-ink)]"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-screen sticky top-0 glass border-r border-[var(--color-border-glass)] transition-all duration-300 shrink-0 ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
