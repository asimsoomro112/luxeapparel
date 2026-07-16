'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User as UserIcon, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/account';

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push(returnUrl);
    }
  }, [user, loading, router, returnUrl]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        // On success, useEffect will auto-redirect
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        
        // Update auth profile
        await updateProfile(newUser, { displayName: name });
        
        // Create user document in Firestore
        const userRef = doc(db, 'users', newUser.uid);
        await setDoc(userRef, {
          uid: newUser.uid,
          email: newUser.email,
          displayName: name,
          photoURL: null,
          createdAt: serverTimestamp(),
        });
        
        // On success, useEffect will auto-redirect
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      // Clean up Firebase error messages
      let message = err.message || 'An error occurred during authentication.';
      if (err.code === 'auth/email-already-in-use') message = 'This email is already registered.';
      if (err.code === 'auth/invalid-credential') message = 'Invalid email or password.';
      if (err.code === 'auth/weak-password') message = 'Password should be at least 6 characters.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setError('');
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;
      
      // Check if user document exists, create if not
      const userRef = doc(db, 'users', loggedInUser.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: loggedInUser.uid,
          email: loggedInUser.email,
          displayName: loggedInUser.displayName,
          photoURL: loggedInUser.photoURL,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err: any) {
      console.error("Google auth error:", err);
      setError('Failed to sign in with Google. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-ink)]" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[var(--color-bg)] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[var(--color-ink)]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] bg-[var(--color-accent)]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Minimal Top Nav for Auth Page */}
      <nav className="relative z-10 w-full p-6 flex justify-center">
        <Link href="/" className="text-2xl font-bold tracking-[0.15em] font-display text-[var(--color-ink)]">
          LUXE
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-[420px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
            className="glass-2 rounded-3xl p-8 shadow-2xl border border-[var(--color-border-glass)]"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-display font-bold text-[var(--color-ink)] mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-sm text-[var(--color-ink-muted)]">
                {isLogin ? 'Enter your details to access your account.' : 'Join LUXE for an elevated shopping experience.'}
              </p>
            </div>

            <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-1.5"
                  >
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)] ml-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--color-ink-muted)]">
                        <UserIcon className="w-4.5 h-4.5" />
                      </div>
                      <input
                        type="text"
                        required={!isLogin}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[var(--color-bg)]/50 border border-[var(--color-border-glass)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]/20 text-[var(--color-ink)] transition-all placeholder-[var(--color-ink-muted)]/50"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)] ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--color-ink-muted)]">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[var(--color-bg)]/50 border border-[var(--color-border-glass)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]/20 text-[var(--color-ink)] transition-all placeholder-[var(--color-ink-muted)]/50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)] ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--color-ink-muted)]">
                    <Lock className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[var(--color-bg)]/50 border border-[var(--color-border-glass)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]/20 text-[var(--color-ink)] transition-all placeholder-[var(--color-ink-muted)]/50"
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium p-3 rounded-lg flex items-center gap-2"
                  >
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-[var(--color-ink)] text-[var(--color-bg)] py-3.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70 group"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-border-glass)]" />
              </div>
              <span className="relative bg-[var(--color-surface)] px-4 text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider">
                Or continue with
              </span>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full mt-6 bg-[var(--color-bg)] border border-[var(--color-border-glass)] hover:border-[var(--color-ink)]/20 text-[var(--color-ink)] py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-3 disabled:opacity-70 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>

            <div className="mt-8 text-center">
              <p className="text-sm text-[var(--color-ink-muted)]">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="font-bold text-[var(--color-ink)] hover:underline focus:outline-none"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
