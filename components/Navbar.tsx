'use client';

import { useCartStore } from '@/lib/store';
import { useSearchStore } from '@/lib/searchStore';
import { getProducts } from '@/lib/firestore';
import { ShoppingBag, User, Search, Menu, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';
import MobileSidebar from './MobileSidebar';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

export default function Navbar() {
  const { setIsOpen, items } = useCartStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user] = useAuthState(auth);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  const { isOpen: isSearchOpen, setIsOpen: setIsSearchOpen, query: searchQuery, setQuery: setSearchQuery, reset: resetSearch } = useSearchStore();
  
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Fetch products for search autocomplete
    const fetchProducts = async () => {
      try {
        const liveProducts = await getProducts();
        setAllProducts(liveProducts);
      } catch (e) {
        console.error(e);
      }
    };
    fetchProducts();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = searchQuery.trim() === ''
    ? []
    : allProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  return (
    <>
      <MobileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      
      {/* Top Floating Glassmorphism 2.0 Navbar */}
      <header
        className={`fixed left-4 right-4 md:left-6 md:right-6 max-w-7xl mx-auto z-40 glass-2 transition-all duration-300 ${
          isScrolled 
            ? 'top-3 md:top-4 py-2.5 px-4 md:px-6 rounded-xl shadow-lg' 
            : 'top-4 md:top-6 py-4 px-6 md:px-8 rounded-2xl'
        }`}
        id="navbar-header"
      >
        {/* Dynamic Refined Edge Highlights & Glare */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08] pointer-events-none rounded-[inherit]" />
        
        <div className="relative z-10 flex items-center justify-between min-h-[44px]">
          <AnimatePresence mode="wait">
            {isSearchOpen ? (
              <motion.div
                key="search-active"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="flex items-center w-full gap-4"
              >
                <Search className="w-5 h-5 text-[var(--color-ink-muted)] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search silhouettes, categories, washes..."
                  className="flex-1 bg-transparent border-none outline-none text-base md:text-lg text-[var(--color-ink)] placeholder-[var(--color-ink-muted)]/50 font-medium font-sans"
                  autoFocus
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1.5 rounded-full hover:bg-[rgba(255,255,255,0.12)] dark:hover:bg-[rgba(255,255,255,0.05)] text-[var(--color-ink)] transition-colors flex items-center justify-center border border-transparent hover:border-white/10"
                  id="close-search-button"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="nav-normal"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
                className="w-full flex items-center justify-between"
              >
                {/* Mobile Sidebar Trigger with interactive scale */}
                <div className="flex items-center gap-4 sm:hidden">
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsSidebarOpen(true)} 
                    className="p-2.5 rounded-full hover:bg-[rgba(255,255,255,0.12)] dark:hover:bg-[rgba(255,255,255,0.05)] text-[var(--color-ink)] transition-colors flex items-center justify-center border border-transparent hover:border-white/10"
                    id="mobile-sidebar-trigger"
                  >
                    <Menu className="w-5 h-5" />
                  </motion.button>
                </div>
                
                {/* Logo with interactive letter-spacing and spring */}
                <div className="flex-1 sm:flex-none flex justify-center sm:justify-start">
                  <Link href="/" className="group flex items-center gap-1.5 text-2xl font-bold tracking-[0.15em] font-display text-[var(--color-ink)] transition-all duration-300 hover:opacity-90">
                    LUXE
                  </Link>
                </div>

                {/* Desktop Dual-Layered Glass Pill Nav Links */}
                <nav 
                  className="hidden sm:flex items-center gap-8 absolute left-1/2 -translate-x-1/2 glass-2-nested px-8 py-2 rounded-full border border-white/20 dark:border-white/5 shadow-inner"
                  id="desktop-nav-links"
                >
                  <Link href="/shop" className="text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-all duration-300 relative group py-1">
                    Shop
                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--color-accent)] transition-all duration-300 group-hover:w-full rounded-full" />
                  </Link>
                  <Link href="/shop" className="text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-all duration-300 relative group py-1">
                    Categories
                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--color-accent)] transition-all duration-300 group-hover:w-full rounded-full" />
                  </Link>
                  <Link href="/shop" className="text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-all duration-300 relative group py-1">
                    New Arrivals
                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--color-accent)] transition-all duration-300 group-hover:w-full rounded-full" />
                  </Link>
                  <Link href="/shop" className="text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-all duration-300 relative group py-1">
                    Sale
                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--color-accent)] transition-all duration-300 group-hover:w-full rounded-full" />
                  </Link>
                </nav>

                {/* Interactive Utility Buttons with Glassmorphic Elements */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2.5 rounded-full hover:bg-[rgba(255,255,255,0.12)] dark:hover:bg-[rgba(255,255,255,0.05)] text-[var(--color-ink)] transition-colors flex items-center justify-center border border-transparent hover:border-white/10"
                    id="search-button"
                  >
                    <Search className="w-4.5 h-4.5" />
                  </motion.button>
                  
                  <div className="hidden sm:block">
                    <ThemeToggle />
                  </div>
                  
                  <Link 
                    href={user ? "/account" : "/auth"}
                    className="hidden sm:flex p-2.5 rounded-full hover:bg-[rgba(255,255,255,0.12)] dark:hover:bg-[rgba(255,255,255,0.05)] text-[var(--color-ink)] transition-colors items-center justify-center border border-transparent hover:border-white/10 hover:scale-105 active:scale-95"
                    id="user-auth-button"
                  >
                    <User className="w-4.5 h-4.5" />
                  </Link>
                  
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="p-2.5 rounded-full hover:bg-[rgba(255,255,255,0.12)] dark:hover:bg-[rgba(255,255,255,0.05)] text-[var(--color-ink)] transition-colors flex items-center justify-center relative border border-transparent hover:border-white/10"
                    id="shopping-bag-button"
                  >
                    <ShoppingBag className="w-4.5 h-4.5" />
                    {mounted && itemCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1 right-1 w-4 h-4 bg-[var(--color-accent)] text-white text-[9px] font-bold flex items-center justify-center rounded-full shadow-sm"
                      >
                        {itemCount}
                      </motion.span>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Floating Glassmorphism 2.0 Search Results Dropdown Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed left-4 right-4 md:left-6 md:right-6 max-w-7xl mx-auto z-30 glass-2 rounded-2xl p-6 md:p-8 overflow-hidden max-h-[70vh] overflow-y-auto flex flex-col gap-6"
            style={{
              top: isScrolled ? '68px' : '88px',
            }}
            id="search-results-dropdown"
          >
            {/* Subtle light background shine */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none rounded-[inherit]" />
            
            <div className="relative z-10 flex flex-col gap-6">
              {searchQuery.trim() === '' ? (
                // Initial Suggestion State
                <div className="flex flex-col gap-6" id="trending-searches">
                  <div>
                    <h4 className="text-xs font-bold font-mono uppercase tracking-[0.2em] text-[var(--color-ink-muted)] mb-3">Trending Searches</h4>
                    <div className="flex flex-wrap gap-2.5">
                      {['Obsidian', 'Bone', 'Charcoal', 'Heavyweight', 'Oversized', 'Olive', 'T-Shirts'].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className="px-4 py-2 rounded-full text-xs font-semibold bg-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.22)] dark:bg-[rgba(255,255,255,0.04)] dark:hover:bg-[rgba(255,255,255,0.08)] border border-white/10 dark:border-white/5 text-[var(--color-ink)] transition-all active:scale-95 duration-200"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t border-[var(--color-border-glass)] pt-5">
                    <h4 className="text-xs font-bold font-mono uppercase tracking-[0.2em] text-[var(--color-ink-muted)] mb-3">Shop Categories</h4>
                    <div className="grid grid-cols-2 gap-3 max-w-md">
                      {['T-Shirts', 'Hoodies', 'Pants', 'New Drops'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSearchQuery(cat === 'New Drops' ? 'LUXE' : cat)}
                          className="p-3 rounded-xl text-sm font-semibold text-left bg-white/5 dark:bg-black/10 border border-white/10 dark:border-white/5 hover:border-[var(--color-accent)]/30 text-[var(--color-ink)] transition-colors duration-200 flex items-center justify-between group"
                        >
                          {cat}
                          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-[var(--color-accent)]" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Filtered Results State
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-[var(--color-border-glass)] pb-3">
                    <span className="text-xs font-bold font-mono uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
                      Matching Products ({filteredProducts.length})
                    </span>
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-xs font-mono text-[var(--color-accent)] hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  
                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="search-matches-grid">
                      {filteredProducts.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          onClick={() => resetSearch()}
                          className="flex gap-4 p-3 rounded-2xl bg-white/5 dark:bg-black/15 border border-white/10 dark:border-white/5 hover:border-[var(--color-accent)]/30 hover:bg-white/10 dark:hover:bg-black/25 transition-all duration-300 group"
                        >
                          <div className="relative w-16 h-20 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shrink-0">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex flex-col justify-center min-w-0">
                            <h5 className="font-semibold text-sm text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
                              {product.name}
                            </h5>
                            <span className="text-xs text-[var(--color-ink-muted)] font-mono mt-0.5">
                              {product.category}
                            </span>
                            <span className="text-xs font-bold text-[var(--color-ink)] mt-1">
                              Rs. {product.price.toLocaleString()}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                      <Search className="w-8 h-8 text-[var(--color-ink-muted)] opacity-30" />
                      <p className="text-sm font-medium text-[var(--color-ink-muted)]">
                        No silhouettes found matching &ldquo;{searchQuery}&rdquo;
                      </p>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-accent)] hover:underline mt-1"
                      >
                        Reset search filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

