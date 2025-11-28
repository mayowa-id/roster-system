import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Roster System
          </Link>
          <nav className="flex gap-6">
            <Link href="/" className="hover:text-blue-200 transition">
              Home
            </Link>
            <Link href="/admin" className="hover:text-blue-200 transition">
              Admin
            </Link>
            <Link href="/user" className="hover:text-blue-200 transition">
              User
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}