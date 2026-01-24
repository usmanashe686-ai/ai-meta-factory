import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SimpleBuilderProvider } from '@/contexts/SimpleBuilderContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Meta Factory AI Builder',
  description: 'Build apps with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SimpleBuilderProvider>
          {children}
        </SimpleBuilderProvider>
      </body>
    </html>
  )
}
