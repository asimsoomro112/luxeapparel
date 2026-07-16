'use client';

import AdminGuard from '@/components/admin/AdminGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ThemeToggle from '@/components/ThemeToggle';
import { useAdminStore } from '@/lib/adminStore';
import { Bell, Search, User } from 'lucide-react';

import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { subscribeProducts, subscribeOrders, subscribeCustomers, subscribeSettings } = useAdminStore();

  useEffect(() => {
    const unsubProducts = subscribeProducts();
    const unsubOrders = subscribeOrders();
    const unsubCustomers = subscribeCustomers();
    const unsubSettings = subscribeSettings();

    return () => {
      unsubProducts();
      unsubOrders();
      unsubCustomers();
      unsubSettings();
    };
  }, [subscribeProducts, subscribeOrders, subscribeCustomers, subscribeSettings]);

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)] transition-colors duration-300">
        {/* Decorative backgrounds */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(110,86,207,0.04),transparent_50%)] pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(110,86,207,0.03),transparent_50%)] pointer-events-none" />
        
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Work Area */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          {/* Header */}
          <header className="h-16 border-b border-[var(--color-border-glass)] backdrop-blur-md bg-[var(--color-bg)]/40 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30">
            {/* Left: Mobile placeholder to push things right */}
            <div className="lg:hidden w-10" />
            
            {/* Center/Search */}
            <div className="hidden md:flex items-center gap-2 max-w-xs w-full bg-[var(--color-surface)]/40 border border-[var(--color-border-glass)] rounded-full px-3 py-1.5 text-xs text-[var(--color-ink-muted)]">
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span>Search dashboard...</span>
            </div>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-4 ml-auto">
              <ThemeToggle />
              
              <button className="p-2 rounded-xl hover:bg-[var(--color-ink)]/5 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full" />
              </button>
              
              <div className="h-4 w-px bg-[var(--color-border-glass)]" />
              
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-semibold text-xs flex items-center justify-center border border-[var(--color-accent)]/20 shadow-sm">
                  AD
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold leading-none">Admin</span>
                  <span className="text-[9px] text-[var(--color-ink-muted)] mt-0.5 leading-none">Store Manager</span>
                </div>
              </div>
            </div>
          </header>
          
          {/* Content */}
          <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
