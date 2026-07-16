'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchStore } from '@/lib/searchStore';

export default function SearchRedirectPage() {
  const router = useRouter();
  const { setIsOpen } = useSearchStore();

  useEffect(() => {
    // Open the premium search overlay
    setIsOpen(true);
    // Redirect to shop where the search can happen inline
    router.replace('/shop');
  }, [router, setIsOpen]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-[var(--color-ink)]/5 rounded-full" />
          <div className="absolute inset-0 border-2 border-t-[var(--color-accent)] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
        </div>
        <p className="text-xs font-mono tracking-widest uppercase text-[var(--color-ink-muted)]">
          Opening Search Studio...
        </p>
      </div>
    </div>
  );
}
