import './globals.css'
import type { Metadata } from 'next'
import { Navbar } from '@/components/Navbar'
import { Toast } from '@/components/Toast'
import { Providers } from '@/components/Providers'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'POLYVERSE — Creator Storefront',
  description: 'Decentralized creator economy platform powered by blockchain technology',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/favicon-32x32.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="16x16 32x32" type="image/x-icon" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon-32x32.png" />
      </head>
      <body>
        {/* Suppress Coinbase Wallet analytics errors */}
        <Script id="error-suppression" strategy="beforeInteractive">
          {`
            // More aggressive Coinbase analytics suppression
            const originalConsoleError = console.error;
            console.error = (...args) => {
              const message = args.join(' ');
              
              // Suppress all Coinbase analytics/telemetry errors
              if (
                message.includes('cca-lite.coinbase.com') ||
                message.includes('metrics') ||
                message.includes('analyticsTracker') ||
                message.includes('initCCA') ||
                message.includes('401 (Unauthorized)') ||
                message.includes('net::ERR_ABORTED')
              ) {
                return; // Suppress these errors completely
              }
              
              originalConsoleError.apply(console, args);
            };

            // Suppress all promise rejections related to analytics
            window.addEventListener('unhandledrejection', (event) => {
              const reason = event.reason;
              const message = reason?.message || reason || '';
              
              if (
                message.includes('cca-lite.coinbase.com') ||
                message.includes('analytics') ||
                message.includes('telemetry') ||
                message.includes('metrics') ||
                message.includes('401') ||
                message.includes('ERR_ABORTED')
              ) {
                event.preventDefault();
                return;
              }
            });

            // Override fetch to suppress analytics requests silently
            const originalFetch = window.fetch;
            window.fetch = (...args) => {
              const url = args[0];
              
              // Suppress Coinbase analytics requests completely
              if (typeof url === 'string' && url.includes('cca-lite.coinbase.com')) {
                return Promise.resolve(new Response('{}', { status: 200 }));
              }
              
              // Debug API calls for our application
              if (typeof url === 'string' && url.includes('/api/subscriptions/purchase')) {
                console.log('API Call Debug:', {
                  url: url,
                  fullUrl: new URL(url, window.location.origin).href,
                  origin: window.location.origin
                });
              }
              
              return originalFetch.apply(window, args);
            };
          `}
        </Script>
        
        <Providers>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Toast />
        </Providers>
      </body>
    </html>
  )
}