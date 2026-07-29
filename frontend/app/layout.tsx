import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { CartProvider } from '@/lib/cart-context';
import { WishlistProvider } from '@/lib/wishlist-context';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LiveChatWidget from '@/components/LiveChatWidget';
import ReferralCapture from '@/lib/referral';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.purnotashaj.shop'),
  title: 'Purnota Shaj',
  description: 'Clothing, jewellery, ornaments and makeup — curated for you.',
  openGraph: {
    siteName: 'Purnota Shaj',
    type: 'website',
    title: 'Purnota Shaj',
    description: 'Clothing, jewellery, ornaments and makeup — curated for you.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Playfair+Display:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ReferralCapture />
              <Navbar />
              <main className="min-h-screen">{children}</main>
              <Footer />
              <LiveChatWidget />
              <Toaster position="top-center" />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
