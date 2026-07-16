import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default function WishlistPage() {
  return (
    <main className="min-h-screen pt-24 pb-20 sm:pb-0">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-display font-bold text-[var(--color-ink)] mb-8">Your Wishlist</h1>
        <div className="flex flex-col items-center justify-center py-20 bg-[var(--color-surface)]/40 rounded-3xl border border-[var(--color-border-glass)]">
          <p className="text-[var(--color-ink-muted)]">Your wishlist is currently empty.</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
