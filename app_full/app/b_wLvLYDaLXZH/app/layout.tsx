import type { Metadata, Viewport } from "next"
import { Poppins, Noto_Serif_Tamil } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

const notoSerifTamil = Noto_Serif_Tamil({
  subsets: ["tamil", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-tamil",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Mathat Community — Tamil Cultural News & Events",
  description:
    "Latest news, events and announcements from the Mathat Tamil community. Culture, learning, matrimony and announcements in one elegant home.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#6D211B",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${notoSerifTamil.variable} bg-bg-page`}>
      <body className="font-sans antialiased bg-bg-page text-text-primary">
        {children}
        <Toaster
          position="bottom-right"
          theme="light"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              color: "#2A2420",
              border: "1px solid #EAE4DB",
              fontFamily: "var(--font-poppins)",
              borderRadius: "12px",
              boxShadow: "0 10px 30px -12px rgba(109, 33, 27, 0.18)",
            },
          }}
        />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
