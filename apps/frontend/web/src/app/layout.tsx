import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Droobi Clean',
  description: 'Modular platform hub',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdminMode = process.env.NEXT_PUBLIC_ADMIN_MODE === '1';

  return (
    <html lang="en">
      <body className={inter.className}>
        {isAdminMode && (
          <div className="bg-red-600 text-white text-center py-2 text-sm">
            Admin Mode Active • 
            <Link href="/admin" className="underline ml-2">
              Admin Dashboard
            </Link>
          </div>
        )}
        {children}
      </body>
    </html>
  );
}