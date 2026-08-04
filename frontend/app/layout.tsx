import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { CartProvider } from '@/lib/cart-context';
import { WishlistProvider } from '@/lib/wishlist-context';
import { CurrencyProvider } from '@/lib/currency-context';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LiveChatWidget from '@/components/LiveChatWidget';
import ReferralCapture from '@/lib/referral';

export const metadata: Metadata = {
  metadataBase: new URL("https://www.purnotashaj.shop"),

  title: {
    default: "Purnota Shaj | Premium Cotton Sarees, Nighties & Women's Fashion",
    template: "%s | Purnota Shaj",
  },

  description:
    "Shop premium pure cotton sarees, batik sarees, Bengali ethnic wear, cotton nighties, kurtis, jewellery, makeup and women's fashion online. Quality fabrics, affordable prices & delivery across India.",

  keywords: [
    "Purnota Shaj",
    "cotton saree",
    "pure cotton saree",
    "batik saree",
    "Bengali saree",
    "hand block print saree",
    "cotton nighty",
    "women's ethnic wear",
    "kurti",
    "women's clothing",
    "fashion boutique",
    "jewellery",
    "makeup",
    "online shopping India",
  ],

  authors: [{ name: "Purnota Shaj" }],
  creator: "Purnota Shaj",
  publisher: "Purnota Shaj",

  alternates: {
    canonical: "https://www.purnotashaj.shop",
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.purnotashaj.shop",
    siteName: "Purnota Shaj",
    title: "Purnota Shaj | Premium Cotton Sarees & Women's Fashion",
    description:
      "Discover premium cotton sarees, batik sarees, cotton nighties, jewellery and women's fashion at affordable prices with delivery across India.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Purnota Shaj",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Purnota Shaj | Premium Cotton Sarees & Women's Fashion",
    description:
      "Shop premium cotton sarees, batik sarees, nighties, jewellery and women's fashion online.",
    images: ["/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  category: "shopping",
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
                <ReferralCapture />
                <Navbar />
                <main className="min-h-screen">{children}</main>
                <Footer />
                <LiveChatWidget />
                <Toaster position="top-center" />
              </CurrencyProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
