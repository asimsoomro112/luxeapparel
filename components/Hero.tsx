'use client';

import { motion } from 'motion/react';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[var(--color-bg)]">
      {/* Background Image/Shape */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="https://images.unsplash.com/photo-1618354691229-88d47f285158?auto=format&fit=crop&q=80" 
          alt="Luxe Background"
          fill
          className="object-cover opacity-50 dark:opacity-20"
          referrerPolicy="no-referrer"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-transparent to-[var(--color-bg)]/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-center text-center mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--color-ink)] animate-pulse" />
          <span className="text-xs font-medium tracking-wide uppercase text-[var(--color-ink)]">Summer Collection &apos;26</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="text-6xl sm:text-8xl md:text-9xl font-display font-bold tracking-tighter text-[var(--color-ink)] mix-blend-overlay"
        >
          REDEFINE
          <br />
          COMFORT
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-6 text-lg sm:text-xl text-[var(--color-ink-muted)] max-w-lg font-medium mix-blend-overlay"
        >
          Premium drop-shoulder tees engineered for the modern aesthetic. Crafted in Pakistan.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <button className="px-8 py-4 bg-[var(--color-ink)] text-[var(--color-bg)] rounded-full font-medium tracking-wide hover:opacity-80 transition-opacity shadow-xl">
            Shop the Drop
          </button>
          <button className="px-8 py-4 glass text-[var(--color-ink)] rounded-full font-medium tracking-wide hover:opacity-80 transition-opacity shadow-sm">
            View Lookbook
          </button>
        </motion.div>
      </div>
    </section>
  );
}
