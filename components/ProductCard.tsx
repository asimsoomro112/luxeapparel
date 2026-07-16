'use client';

import { Product } from '@/lib/store';
import { useCartStore } from '@/lib/store';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductCard({ product, index }: { product: Product; index: number }) {
  const addItem = useCartStore((state) => state.addItem);
  const setIsOpen = useCartStore((state) => state.setIsOpen);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setIsOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="group relative flex flex-col"
    >
      <Link href={`/product/${product.id}`} className="flex flex-col flex-1">
        <div className="relative aspect-[4/5] bg-gray-100 dark:bg-gray-800 rounded-3xl overflow-hidden mb-4">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Glassmorphic Add Button */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
            <button
              onClick={handleAdd}
              className="w-full py-3.5 glass text-[var(--color-ink)] font-medium rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Add to Cart
            </button>
          </div>
        </div>
        
        <div className="flex flex-col px-2">
          <h3 className="font-medium text-lg tracking-tight text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors">{product.name}</h3>
          <p className="text-[var(--color-ink-muted)] text-sm mt-1 mb-2 line-clamp-1">{product.description}</p>
          <span className="font-medium text-[var(--color-ink)]">Rs. {product.price.toLocaleString()}</span>
        </div>
      </Link>
    </motion.div>
  );
}
