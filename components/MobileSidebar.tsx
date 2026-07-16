'use client';

import { X, User } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import ThemeToggle from './ThemeToggle';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import Image from 'next/image';

export default function MobileSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [user] = useAuthState(auth);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 sm:hidden"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-[80%] max-w-[320px] glass z-50 flex flex-col sm:hidden rounded-r-3xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border-glass)]">
              <span className="text-xl font-bold font-display tracking-widest text-[var(--color-ink)]">LUXE</span>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[var(--color-ink)]/5 rounded-full transition-colors text-[var(--color-ink)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between bg-[var(--color-bg)]/50 p-4 rounded-2xl border border-[var(--color-border-glass)]">
                <div className="flex items-center gap-3">
                  {user ? (
                    <>
                      <div className="w-10 h-10 relative rounded-full overflow-hidden bg-gray-200 shrink-0">
                        {user.photoURL ? (
                          <Image src={user.photoURL} alt="Profile" fill className="object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <User className="w-5 h-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]" />
                        )}
                      </div>
                      <Link href="/account" onClick={onClose} className="flex flex-col">
                        <span className="font-medium text-sm text-[var(--color-ink)] line-clamp-1">{user.displayName || user.email}</span>
                        <span className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">View Profile</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-[var(--color-ink)] flex items-center justify-center text-[var(--color-bg)] shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <Link href="/auth" onClick={onClose} className="font-medium text-sm text-[var(--color-ink)] hover:opacity-80 transition-opacity">
                        Sign In / Register
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between bg-[var(--color-bg)]/50 p-4 rounded-2xl border border-[var(--color-border-glass)]">
                <span className="font-medium text-sm text-[var(--color-ink)]">Appearance</span>
                <ThemeToggle />
              </div>

              <nav className="flex flex-col gap-4 mt-4">
                <Link href="/" className="text-lg font-medium text-[var(--color-ink)] hover:text-[var(--color-ink-muted)]" onClick={onClose}>Home</Link>
                <Link href="/shop" className="text-lg font-medium text-[var(--color-ink)] hover:text-[var(--color-ink-muted)]" onClick={onClose}>Shop</Link>
                <Link href="/search" className="text-lg font-medium text-[var(--color-ink)] hover:text-[var(--color-ink-muted)]" onClick={onClose}>Search</Link>
                <Link href="/tracking" className="text-lg font-medium text-[var(--color-ink)] hover:text-[var(--color-ink-muted)]" onClick={onClose}>Track Order</Link>
              </nav>

              <div className="mt-auto pt-6 border-t border-[var(--color-border-glass)] flex flex-col gap-4">
                <Link href="/wishlist" className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]" onClick={onClose}>Wishlist</Link>
                <Link href="/account" className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]" onClick={onClose}>My Account</Link>
                <Link href="/admin" className="text-xs font-semibold text-[var(--color-accent)] hover:opacity-85" onClick={onClose}>Admin Portal</Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
