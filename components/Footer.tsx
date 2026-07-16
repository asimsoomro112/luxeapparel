export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border-glass)] pt-20 pb-10 px-6 sm:pb-24 bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-2">
          <h2 className="text-3xl font-bold tracking-widest font-display mb-4 text-[var(--color-ink)]">LUXE</h2>
          <p className="text-[var(--color-ink-muted)] max-w-sm">
            Elevating everyday wear with premium materials and signature oversized silhouettes. Designed in Pakistan.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4 text-[var(--color-ink)]">Shop</h3>
          <ul className="space-y-3 text-[var(--color-ink-muted)]">
            <li><a href="#" className="hover:text-[var(--color-ink)] transition-colors">All Products</a></li>
            <li><a href="#" className="hover:text-[var(--color-ink)] transition-colors">New Arrivals</a></li>
            <li><a href="#" className="hover:text-[var(--color-ink)] transition-colors">Tees</a></li>
            <li><a href="#" className="hover:text-[var(--color-ink)] transition-colors">Accessories</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4 text-[var(--color-ink)]">Support</h3>
          <ul className="space-y-3 text-[var(--color-ink-muted)]">
            <li><a href="#" className="hover:text-[var(--color-ink)] transition-colors">FAQ</a></li>
            <li><a href="#" className="hover:text-[var(--color-ink)] transition-colors">Shipping & Returns</a></li>
            <li><a href="#" className="hover:text-[var(--color-ink)] transition-colors">Contact Us</a></li>
            <li><a href="#" className="hover:text-[var(--color-ink)] transition-colors">Track Order</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto border-t border-[var(--color-border-glass)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--color-ink-muted)]">
        <p>&copy; {new Date().getFullYear()} LUXE Apparel. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-[var(--color-ink)] transition-colors">Instagram</a>
          <a href="#" className="hover:text-[var(--color-ink)] transition-colors">TikTok</a>
          <a href="#" className="hover:text-[var(--color-ink)] transition-colors">Twitter</a>
        </div>
      </div>
    </footer>
  );
}
