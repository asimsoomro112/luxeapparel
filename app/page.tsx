import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="min-h-screen selection:bg-black selection:text-white pb-20 sm:pb-0">
      <Navbar />
      <Hero />
      <ProductGrid />
      <Footer />
      <CartDrawer />
    </main>
  );
}
