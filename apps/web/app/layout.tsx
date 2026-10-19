import type { Metadata } from "next"
import { GoogleAnalytics } from "@next/third-parties/google"
import { Geist_Mono, Schibsted_Grotesk } from "next/font/google"

import "@workspace/ui/globals.css"
import "./site.css"
import { SiteHeader } from "@/components/site-header"
import { ThemeProvider } from "@/components/theme-provider"
import { gaId } from "@/lib/analytics"
import { cn } from "@workspace/ui/lib/utils"

const fontSans = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: { default: "Bevel", template: "%s – Bevel" },
  description: "Tactile, composable React components on Base UI and Tailwind. Copy them in and own them.",
  twitter: { card: "summary_large_image", creator: "@_hiteshbandhu" },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontSans.variable, fontMono.variable, "font-sans")}
    >
      <body className="min-h-svh">
        <ThemeProvider>
          <SiteHeader />
          {children}
        </ThemeProvider>
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  )
}
