import ClerkSafeProvider from '@/components/auth/ClerkSafeProvider'
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from '@/components/ErrorBoundary'
import '@/styles/globals.css'

const playfair = Playfair_Display({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

const mono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
})

export const metadata = {
  title: 'EcoSphere — Atmospheric Field Dispatch & Planetary Observatory',
  description: 'A human-centered environmental observatory tracking Delhi NCR air quality, CPCB station telemetry, and diurnal atmospheric dispersion.',
  other: {
    'darkreader-lock': '',
  },
}

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({ children }) {
  return (
    <ClerkSafeProvider publishableKey={clerkKey}>
      <html 
        lang="en" 
        className={`${playfair.variable} ${inter.variable} ${mono.variable}`}
        suppressHydrationWarning
      >
        <head>
          <meta name="darkreader-lock" content="" />
        </head>
        <body 
          className="antialiased bg-[#0e110f] text-[#f5f2ea] selection:bg-[#d49a50] selection:text-[#0e110f] overflow-x-hidden min-h-screen"
          suppressHydrationWarning
        >
          <ErrorBoundary>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#151916',
                  color: '#f5f2ea',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  fontFamily: 'var(--font-sans)',
                },
              }}
            />
          </ErrorBoundary>
        </body>
      </html>
    </ClerkSafeProvider>
  )
}
