import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'QuantATS',
  description: 'Applicant Tracking System for Quant & Crypto Recruiting',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
