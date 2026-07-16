'use client';

import { useState, useEffect } from 'react';
import { useAdminStore } from '@/lib/adminStore';
import { auth } from '@/lib/firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, Mail, Loader2 } from 'lucide-react';

// Hardcoded admin email matches or wildcard validation patterns for quick developer setup
const ADMIN_EMAILS = ['admin@luxe.pk', 'admin@luxe.com', 'luxeapparel116@gmail.com'];

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setAuthState, checkingAuth, setCheckingAuth } = useAdminStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCheckingAuth(true);
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          
          // Access is granted if custom claim admin is true OR if email matches admin list
          const isAdmin =
            idTokenResult.claims.admin === true ||
            (user.email && (
              ADMIN_EMAILS.includes(user.email) ||
              user.email.startsWith('admin@')
            ));

          if (isAdmin) {
            setAuthState(true, user);
            setError(null);
          } else {
            await signOut(auth);
            setError('This account does not have administrator privileges.');
            setAuthState(false, null);
          }
        } catch (err) {
          console.error('Error verifying admin state:', err);
          setError('An error occurred during authentication verification.');
          setAuthState(false, null);
        }
      } else {
        setAuthState(false, null);
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [setAuthState, setCheckingAuth]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Admin Google sign-in failed:', err);
      setError(err.message || 'Google authentication failed.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error('Admin email/password sign-in failed:', err);
      setError('Invalid admin credentials.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-[var(--color-accent)] animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      {/* Ambient background glows */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(110,86,207,0.08),transparent_60%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(110,86,207,0.05),transparent_60%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="w-full max-w-sm"
      >
        <div className="glass-2 rounded-3xl p-8 flex flex-col items-center text-center">
          {/* Branded Logo */}
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-ink)] text-[var(--color-bg)] flex items-center justify-center mb-6 shadow-xl">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold font-display tracking-tight mb-1 text-[var(--color-ink)]">
            LUXE Admin
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mb-8">
            Access authorized admin resources
          </p>

          <div className="w-full flex flex-col gap-4">
            {/* Google Sign In Option */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-4 bg-[var(--color-surface)]/60 hover:bg-[var(--color-surface)]/80 text-[var(--color-ink)] border border-[var(--color-border-glass)] rounded-xl font-medium tracking-wide flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </button>

            <div className="flex items-center justify-between w-full my-2">
              <div className="h-px bg-[var(--color-border-glass)] w-full" />
              <span className="text-[10px] uppercase font-bold text-[var(--color-ink-muted)] tracking-wider px-3 shrink-0">
                Or Use Credentials
              </span>
              <div className="h-px bg-[var(--color-border-glass)] w-full" />
            </div>

            {/* Email/Password Sign In Form */}
            <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-3 text-left">
              <motion.div
                animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-3"
              >
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-muted)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Admin Email"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[var(--color-surface)]/50 border border-[var(--color-border-glass)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-[var(--color-ink)]"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-muted)]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Admin Password"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[var(--color-surface)]/50 border border-[var(--color-border-glass)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-[var(--color-ink)]"
                  />
                </div>
              </motion.div>

              {error && (
                <p className="text-xs font-semibold text-[var(--color-danger)] text-center mt-1">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[var(--color-ink)] text-[var(--color-bg)] rounded-xl font-medium tracking-wide hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Log In
              </button>
            </form>
          </div>

          <p className="text-[9px] text-[var(--color-ink-muted)]/50 mt-6 font-mono text-center max-w-[260px]">
            Access restricted to admin emails starting with admin@ or configured in auth records.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
