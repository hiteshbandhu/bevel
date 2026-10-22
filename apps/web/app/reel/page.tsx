import type { Metadata } from "next"
import { Reel } from "@/components/reel"

export const metadata: Metadata = {
  title: "Reel",
  robots: { index: false, follow: false },
}

/**
 * The components reel: a motion2code-style page (one GSAP clock, window.anim)
 * rendered to video by scripts/render-reel.mts. Not linked from the site.
 */
export default async function ReelPage({ searchParams }: { searchParams: Promise<{ shape?: string }> }) {
  const { shape } = await searchParams
  return (
    <>
      {/* The timeline is the only clock: components' own transitions would play in real time between frames. */}
      <style>{`[data-reel] *, [data-reel] *::before, [data-reel] *::after { transition: none !important; animation: none !important; }
[data-reel] .split-flap-top, [data-reel] .split-flap-bottom { display: none !important; }
[data-reel] .split-flap-fade { display: block !important; }
/* The dev-mode badge would land in every frame. */
nextjs-portal { display: none !important; }`}</style>
      <Reel vertical={shape === "vertical"} />
    </>
  )
}
