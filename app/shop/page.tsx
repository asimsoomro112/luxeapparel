import Navbar from '@/components/Navbar';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default function ShopPage() {
  return (
    <main className="min-h-screen pt-24 pb-20 sm:pb-0">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-display font-bold text-[var(--color-ink)]">All Products</h1>
        <button className="px-6 py-2 glass rounded-full text-sm font-medium text-[var(--color-ink)]">
          Filter & Sort
        </button>
      </div>
      <ProductGrid />
      <Footer />
    </main>
  );
}
