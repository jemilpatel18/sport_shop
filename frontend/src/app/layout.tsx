import type { Metadata } from 'next';
import { Inter, Oswald } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Toaster from '@/components/Toaster';
import StoreInitializer from '@/components/StoreInitializer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald', weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: {
    default: 'SPORTZONE — Everything for Every Athlete',
    template: '%s | SPORTZONE',
  },
  description: 'Premium sports equipment, footwear, clothing and accessories for every athlete.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable}`}>
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <AnnouncementBar />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <StoreInitializer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
