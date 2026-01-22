import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '../contexts/LanguageContext'
import { ColorSchemeProvider } from '../contexts/ColorSchemeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Overlanding Maps',
  description: 'Interactive maps showing overlanding difficulty and border status information for travelers',
  keywords: 'overlanding, travel, maps, borders, countries, adventure travel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <ColorSchemeProvider>
            {children}
          </ColorSchemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}