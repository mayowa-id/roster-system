import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="bg-[#FAFAF9] dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <nav className="flex gap-6">
              <Link 
                href="/" 
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition font-medium"
              >
                Home
              </Link>
              <Link 
                href="/admin" 
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition font-medium"
              >
                Admin
              </Link>
              <Link 
                href="/user" 
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition font-medium"
              >
                User
              </Link>
            </nav>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}