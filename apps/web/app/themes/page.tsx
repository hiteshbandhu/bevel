import type { Metadata } from "next"
import Link from "next/link"
import { AnnunciatorAgent } from "@/components/demos/annunciator-agent"
import { BreakerCaps } from "@/components/demos/breaker-caps"
import { GuardedSwitchDeploy } from "@/components/demos/guarded-switch-deploy"
import { MeterLiveUsage } from "@/components/demos/meter-live-usage"
import { MotorizedFaderTemperature } from "@/components/demos/motorized-fader-temperature"
import { SplitFlapDeploys } from "@/components/demos/split-flap-deploys"
import { linkClass } from "@/components/prose"
import { ThemePlayground } from "@/components/theme-playground"
import { preview } from "@/lib/og"
import { readThemePresets } from "@/lib/themes"

const description = "Brass, bakelite or anodized aluminium: pick a material, tune its light and shape, and copy the CSS."

export const metadata: Metadata = {
  title: "Themes",
  description,
  ...preview({ title: "Material themes – Bevel", description, image: "bevel.jpg", path: "/themes" }),
}

const stage = [AnnunciatorAgent, GuardedSwitchDeploy, MeterLiveUsage, BreakerCaps, SplitFlapDeploys, MotorizedFaderTemperature]

export default async function Themes() {
  const presets = await readThemePresets()
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-4xl font-bold tracking-tight">Material themes</h1>
      <p className="mt-3 max-w-prose text-lg text-muted-foreground">
        {description} Every component reads the same few tokens, so one theme changes them all. See{" "}
        <Link href="/docs/theming" className={linkClass}>
          Theming
        </Link>{" "}
        for how it works.
      </p>
      <div className="mt-10">
        <ThemePlayground presets={presets}>
          {stage.map((Demo, i) => (
            <div key={i} className="tray flex items-center justify-center overflow-x-auto rounded-(--bevel-radius-xl) px-4 py-8">
              <Demo />
            </div>
          ))}
        </ThemePlayground>
      </div>
    </main>
  )
}
