'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'motion/react';

const ThemeProvider = dynamic(
  () => import('./ThemeProvider').then((mod) => mod.ThemeProvider),
  { ssr: false }
);

const MobileBottomNav = dynamic(
  () => import('./MobileBottomNav'),
  { ssr: false }
);

const CartDrawer = dynamic(
  () => import('./CartDrawer'),
  { ssr: false }
);

// Helper component wrapped in Suspense to safely read route parameters in Next.js 15
function RouteChangeObserver({ onChange }: { onChange: (loading: boolean) => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Hide the luxury loader once the new page is completely resolved
    onChange(false);
  }, [pathname, searchParams, onChange]);

  return null;
}

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [appLoading, setAppLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);

  // Callback to stabilize state update and prevent infinite loops
  const handleRouteChangeComplete = useCallback((loading: boolean) => {
    setPageLoading(loading);
  }, []);

  // Simulate premium initial app load sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Set up global click interceptor to catch any link navigations and trigger the LUXE logo loader
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      // Ignore if the click originated from inside a drawer/modal/cart overlay
      const target = (e.target as HTMLElement);
      if (target.closest('[data-no-loader]')) return;

      const anchor = target.closest('a');
      if (!anchor?.href) return;

      try {
        const url = new URL(anchor.href);
        // Only show loader for real internal page navigations (not hash, not cart, not external)
        if (
          url.origin === window.location.origin &&
          url.pathname !== window.location.pathname &&
          !url.hash &&
          !anchor.hasAttribute('download') &&
          anchor.target !== '_blank'
        ) {
          setPageLoading(true);
        }
      } catch (err) {
        // Fallback if URL parsing fails
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  const isGlobalLoading = appLoading || pageLoading;

  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
      {/* Suspended RouteChangeObserver to safely handle navigation states */}
      <Suspense fallback={null}>
        <RouteChangeObserver onChange={handleRouteChangeComplete} />
      </Suspense>

      {/* Global LUXE Loading Screen */}
      <AnimatePresence mode="wait">
        {isGlobalLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0, 
              transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
            }}
            className="fixed inset-0 z-[9999] bg-[var(--color-bg)] flex flex-col items-center justify-center gap-6 select-none"
            id="global-luxe-loader"
          >
            {/* Soft, premium radial ambient light gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.02),transparent)] dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.01),transparent)] pointer-events-none" />
            
            <div className="flex flex-col items-center gap-10 relative z-10">
              {/* Pulsing luxury logo */}
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }
                }}
                className="text-4xl md:text-5xl font-bold tracking-[0.25em] font-display text-[var(--color-ink)]"
              >
                LUXE
              </motion.div>

              {/* High-fidelity custom double-ring brand spinner */}
              <div className="relative w-24 h-24 flex items-center justify-center" id="luxury-spinner">
                {/* Fixed background thin ring */}
                <div className="absolute inset-0 border-[2.5px] border-[var(--color-ink)]/5 dark:border-white/5 rounded-full" />
                
                {/* Fast spinner ring (Primary brand Accent) */}
                <div className="absolute inset-0 border-[2.5px] border-t-[var(--color-accent)] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDuration: '0.9s' }} />
                
                {/* Counter-rotating inner ring (Subtle ink color) */}
                <div className="absolute inset-2.5 border-[1.5px] border-b-[var(--color-ink)]/50 border-t-transparent border-r-transparent border-l-transparent rounded-full animate-[spin_1.2s_linear_infinite_reverse]" />
                
                <span className="text-[8px] font-mono tracking-[0.25em] font-bold uppercase text-[var(--color-ink-muted)]">
                  STUDIO
                </span>
              </div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.3 }}
                className="text-[10px] font-mono tracking-[0.3em] uppercase text-[var(--color-ink-muted)] text-center"
              >
                Curating Premium Silhouettes
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main App Layout */}
      <div className={isGlobalLoading ? 'opacity-0 h-screen overflow-hidden' : 'opacity-100 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]'}>
        {children}
      </div>
      <MobileBottomNav />
      <CartDrawer />
    </ThemeProvider>
  );
}
