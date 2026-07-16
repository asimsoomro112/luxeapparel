'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createOrder } from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ShoppingBag, ArrowRight, CheckCircle2, ChevronRight, MapPin, CreditCard, Truck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CheckoutPage() {
  const [user] = useAuthState(auth);
  const { items, total, clearCart } = useCartStore();

  // Form states
  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('Lahore');
  const [submitting, setSubmitting] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setSubmitting(true);
    try {
      const orderPayload = {
        uid: user?.uid || 'anonymous',
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        city,
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.selectedSize || 'M',
          image: item.image,
        })),
        total,
        status: 'pending',
        trackingId: '',
        courier: '',
        updatedAt: new Date().toISOString(),
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date().toISOString(),
            note: 'Order placed by customer via checkout form.',
          },
        ],
      };

      const orderId = await createOrder(orderPayload);
      setPlacedOrderId(orderId);
      clearCart();
    } catch (err) {
      console.error('Failed to submit order:', err);
      alert('Order placement failed. Check connection or Firestore config.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-20 sm:pb-0 flex flex-col justify-between">
      <Navbar />

      <div className="max-w-7xl mx-auto w-full px-6 py-12 flex-1">
        {placedOrderId ? (
          /* Checkout Success View */
          <div className="max-w-xl mx-auto text-center py-16 px-6 glass rounded-3xl flex flex-col items-center gap-6">
            <CheckCircle2 className="w-16 h-16 text-[var(--color-success)] animate-[bounce_1s_ease-in-out_infinite]" />
            <div>
              <h2 className="text-3xl font-display font-bold text-[var(--color-ink)]">Order Confirmed</h2>
              <p className="text-sm text-[var(--color-ink-muted)] mt-2">
                Thank you for shopping with LUXE. Your order has been registered.
              </p>
            </div>

            <div className="bg-[var(--color-surface)]/40 border border-[var(--color-border-glass)] py-4 px-6 rounded-2xl w-full">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Order ID</span>
              <p className="font-mono font-bold text-lg text-[var(--color-accent)] mt-0.5">{placedOrderId}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
              <Link
                href={`/tracking`}
                className="flex-1 py-4 bg-[var(--color-ink)] text-[var(--color-bg)] rounded-full text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Track Order <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="flex-1 py-4 glass text-[var(--color-ink)] rounded-full text-xs font-semibold hover:bg-[var(--color-ink)]/5 transition-colors flex items-center justify-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          /* Checkout Form View */
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form Column (3/5) */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              <h1 className="text-3xl font-display font-bold text-[var(--color-ink)]">Checkout details</h1>
              
              <form onSubmit={handleSubmit} className="glass-2 rounded-3xl p-6 md:p-8 flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Full Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="px-4 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-glass)] text-sm focus:outline-none text-[var(--color-ink)]"
                      placeholder="Ahmed Raza"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Email Address</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="px-4 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-glass)] text-sm focus:outline-none text-[var(--color-ink)]"
                      placeholder="ahmed.raza@gmail.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="px-4 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-glass)] text-sm focus:outline-none text-[var(--color-ink)]"
                      placeholder="+92 312 4567890"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">City</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="px-4 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-glass)] text-sm focus:outline-none text-[var(--color-ink)]"
                    >
                      <option value="Lahore">Lahore</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Faisalabad">Faisalabad</option>
                      <option value="Multan">Multan</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Sialkot">Sialkot</option>
                      <option value="Gujranwala">Gujranwala</option>
                      <option value="Quetta">Quetta</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Shipping Address</label>
                  <textarea
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    rows={3}
                    className="px-4 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-glass)] text-sm focus:outline-none text-[var(--color-ink)] resize-none"
                    placeholder="House number, apartment, street, sector/area"
                  />
                </div>

                {/* Payment Option - COD */}
                <div className="flex flex-col gap-3 mt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Payment Protocol</span>
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5">
                    <CreditCard className="w-5 h-5 text-[var(--color-accent)]" />
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--color-ink)]">Cash on Delivery (COD)</h4>
                      <p className="text-[10px] text-[var(--color-ink-muted)] mt-0.5">Pay in cash upon delivery to your doorstep.</p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || items.length === 0}
                  className="w-full py-4 bg-[var(--color-ink)] text-[var(--color-bg)] rounded-xl font-medium tracking-wide hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </button>
              </form>
            </div>

            {/* Cart Summary Column (2/5) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[var(--color-accent)]" /> Summary ({items.length})
              </h2>

              <div className="glass-2 rounded-3xl p-6 flex flex-col gap-5 max-h-[500px] overflow-y-auto">
                {items.length === 0 ? (
                  <p className="text-sm text-[var(--color-ink-muted)] text-center py-10">Your cart is empty.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center border-b border-[var(--color-border-glass)] pb-4 last:border-0 last:pb-0">
                        <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs truncate text-[var(--color-ink)] max-w-[130px]">{item.name}</span>
                            {item.selectedSize && (
                              <span className="text-[8px] uppercase tracking-wider bg-[var(--color-ink)]/10 text-[var(--color-ink)] px-1 py-0.2 rounded font-bold">
                                {item.selectedSize}
                              </span>
                            )}
                          </div>
                          <p className="text-[var(--color-ink-muted)] text-[10px] mt-0.5">Rs. {item.price.toLocaleString()} x {item.quantity}</p>
                        </div>
                        <span className="font-bold text-xs">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-[var(--color-border-glass)] pt-4 flex flex-col gap-2">
                  <div className="flex justify-between text-xs text-[var(--color-ink-muted)]">
                    <span>Shipping</span>
                    <span>Free Delivery</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[var(--color-ink)] mt-1">
                    <span>Total Amount</span>
                    <span>Rs. {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
