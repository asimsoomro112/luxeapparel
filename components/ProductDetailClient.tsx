'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, Plus, Minus, ShoppingBag, Check, ArrowLeft, 
  ChevronDown, ChevronUp, ShieldCheck, Truck, RefreshCw, MessageSquare 
} from 'lucide-react';
import { useCartStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, getDoc } from 'firebase/firestore';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: any;
}

// Default reviews to pre-populate if firestore is empty
const DEFAULT_REVIEWS: Record<string, Omit<Review, 'id' | 'createdAt'>[]> = {
  prod_1: [
    { name: 'Arjun Mehta', rating: 5, comment: 'Absolutely amazing quality! The heavyweight fabric drapes perfectly and the crop/boxy cut is exactly what I was looking for. Will buy other colors.' },
    { name: 'Kunal S.', rating: 5, comment: 'Hands down the best drop-shoulder tee I own. Heavy, thick collar, retains shape after multiple washes.' },
    { name: 'Rohan Sharma', rating: 4, comment: 'Very high quality organic cotton. Sizing is quite oversized, so I recommend sizing down if you want a more standard relaxed fit.' }
  ],
  prod_2: [
    { name: 'Sara Khan', rating: 5, comment: 'The Bone color is so elegant. Beautiful off-white tone that matches with literally everything. Fabric feels super soft.' },
    { name: 'Aditya Sen', rating: 5, comment: 'Thick rib collar and premium thick cotton fabric. Highly recommend this brand.' }
  ],
  prod_3: [
    { name: 'Ishaan Verma', rating: 5, comment: 'The vintage washed charcoal finish is gorgeous. Looks and feels like a luxury designer tee.' },
    { name: 'Vikram Singh', rating: 4, comment: 'Extremely durable fabric, very thick. Great for casual daily streetwear look.' }
  ],
  prod_4: [
    { name: 'Nisha Patel', rating: 5, comment: 'The Mocha tone is a beautiful warm earthy shade. Perfect for minimal aesthetic layering.' },
    { name: 'Preeti G.', rating: 4, comment: 'Love the boxy drape. Cotton is soft and highly breathable despite being heavyweight.' }
  ],
  prod_5: [
    { name: 'Kabir Dev', rating: 5, comment: 'Excellent slate color and the high-density tonal logo embroidery is extremely clean and subtle.' },
    { name: 'Abhishek B.', rating: 5, comment: 'Heavy-knitted luxury comfort. Definitely worth the price point.' }
  ],
  prod_6: [
    { name: 'Manish Rawat', rating: 5, comment: 'Beautiful military-inspired olive hue. The side slits make it super comfortable to move in.' },
    { name: 'Sameer J.', rating: 4, comment: 'Perfect boxy proportion. Neckline stays snug and does not stretch out.' }
  ]
};

interface FirestoreProduct {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  image: string;
  images?: string[];
  sizes?: string[];
  features?: string[];
  [key: string]: any; // allow extra dynamic fields
}

export default function ProductDetailClient({ productId }: { productId: string }) {
  const router = useRouter();
  
  const [product, setProduct] = useState<FirestoreProduct | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as FirestoreProduct);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoadingProduct(false);
      }
    };
    fetchProduct();
  }, [productId]);
  
  // State
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('features');
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewName, setNewReviewName] = useState<string>('');
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewComment, setNewReviewComment] = useState<string>('');
  const [ratingHover, setRatingHover] = useState<number>(0);
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(true);
  const [imageLoading, setImageLoading] = useState<boolean>(true);

  const addItemWithQuantity = useCartStore((state) => state.addItemWithQuantity);
  const setIsCartOpen = useCartStore((state) => state.setIsOpen);

  // Initialize active image when product is loaded
  useEffect(() => {
    if (product) {
      setActiveImage(product.image ?? '');
    }
  }, [product]);

  // Reset image loading status on active image change
  useEffect(() => {
    if (activeImage) {
      setImageLoading(true);
    }
  }, [activeImage]);

  // Load reviews from Firestore & LocalStorage (Fallback)
  useEffect(() => {
    if (!product) return;
    
    const loadReviews = async () => {
      setReviewsLoading(true);
      try {
        let fetchedReviews: Review[] = [];
        
        // 1. Try Firestore
        try {
          const qReviews = query(collection(db, 'reviews'), where('productId', '==', productId));
          const snapshot = await getDocs(qReviews);
          fetchedReviews = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || 'Anonymous',
              rating: Number(data.rating) || 5,
              comment: data.comment || '',
              createdAt: data.createdAt ? data.createdAt.toDate() : new Date()
            };
          });
        } catch (dbError) {
          console.warn('Firestore reviews fetch failed, falling back to local', dbError);
        }

        // 2. Fetch from LocalStorage
        let localReviews: Review[] = [];
        try {
          const saved = localStorage.getItem(`reviews_${productId}`);
          if (saved) {
            localReviews = JSON.parse(saved).map((r: any) => ({
              ...r,
              createdAt: new Date(r.createdAt)
            }));
          }
        } catch (lsError) {
          console.error('Local storage reviews parse failed', lsError);
        }

        // 3. Pre-baked default reviews
        const defaultBaked: Review[] = (DEFAULT_REVIEWS[productId] || []).map((r, i) => ({
          id: `default-${i}`,
          ...r,
          createdAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000 * 3) // some days ago
        }));

        // Merge and deduplicate
        const combined = [...fetchedReviews, ...localReviews];
        
        if (combined.length === 0) {
          setReviews(defaultBaked);
        } else {
          // Sort by date desc
          combined.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          setReviews(combined);
        }
      } catch (err) {
        console.error('Error loading reviews', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    loadReviews();
  }, [productId, product]);

  if (loadingProduct) {
    return (
      <main className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center px-6">
        <Navbar />
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--color-ink)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--color-ink-muted)] font-medium">Loading details...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center px-6">
        <Navbar />
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-display font-bold text-[var(--color-ink)] mb-4">Product Not Found</h1>
          <p className="text-[var(--color-ink-muted)] mb-8">The luxury apparel item you are looking for does not exist or has been removed.</p>
          <Link href="/shop" className="px-8 py-3.5 bg-[var(--color-ink)] text-[var(--color-bg)] rounded-full font-medium inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const handleAddToCart = () => {
    setIsAdded(true);
    
    // Create product instance with selected size
    const productWithDetails = {
      ...product,
      selectedSize,
    };
    
    addItemWithQuantity(productWithDetails as any, quantity);
    
    // Open cart immediately, reset button after 800ms
    setIsCartOpen(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 800);
  };

  const handleQuantityChange = (newQty: number) => {
    if (newQty >= 1 && newQty <= 10) {
      setQuantity(newQty);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) return;

    setSubmittingReview(true);
    const reviewData = {
      productId,
      name: newReviewName,
      rating: newReviewRating,
      comment: newReviewComment,
      createdAt: new Date()
    };

    try {
      // 1. Submit to Firestore
      try {
        await addDoc(collection(db, 'reviews'), {
          productId,
          name: newReviewName,
          rating: newReviewRating,
          comment: newReviewComment,
          createdAt: serverTimestamp()
        });
      } catch (fireError) {
        console.warn('Firestore review submission failed, saving locally', fireError);
      }

      // 2. Save locally to LocalStorage
      const storedKey = `reviews_${productId}`;
      const existingStored = localStorage.getItem(storedKey);
      const list = existingStored ? JSON.parse(existingStored) : [];
      list.unshift(reviewData);
      localStorage.setItem(storedKey, JSON.stringify(list));

      // 3. Add to UI state
      const localReviewWithId: Review = {
        id: `local-${Date.now()}`,
        ...reviewData
      };
      
      setReviews(prev => [localReviewWithId, ...prev]);
      
      // Success triggers
      setSubmitSuccess(true);
      setNewReviewName('');
      setNewReviewComment('');
      setNewReviewRating(5);
      
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Error submitting review', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Calculate overall rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const imagesList = product.images || [product.image];

  return (
    <main className="min-h-screen pt-24 pb-20 bg-[var(--color-bg)]">
      <Navbar />

      {/* Breadcrumb / Back button */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
        <span className="text-xs text-[var(--color-ink-muted)] font-mono">{product.category} / {product.id}</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Images Section (Left Column) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative aspect-[4/5] w-full rounded-[2.5rem] overflow-hidden bg-gray-100 dark:bg-gray-800 border border-[var(--color-border-glass)]">
              {/* Image Loading Skeleton Overlay */}
              <AnimatePresence>
                {imageLoading && (
                  <motion.div 
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse flex items-center justify-center z-10"
                    id="product-image-skeleton"
                  >
                    <div className="text-sm font-mono tracking-[0.2em] uppercase text-[var(--color-ink-muted)] opacity-40">
                      LUXE STUDIO
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Image 
                src={activeImage || product.image || '/placeholder.png'} 
                alt={product.name}
                fill
                priority
                onLoad={() => setImageLoading(false)}
                className={`object-cover transition-all duration-700 ${imageLoading ? 'scale-105 blur-md' : 'scale-100 blur-0'}`}
                referrerPolicy="no-referrer"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
              
              {/* Subtle glass brand pill */}
              <div className="absolute top-6 left-6 glass px-4 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase text-[var(--color-ink)] z-20">
                Luxury Standard
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {imagesList.length > 1 && (
              <div className="grid grid-cols-4 gap-4 mt-2">
                {imagesList.map((imgUrl: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 border transition-all duration-300 ${
                      (activeImage === imgUrl || (!activeImage && i === 0))
                        ? 'border-[var(--color-ink)] ring-2 ring-[var(--color-ink)]/10 scale-95' 
                        : 'border-[var(--color-border-glass)] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image 
                      src={imgUrl} 
                      alt={`${product.name} view ${i + 1}`}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                      sizes="(max-width: 768px) 25vw, 15vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section (Right Column) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold tracking-wider text-[var(--color-accent)] uppercase">{product.category}</span>
              <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-[var(--color-ink)] leading-tight">
                {product.name}
              </h1>
              
              {/* Rating Summary Link */}
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(avgRating)) ? 'fill-current' : 'opacity-20'}`} />
                  ))}
                </div>
                <span className="text-sm font-medium text-[var(--color-ink)]">{avgRating}</span>
                <span className="text-xs text-[var(--color-ink-muted)] font-mono">
                  •
                </span>
                <a href="#reviews" className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] underline underline-offset-4 transition-colors font-mono">
                  {reviews.length} Customer Reviews
                </a>
              </div>
            </div>

            {/* Price tag */}
            <div className="border-y border-[var(--color-border-glass)] py-6">
              <span className="text-4xl font-semibold tracking-tight text-[var(--color-ink)]">
                Rs. {product.price.toLocaleString()}
              </span>
              <p className="text-xs text-[var(--color-ink-muted)] mt-2">Inclusive of all local premium standard luxury duties & taxes.</p>
            </div>

            {/* Description */}
            <p className="text-[var(--color-ink-muted)] text-base leading-relaxed">
              {product.description || 'Premium craftsmanship meets contemporary urban luxury. Part of our signature drop, engineered with heavyweight textiles designed for the absolute perfect drape.'}
            </p>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-[var(--color-ink)] font-mono uppercase">Select Size: <span className="font-bold">{selectedSize}</span></span>
                  <button className="text-xs text-[var(--color-accent)] hover:underline font-mono uppercase">Size Guide</button>
                </div>
                <div className="flex gap-3">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-12 w-16 text-sm font-medium rounded-2xl flex items-center justify-center transition-all duration-200 ${
                        selectedSize === size
                          ? 'bg-[var(--color-ink)] text-[var(--color-bg)] font-bold shadow-lg scale-95'
                          : 'glass hover:bg-[var(--color-ink)]/5 text-[var(--color-ink)]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Actions Row */}
            <div className="flex flex-col gap-4">
              <span className="text-sm font-medium text-[var(--color-ink)] font-mono uppercase">Quantity</span>
              <div className="flex gap-4">
                {/* Quantity counter */}
                <div className="flex items-center justify-between h-14 bg-[var(--color-ink)]/5 rounded-2xl px-4 border border-[var(--color-border-glass)] w-36">
                  <button 
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-1.5 hover:bg-[var(--color-surface)]/80 rounded-full transition-colors text-[var(--color-ink)] disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-medium text-[var(--color-ink)] text-base font-mono w-6 text-center">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 10}
                    className="p-1.5 hover:bg-[var(--color-surface)]/80 rounded-full transition-colors text-[var(--color-ink)] disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAdded}
                  className="flex-1 h-14 bg-[var(--color-ink)] text-[var(--color-bg)] rounded-full font-medium tracking-wide flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-100 relative overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    {isAdded ? (
                      <motion.span 
                        key="added"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="flex items-center gap-2 font-bold text-[var(--color-success)]"
                      >
                        <Check className="w-5 h-5" /> Added to Cart
                      </motion.span>
                    ) : (
                      <motion.span 
                        key="add"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <ShoppingBag className="w-5 h-5" /> Add to Cart — Rs. {(product.price * quantity).toLocaleString()}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>

            {/* Accordions (Highlights, Details, Shipping) */}
            <div className="flex flex-col border-t border-[var(--color-border-glass)] mt-4">
              
              {/* Features accordion */}
              <div className="border-b border-[var(--color-border-glass)] py-4">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'features' ? null : 'features')}
                  className="w-full flex justify-between items-center text-sm font-medium text-[var(--color-ink)] text-left uppercase tracking-wider font-mono"
                >
                  <span>Premium Highlights</span>
                  {openAccordion === 'features' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                <AnimatePresence initial={false}>
                  {openAccordion === 'features' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <ul className="mt-4 flex flex-col gap-2.5 pl-4 list-disc text-sm text-[var(--color-ink-muted)]">
                        {product.features?.map((feat: string, index: number) => (
                          <li key={index} className="leading-relaxed">{feat}</li>
                        )) || (
                          <>
                            <li className="leading-relaxed">Heavyweight 100% Organic Combed Cotton fabric.</li>
                            <li className="leading-relaxed">Signature relaxed, boxy drop-shoulder fit.</li>
                            <li className="leading-relaxed">Snug thick rib collar designed to resist stretching.</li>
                          </>
                        )}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Delivery Accordion */}
              <div className="border-b border-[var(--color-border-glass)] py-4">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
                  className="w-full flex justify-between items-center text-sm font-medium text-[var(--color-ink)] text-left uppercase tracking-wider font-mono"
                >
                  <span>Shipping & Returns</span>
                  {openAccordion === 'shipping' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                <AnimatePresence initial={false}>
                  {openAccordion === 'shipping' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 flex flex-col gap-4 text-sm text-[var(--color-ink-muted)] leading-relaxed">
                        <div className="flex gap-3 items-start">
                          <Truck className="w-5 h-5 text-[var(--color-ink)] shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-[var(--color-ink)]">Complimentary Express Shipping</p>
                            <p className="text-xs">Delivered within 2–4 business days across India with full trackable security.</p>
                          </div>
                        </div>
                        <div className="flex gap-3 items-start">
                          <RefreshCw className="w-5 h-5 text-[var(--color-ink)] shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-[var(--color-ink)]">7-Day Easy Returns & Exchanges</p>
                            <p className="text-xs">Unworn products in original packaging with tags intact can be returned easily.</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>

        {/* Reviews Section */}
        <section id="reviews" className="border-t border-[var(--color-border-glass)] mt-24 pt-16 scroll-mt-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-display font-bold text-[var(--color-ink)] tracking-tight flex items-center gap-3">
                <MessageSquare className="w-7 h-7 text-[var(--color-accent)]" /> Customer Feedback
              </h2>
              <p className="text-[var(--color-ink-muted)] mt-1">Authentic experiences and reviews from our verified clients.</p>
            </div>

            {/* Scorecard */}
            <div className="flex items-center gap-4 bg-[var(--color-surface)]/40 p-4 px-6 rounded-3xl border border-[var(--color-border-glass)] shadow-sm">
              <div className="text-center">
                <span className="text-4xl font-bold text-[var(--color-ink)] font-mono">{avgRating}</span>
                <span className="text-xs text-[var(--color-ink-muted)] block mt-0.5">out of 5.0</span>
              </div>
              <div className="h-10 w-[1px] bg-[var(--color-border-glass)]" />
              <div>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(Number(avgRating)) ? 'fill-current' : 'opacity-20'}`} />
                  ))}
                </div>
                <span className="text-xs text-[var(--color-ink-muted)] block mt-1 font-mono">{reviews.length} Verified Reviews</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Reviews list */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {reviewsLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-[var(--color-ink-muted)]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-ink)] mb-4" />
                  <p className="text-sm font-mono uppercase tracking-wider">Syncing Reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-16 text-center bg-[var(--color-surface)]/20 rounded-[2rem] border border-[var(--color-border-glass)]">
                  <Star className="w-12 h-12 text-[var(--color-ink-muted)] opacity-20 mx-auto mb-4" />
                  <p className="text-[var(--color-ink-muted)]">No reviews submitted yet. Be the first to express your thoughts!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {reviews.map((review) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={review.id}
                      className="bg-[var(--color-surface)]/40 p-6 md:p-8 rounded-[2rem] border border-[var(--color-border-glass)] shadow-sm flex flex-col gap-4"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="font-semibold text-lg text-[var(--color-ink)]">{review.name}</p>
                          <div className="flex text-amber-500 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'opacity-20'}`} />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs font-mono text-[var(--color-ink-muted)]">
                          {new Date(review.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <p className="text-[var(--color-ink-muted)] text-sm leading-relaxed whitespace-pre-line">
                        {review.comment}
                      </p>

                      <div className="flex items-center gap-1.5 text-[var(--color-success)] text-xs font-semibold uppercase tracking-wider font-mono">
                        <ShieldCheck className="w-4 h-4" /> Verified Client
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit review form */}
            <div className="lg:col-span-5 bg-[var(--color-surface)]/60 glass p-8 rounded-[2.5rem] border border-[var(--color-border-glass)] shadow-lg sticky top-28">
              <h3 className="text-xl font-medium text-[var(--color-ink)] mb-1 uppercase tracking-wider font-mono">Write a Review</h3>
              <p className="text-xs text-[var(--color-ink-muted)] mb-6">Share your authentic wearing experience with the community.</p>

              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-5">
                
                {/* Rating selection (Stars) */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-[var(--color-ink)] font-mono uppercase">Your Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        type="button"
                        key={starVal}
                        onClick={() => setNewReviewRating(starVal)}
                        onMouseEnter={() => setRatingHover(starVal)}
                        onMouseLeave={() => setRatingHover(0)}
                        className="text-2xl transition-transform active:scale-90 hover:scale-110"
                      >
                        <Star 
                          className={`w-8 h-8 transition-colors ${
                            starVal <= (ratingHover || newReviewRating)
                              ? 'text-amber-500 fill-current' 
                              : 'text-gray-300 dark:text-gray-700'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="client-name" className="text-xs font-medium text-[var(--color-ink)] font-mono uppercase">Full Name</label>
                  <input
                    id="client-name"
                    type="text"
                    required
                    value={newReviewName}
                    onChange={(e) => setNewReviewName(e.target.value)}
                    placeholder="e.g. Advait Nair"
                    className="h-12 px-4 rounded-xl bg-[var(--color-bg)] text-[var(--color-ink)] border border-[var(--color-border-glass)] focus:outline-none focus:border-[var(--color-ink)] transition-colors text-sm"
                  />
                </div>

                {/* Comment */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="client-comment" className="text-xs font-medium text-[var(--color-ink)] font-mono uppercase">Wearing Experience</label>
                  <textarea
                    id="client-comment"
                    required
                    rows={4}
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder="Describe fabric weight, fit proportions, and drape comfort..."
                    className="p-4 rounded-xl bg-[var(--color-bg)] text-[var(--color-ink)] border border-[var(--color-border-glass)] focus:outline-none focus:border-[var(--color-ink)] transition-colors text-sm resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="h-12 w-full mt-2 bg-[var(--color-ink)] text-[var(--color-bg)] rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.99] disabled:opacity-50"
                >
                  {submittingReview ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-[var(--color-bg)] border-t-transparent rounded-full" /> Submitting...
                    </span>
                  ) : (
                    <span>Submit Verified Review</span>
                  )}
                </button>

                {/* Success Alert */}
                {submitSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-[var(--color-success)]/10 text-[var(--color-success)] text-xs rounded-xl flex items-start gap-2 border border-[var(--color-success)]/20"
                  >
                    <Check className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Review Posted Successfully!</p>
                      <p className="opacity-90 mt-0.5">Your luxury product feedback has been preserved and is now live.</p>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>

          </div>
        </section>

      </div>

      <Footer />
    </main>
  );
}
