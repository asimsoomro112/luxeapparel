'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { getProducts } from '@/lib/firestore';

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col animate-pulse" id="product-card-skeleton">
      {/* Aspect-ratio matched container */}
      <div className="relative aspect-[4/5] bg-gray-200 dark:bg-gray-800 rounded-[2.5rem] mb-4 overflow-hidden border border-[var(--color-border-glass)]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
      </div>
      
      {/* Content lines matched to product text */}
      <div className="px-2 flex flex-col gap-2.5">
        <div className="h-5 w-2/3 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        <div className="h-4 w-5/6 bg-gray-150 dark:bg-gray-800/60 rounded-md" />
        <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-800 rounded-md mt-1" />
      </div>
    </div>
  );
}

export default function ProductGrid() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const liveProducts = await getProducts();
        setProducts(liveProducts);
      } catch (error) {
        console.error("Error fetching live products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col items-center mb-16 text-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 text-[var(--color-ink)]">Latest Arrivals</h2>
        <p className="text-[var(--color-ink-muted)] max-w-xl">
          Discover our newest drop-shoulder silhouettes. Oversized fits, premium heavyweight cotton, designed for effortless style.
        </p>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-[var(--color-ink-muted)]">New arrivals dropping soon.</p>
        </div>
      )}
    </section>
  );
}
