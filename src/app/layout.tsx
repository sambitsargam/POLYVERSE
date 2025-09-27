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
            // Suppress console errors for Coinbase analytics endpoints
            const originalConsoleError = console.error;
            console.error = (...args) => {
              const message = args.join(' ');
              
              // Suppress Coinbase analytics/telemetry errors
              if (
                message.includes('cca-lite.coinbase.com/metrics') ||
                message.includes('net::ERR_ABORTED 502') ||
                message.includes('net::ERR_ABORTED 401') ||
                message.includes('analyticsTracker') ||
                message.includes('initCCA')
              ) {
                return; // Suppress these non-critical errors
              }
              
              originalConsoleError.apply(console, args);
            };

            // Suppress unhandled promise rejections for analytics
            window.addEventListener('unhandledrejection', (event) => {
              const reason = event.reason;
              
              if (
                reason?.message?.includes('cca-lite.coinbase.com') ||
                reason?.message?.includes('analytics') ||
                reason?.message?.includes('telemetry')
              ) {
                event.preventDefault();
                return;
              }
            });
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