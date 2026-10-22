import type { Metadata } from "next"
import { ReelCut } from "@/components/reel-cut"

export const metadata: Metadata = {
  title: "Reel: your UI has no body",
  robots: { index: false, follow: false },
}

/** The 9:16 reel cut with the reel-edit skill; rendered through launch-kit/reel-edit/engine.html. */
export default function ReelCutPage() {
  return (
    <>
      {/* Frames are a function of t alone, so components' own transitions are off. */}
      <style>{`[data-reel] *, [data-reel] *::before, [data-reel] *::after { transition: none !important; animation: none !important; }
[data-reel] .split-flap-top, [data-reel] .split-flap-bottom { display: none !important; }
[data-reel] .split-flap-fade { display: block !important; }
nextjs-portal { display: none !important; }`}</style>
      <ReelCut />
    </>
  )
}
