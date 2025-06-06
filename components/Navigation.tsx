import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="p-4 bg-gray-800 text-white">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          Lineup POC
        </Link>
        <div>
          <Link href="/lineup" className="hover:underline">
            Lineup
          </Link>
        </div>
      </div>
    </nav>
  );
} 