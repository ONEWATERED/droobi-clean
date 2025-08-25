import Link from 'next/link';
import Image from 'next/image';
import { Building2 } from 'lucide-react';

interface HeaderProps {
  brandName: string;
  logoUrl?: string;
}

export function Header({ brandName, logoUrl }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            {logoUrl ? (
              <div className="relative w-8 h-8">
                <Image
                  src={logoUrl}
                  alt={`${brandName} logo`}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <Building2 className="h-8 w-8 text-primary" />
            )}
            <span className="text-xl font-bold text-gray-900">{brandName}</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/health" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Health
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}