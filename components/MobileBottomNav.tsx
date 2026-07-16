'use client';

import { Home, Search, Heart, User, Grid } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useSearchStore } from '@/lib/searchStore';

const TABS = [
  { id: 'home', label: 'Home', icon: Home, href: '/' },
  { id: 'shop', label: 'Shop', icon: Grid, href: '/shop' },
  { id: 'search', label: 'Search', icon: Search, href: '#', isCenter: true },
  { id: 'wishlist', label: 'Wishlist', icon: Heart, href: '/wishlist' },
  { id: 'profile', label: 'Profile', icon: User, href: '/account' },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('home');
  const { setIsOpen: setIsSearchOpen } = useSearchStore();

  useEffect(() => {
    setActiveTab(TABS.find((tab) => pathname === tab.href)?.id || 'home');
  }, [pathname]);

  return (
    <div className="sm:hidden fixed bottom-6 left-4 right-4 z-40">
      <div 
        className="glass-2 rounded-3xl p-2 shadow-2xl flex items-center justify-around relative border border-white/20 dark:border-white/5"
        id="mobile-bottom-navbar"
      >
        {/* Subtle interior glare effect for Glassmorphism 2.0 */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none rounded-[inherit]" />
        
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                onClick={(e) => {
                  e.preventDefault();
                  setIsSearchOpen(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="relative -top-5 flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-ink)] text-[var(--color-bg)] shadow-[0_8px_20px_rgba(0,0,0,0.3)] border-4 border-[var(--color-bg)] transition-transform hover:scale-105 active:scale-95 z-20"
                id="mobile-nav-search-center"
              >
                <Icon className="w-5 h-5 text-[var(--color-bg)]" />
              </button>
            );
          }

          return (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center justify-center w-14 h-12 z-10"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 bg-[var(--color-ink)]/5 rounded-2xl z-[-1]"
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
              )}
              <Icon 
                className={`w-5 h-5 transition-colors duration-300 ${
                  isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-muted)]'
                }`}
              />
              <span className={`text-[9px] font-medium mt-1 transition-colors duration-300 ${
                isActive ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-muted)]'
              }`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
