import type { Metadata } from "next"
import { Fraunces, Inter, Noto_Sans_Tamil } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { LangProvider } from "@/hooks/use-lang"
import { ErrorBoundary } from "@/components/error-boundary"
import { SkipNavLink } from "@/components/skip-nav"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
})

const notoTamil = Noto_Sans_Tamil({
  subsets: ["tamil", "latin"],
  variable: "--font-noto-tamil",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Maratha — Tamil Matrimony & Astrology Compatibility",
  description:
    "Maratha pairs Tamil tradition with modern matchmaking. Explore Kodu charts, Navamsa and the ten Poruthams to find a marriage aligned in stars and values.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ta"
      className={`${inter.variable} ${fraunces.variable} ${notoTamil.variable} bg-background`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <SkipNavLink />
        <AuthProvider>
          <LangProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </LangProvider>
        </AuthProvider>
        <div aria-live="polite" aria-atomic="true">
          <Toaster
            position="top-right"
            toastOptions={{
              classNames: {
                toast: "font-sans text-sm rounded-xl border border-border shadow-lg",
                title: "font-medium text-foreground",
                description: "text-muted-foreground",
              },
            }}
          />
        </div>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
