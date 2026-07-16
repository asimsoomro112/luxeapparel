'use client';

import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  delay?: number;
}

export default function StatCard({ label, value, icon: Icon, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="glass-2 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent)]/5 rounded-full blur-3xl -translate-y-8 translate-x-8 group-hover:bg-[var(--color-accent)]/10 transition-colors duration-500" />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="w-11 h-11 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[var(--color-accent)]" />
        </div>
        {trend && (
          <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-full ${
            trend.positive 
              ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' 
              : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'
          }`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      
      <div className="relative z-10">
        <p className="text-2xl font-bold font-display tracking-tight text-[var(--color-ink)]">{value}</p>
        <p className="text-xs font-medium text-[var(--color-ink-muted)] mt-1 uppercase tracking-wider">{label}</p>
      </div>
    </motion.div>
  );
}
