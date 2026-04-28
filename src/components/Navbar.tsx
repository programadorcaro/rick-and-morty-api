import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black text-rm-green hover:text-rm-blue transition-colors">
          RICK & MORTY
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-rm-green transition-colors">Characters</Link>
          <a 
            href="https://rickandmortyapi.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium hover:text-green-500 transition-colors"
          >
            API Docs
          </a>
        </nav>
      </div>
    </header>
  );
}
