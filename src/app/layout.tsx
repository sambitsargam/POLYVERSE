import './globals.css'
import type { Metadata } from 'next'
import { Navbar } from '@/components/Navbar'
import { Toast } from '@/components/Toast'

export const metadata: Metadata = {
  title: 'POLYVERSE — Creator Storefront',
  description: 'Decentralized creator economy platform powered by blockchain technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Toast />
      </body>
    </html>
  )
}