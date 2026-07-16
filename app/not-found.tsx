import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[var(--color-bg)]">
      <h2 className="text-4xl font-display font-bold mb-4 text-[var(--color-ink)]">404 - Page Not Found</h2>
      <p className="text-[var(--color-ink-muted)] mb-8">Could not find requested resource</p>
      <Link 
        href="/"
        className="px-6 py-3 bg-[var(--color-ink)] text-[var(--color-bg)] rounded-full font-medium hover:opacity-90 transition-opacity"
      >
        Return Home
      </Link>
    </div>
  );
}
