import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'DWNLD Workshop',
  description: 'Brand discovery and marketing workshop by Download Media',
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
