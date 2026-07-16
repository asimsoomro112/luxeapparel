'use client';

import { useCartStore } from '@/lib/store';
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

export default function CartDrawer() {
  const { isOpen, setIsOpen, items, updateQuantity, removeItem, total } = useCartStore();

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Custom heavy backdrop blur matching premium experience */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
          />

          {/* Premium Glassmorphism 2.0 Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 280, mass: 0.9 }}
            data-no-loader
            className="fixed top-0 right-0 h-full w-full sm:w-[440px] glass-2 border-l border-[var(--color-border-glass)] shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Ambient background accent light for Glassmorphism depth */}
            <div className="absolute top-[-20%] right-[-20%] w-72 h-72 bg-[var(--color-accent)]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-60 h-60 bg-[var(--color-ink)]/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center justify-between p-6 border-b border-[var(--color-border-glass)] z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[var(--color-ink)]/5 dark:bg-white/5 border border-[var(--color-border-glass)]">
                  <ShoppingBag className="w-5 h-5 text-[var(--color-ink)]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-bold text-lg uppercase tracking-wider text-[var(--color-ink)]">
                    Curated bag
                  </span>
                  <span className="text-[10px] font-mono text-[var(--color-ink-muted)] uppercase tracking-widest mt-0.5">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="group p-2.5 rounded-full hover:bg-[var(--color-ink)]/5 transition-all text-[var(--color-ink)] border border-[var(--color-border-glass)] flex items-center justify-center hover:scale-105 active:scale-95"
              >
                <X className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
              </button>
            </div>

            {/* Items Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 z-10 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--color-ink)]/10">
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.3 }}
                    transition={{ delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-[var(--color-ink)]/5 dark:bg-white/5 flex items-center justify-center mb-6 border border-[var(--color-border-glass)]"
                  >
                    <ShoppingBag className="w-8 h-8 text-[var(--color-ink)]" />
                  </motion.div>
                  <h3 className="font-display font-medium text-base uppercase tracking-wider text-[var(--color-ink)]">
                    Your bag is empty
                  </h3>
                  <p className="text-xs text-[var(--color-ink-muted)] mt-2 max-w-xs leading-relaxed">
                    Explore our premium collections and add drop-shoulder silhouettes to your curation.
                  </p>
                  <Link
                    href="/shop"
                    onClick={() => setIsOpen(false)}
                    className="mt-6 px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider bg-[var(--color-ink)] text-[var(--color-bg)] hover:opacity-90 transition-opacity"
                  >
                    Explore Silhouettes
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={`${item.id}-${item.selectedSize || 'default'}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="glass-2-nested rounded-[1.5rem] p-4 flex gap-4 items-center group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[var(--color-ink)]/10"
                      >
                        {/* Image Frame */}
                        <div className="relative w-20 h-24 rounded-2xl overflow-hidden bg-gray-150 dark:bg-gray-800 shrink-0 border border-[var(--color-border-glass)] shadow-sm">
                          <Image
                            src={item.image || '/placeholder.png'}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                            sizes="80px"
                          />
                        </div>

                        {/* Description & Controls */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between h-24 py-0.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-display font-semibold text-sm text-[var(--color-ink)] truncate max-w-[190px] leading-tight">
                                {item.name}
                              </h4>
                              {item.selectedSize && (
                                <span className="inline-block text-[9px] font-mono font-bold uppercase tracking-widest bg-[var(--color-ink)] text-[var(--color-bg)] px-2 py-0.5 rounded-full mt-1.5 shadow-sm">
                                  SIZE: {item.selectedSize}
                                </span>
                              )}
                            </div>
                            
                            <button
                              onClick={() => removeItem(item.id, item.selectedSize)}
                              className="p-1.5 rounded-full bg-red-500/5 hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 shrink-0 focus:opacity-100"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-auto">
                            <span className="font-mono text-xs font-bold text-[var(--color-ink)]">
                              Rs. {(item.price * item.quantity).toLocaleString()}
                            </span>

                            {/* Luxury Pill Quantity Control */}
                            <div className="flex items-center gap-1.5 bg-[var(--color-ink)]/5 dark:bg-white/5 border border-[var(--color-border-glass)] rounded-full p-1 text-[var(--color-ink)] scale-90 origin-right">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)}
                                className="w-6 h-6 hover:bg-[var(--color-bg)] rounded-full transition-all flex items-center justify-center active:scale-90"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="text-xs font-mono font-bold w-5 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                                className="w-6 h-6 hover:bg-[var(--color-bg)] rounded-full transition-all flex items-center justify-center active:scale-90"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-6 border-t border-[var(--color-border-glass)] bg-[var(--color-bg)]/80 backdrop-blur-lg relative z-10">
                <div className="flex items-center justify-between mb-4 px-1">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">Subtotal</span>
                  <span className="text-xl font-mono font-bold tracking-tight text-[var(--color-ink)]">
                    Rs. {total.toLocaleString()}
                  </span>
                </div>
                
                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="group relative w-full bg-[var(--color-ink)] hover:bg-[var(--color-ink)]/95 text-[var(--color-bg)] py-4 rounded-full font-display font-semibold uppercase tracking-wider text-xs shadow-lg shadow-[var(--color-ink)]/10 hover:shadow-[var(--color-ink)]/20 transition-all flex items-center justify-center gap-2 overflow-hidden"
                >
                  {/* Gloss shine overlay animation on hover */}
                  <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[-25deg] translate-x-[-100%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-out" />
                  
                  <span>Proceed to checkout</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <p className="text-[10px] text-[var(--color-ink-muted)] text-center mt-3 font-mono uppercase tracking-widest">
                  Complimentary Premium Shipping Included
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
