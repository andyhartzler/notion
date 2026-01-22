import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Together KC',
  description: 'Together KC Campaign Hub',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
