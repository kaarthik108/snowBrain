import { Metadata } from 'next'

import { Toaster } from 'react-hot-toast'

import '@/app/globals.css'
import { Header } from '@/components/header'
import { Providers } from '@/components/providers'
import { fontMono, fontSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { ClerkProvider } from "@clerk/nextjs"

export const metadata: Metadata = {
  title: {
    default: 'snowBrain',
    template: `%s - AI Driven snowflake data insights`
  },
  description: 'An AI Driven snowflake data insights',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ],
  metadataBase: new URL('https://snowbrain-git-prod-kaarthik108.vercel.app/')
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <ClerkProvider>
        <body
          className={cn(
            'font-sans antialiased',
            fontSans.variable,
            fontMono.variable
          )}
        >
          <Toaster />
          <Providers attribute="class" defaultTheme="system" enableSystem>
            <div className="flex min-h-screen flex-col">
              {/* @ts-ignore */}
              <Header />
              <main className="flex flex-1 flex-col bg-muted/50">{children}</main>
            </div>
          </Providers>
        </body>
      </ClerkProvider>
    </html>
  )
}
