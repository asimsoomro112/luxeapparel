'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { User, ShoppingBag, MapPin, Search, ArrowRight, ShieldCheck, Loader2, Save } from 'lucide-react';
import { getUserOrders, updateUserProfile } from '@/lib/firestore';
import { doc, getDoc } from 'firebase/firestore';

export default function AccountPage() {
  const [user] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');

  // Data states
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Lahore');
  const [address, setAddress] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      fetchProfile();
      fetchOrders();
    } else {
      setOrders([]);
      setPhone('');
      setAddress('');
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoadingProfile(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.displayName) setDisplayName(data.displayName);
        if (data.phone) setPhone(data.phone);
        if (data.city) setCity(data.city);
        if (data.address) setAddress(data.address);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const userOrders = await getUserOrders(user.uid);
      setOrders(userOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSavingProfile(true);
    setSaveMessage('');
    try {
      await updateUserProfile(user.uid, {
        displayName,
        phone,
        city,
        address,
      });
      setSaveMessage('Profile saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setSaveMessage('Failed to save profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-20 sm:pb-0 flex flex-col justify-between">
      <Navbar />

      <div className="max-w-7xl mx-auto w-full px-6 py-12 flex-1">
        <h1 className="text-4xl font-display font-bold text-[var(--color-ink)] mb-8">My Account</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="md:col-span-1 flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`text-left px-4 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-[var(--color-ink)]/5 text-[var(--color-ink)] font-semibold'
                  : 'text-[var(--color-ink-muted)] hover:bg-[var(--color-ink)]/5'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`text-left px-4 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'orders'
                  ? 'bg-[var(--color-ink)]/5 text-[var(--color-ink)] font-semibold'
                  : 'text-[var(--color-ink-muted)] hover:bg-[var(--color-ink)]/5'
              }`}
            >
              My Orders
            </button>
            
            <Link
              href="/tracking"
              className="text-left px-4 py-3 rounded-xl font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-ink)]/5 transition-colors flex items-center justify-between"
            >
              <span>Track Order</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/admin"
              className="text-left px-4 py-3 rounded-xl font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 transition-colors flex items-center justify-between mt-4 border border-[var(--color-accent)]/10"
            >
              <span>Admin Dashboard</span>
              <ShieldCheck className="w-4 h-4" />
            </Link>
          </div>

          {/* Details Content Box */}
          <div className="md:col-span-3 bg-[var(--color-surface)]/40 rounded-3xl border border-[var(--color-border-glass)] p-8 min-h-[400px]">
            {activeTab === 'profile' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h2 className="text-2xl font-bold font-display mb-6">Profile Information</h2>
                {user ? (
                  loadingProfile ? (
                    <div className="flex items-center gap-2 text-[var(--color-ink-muted)]">
                      <Loader2 className="w-5 h-5 animate-spin" /> Loading profile...
                    </div>
                  ) : (
                    <div className="flex flex-col gap-8">
                      {/* Avatar & Basic Info */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-ink)] text-[var(--color-bg)] flex items-center justify-center font-bold text-xl shrink-0">
                          {displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{user.email}</h4>
                          <p className="text-sm text-[var(--color-ink-muted)]">Connected via Google</p>
                        </div>
                      </div>

                      {/* Edit Profile Form */}
                      <form onSubmit={handleSaveProfile} className="flex flex-col gap-5 max-w-lg">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Full Name</label>
                          <input
                            type="text"
                            required
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="px-4 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-glass)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]/10 text-[var(--color-ink)]"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Phone Number</label>
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+92 3XX XXXXXXX"
                              className="px-4 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-glass)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]/10 text-[var(--color-ink)]"
                            />
                          </div>
                          
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">City</label>
                            <select
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              className="px-4 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-glass)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]/10 text-[var(--color-ink)]"
                            >
                              <option value="Lahore">Lahore</option>
                              <option value="Karachi">Karachi</option>
                              <option value="Islamabad">Islamabad</option>
                              <option value="Rawalpindi">Rawalpindi</option>
                              <option value="Faisalabad">Faisalabad</option>
                              <option value="Multan">Multan</option>
                              <option value="Peshawar">Peshawar</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Default Shipping Address</label>
                          <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            rows={3}
                            placeholder="House number, apartment, street, sector/area"
                            className="px-4 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-glass)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]/10 text-[var(--color-ink)] resize-none"
                          />
                        </div>

                        <div className="flex items-center gap-4 mt-2">
                          <button
                            type="submit"
                            disabled={savingProfile}
                            className="px-6 py-3 bg-[var(--color-ink)] text-[var(--color-bg)] rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                          >
                            {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                          </button>
                          {saveMessage && (
                            <span className="text-sm font-medium text-[var(--color-success)]">{saveMessage}</span>
                          )}
                        </div>
                      </form>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-start gap-4">
                    <p className="text-[var(--color-ink-muted)] text-sm">Please sign in to view and edit your profile credentials.</p>
                    <Link
                      href="/auth"
                      className="px-6 py-2.5 bg-[var(--color-ink)] text-[var(--color-bg)] rounded-full text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      Sign In Now
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h2 className="text-2xl font-bold font-display mb-6">Order History</h2>
                {user ? (
                  loadingOrders ? (
                    <div className="flex items-center gap-2 text-[var(--color-ink-muted)]">
                      <Loader2 className="w-5 h-5 animate-spin" /> Fetching your orders...
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-[var(--color-bg)] border border-[var(--color-border-glass)] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[var(--color-ink)]/20 shadow-sm">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Order ID</span>
                            <span className="font-mono font-bold text-[var(--color-ink)]">{order.id}</span>
                            <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-ink-muted)]">
                              <span>{new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleDateString('en-PK')}</span>
                              <span>•</span>
                              <span className="font-semibold text-[var(--color-ink)]">Rs. {order.total?.toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:items-end gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' :
                              'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                            }`}>
                              {order.status.replace(/_/g, ' ')}
                            </span>
                            <Link
                              href={`/tracking?id=${order.id}`}
                              className="text-xs font-semibold text-[var(--color-ink)] hover:underline flex items-center gap-1"
                            >
                              Track Progress <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 items-start">
                      <p className="text-[var(--color-ink-muted)] text-sm">You haven't placed any orders yet.</p>
                      <Link
                        href="/shop"
                        className="px-6 py-2.5 bg-[var(--color-ink)] text-[var(--color-bg)] rounded-full text-xs font-semibold hover:opacity-90"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-start gap-4">
                    <p className="text-[var(--color-ink-muted)] text-sm">Sign in to check past orders, or search using your order tracking key.</p>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href="/auth"
                        className="px-6 py-2.5 bg-[var(--color-ink)] text-[var(--color-bg)] rounded-full text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/tracking"
                        className="px-6 py-2.5 glass rounded-full text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-ink)]/5 transition-colors flex items-center gap-2"
                      >
                        Track An Order
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
