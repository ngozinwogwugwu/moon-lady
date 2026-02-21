import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Moon Lady',
  description: 'A voice memo becomes a tarot reading.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Moon Lady',
  },
}

export const viewport: Viewport = {
  themeColor: '#F7F3EE',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-dvh max-w-[480px] mx-auto px-6">
          {children}
        </div>
      </body>
    </html>
  )
}
