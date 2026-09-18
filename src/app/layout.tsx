import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Every page renders per-request. Prerendered pages get Cache-Control
// s-maxage=1y from self-hosted Next (which config headers CANNOT override),
// and the Vercel proxy in front cached one user's HTML for everyone.
export const dynamic = 'force-dynamic'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'DWNLD Workshop',
  description: 'Brand discovery and marketing workshop by Download Media',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} style={{ colorScheme: 'light' }}>
      <body className="min-h-full custom-scrollbar" style={{ fontFamily: "'Helvetica Neue', 'Helvetica', 'Inter', Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
