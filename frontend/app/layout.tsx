import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { CartProvider } from '@/lib/cart-context';
import { WishlistProvider } from '@/lib/wishlist-context';
import { CurrencyProvider } from '@/lib/currency-context';
import { ComboProvider } from '@/lib/combo-context';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LiveChatWidget from '@/components/LiveChatWidget';
import ReferralCapture from '@/lib/referral';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#5C1010',
};

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
        {/* the font FILES come from this second host — connecting early shaves time off first paint */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Playfair+Display:wght@500;700&display=swap"
          rel="stylesheet"
        />

        {/* Google tag (gtag.js) */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-P141FZ55T8" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-P141FZ55T8');
          `}
        </Script>
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CurrencyProvider>
                <ComboProvider>
                  <ReferralCapture />
                  <Navbar />
                  <main className="min-h-screen">{children}</main>
                  <Footer />
                  <LiveChatWidget />
                  <Toaster position="top-center" />
                </ComboProvider>
              </CurrencyProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
