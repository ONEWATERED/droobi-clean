import './globals.css';
import { Inter } from 'next/font/google';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getEffectiveSettings } from '@/lib/settings';
import { initWebVitals } from '@/lib/web-vitals';
import Link from 'next/link';

// Initialize web vitals on client side
if (typeof window !== 'undefined') {
  initWebVitals();
}
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Droobi',
  description: 'Modular platform hub',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getEffectiveSettings();
  const isAdminMode = process.env.NEXT_PUBLIC_ADMIN_MODE === '1';

  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        {isAdminMode && (
          <div className="bg-red-600 text-white text-center py-2 text-sm">
            Admin Mode Active • 
            <Link href="/admin" className="underline ml-2">
              Admin Dashboard
            </Link>
            <span className="mx-2">•</span>
            <Link href="/admin/app-settings" className="underline">
              App Settings
            </Link>
          </div>
        )}
        <Header brandName={settings.brandName} logoUrl={settings.logoUrl} />
        <main className="flex-1">
          {children}
        </main>
        <Footer 
          brandName={settings.brandName}
          brandTagline={settings.brandTagline}
          footerLinks={settings.footerLinks}
          social={settings.social}
        />
      </body>
    </html>
  );
}