import type { Metadata } from "next"
import { GoogleAnalytics } from "@next/third-parties/google"
import { Geist_Mono, Schibsted_Grotesk } from "next/font/google"

import "@workspace/ui/globals.css"
import "./site.css"
import { SiteHeader } from "@/components/site-header"
import { ThemeProvider } from "@/components/theme-provider"
import { gaId } from "@/lib/analytics"
import { getStars } from "@/lib/github"
import { preview } from "@/lib/og"
import { buildSearchIndex } from "@/lib/search"
import { siteUrl } from "@/lib/site"
import { cn } from "@workspace/ui/lib/utils"

const fontSans = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

const description =
  "Open-source skeuomorphic React components: switches, meters and dials modelled on real patents. Base UI and Tailwind CSS v4, installed with the shadcn CLI."

export const metadata: Metadata = {
  title: { default: "Bevel: skeuomorphic React components for shadcn", template: "%s – Bevel" },
  description,
  keywords: ["skeuomorphic", "skeuomorphism", "skeuomorphic UI", "tactile UI", "React components", "shadcn", "shadcn registry", "Base UI", "Tailwind CSS"],
  metadataBase: new URL(siteUrl),
  // Google Search Console ownership, for the bevel-ui.vercel.app URL-prefix property.
  verification: { google: "tHC5OjbEzdhx3yrrFrsZDp58-5WrcdOA-D8SJw1W0DQ" },
  ...preview({ title: "Bevel: skeuomorphic React components", description, image: "bevel.jpg", path: "/" }),
}

export default async function RootLayout({
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
          <SiteHeader searchIndex={buildSearchIndex()} stars={await getStars()} />
          {children}
        </ThemeProvider>
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  )
}
