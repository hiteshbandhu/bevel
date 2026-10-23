// Renders the components reel (apps/web/app/reel) to mp4, frame by frame,
// the motion2code way (github.com/lovisdotio/motion2code, render_anim.py and
// check_anim.py): open the page with ?external=1, wait for data-ready, then for
// each frame seek(t), wait two animation frames, screenshot, and pipe the PNG
// straight into ffmpeg, so no frames pile up on disk. Needs the site running.
//
//   node scripts/render-reel.mts                         16:9 → launch-kit/reel.mp4
//   node scripts/render-reel.mts --shape vertical        9:16 → launch-kit/reel-vertical.mp4
//   node scripts/render-reel.mts --cut                   the reel-edit cut → launch-kit/reel-cut-video.mp4 (no audio; mix separately)
//   node scripts/render-reel.mts --cut --shape 45        the same cut at 4:5 for the X feed
//   node scripts/render-reel.mts --check                 loop seam + determinism only
//   node scripts/render-reel.mts --png 1.6 5.4 17        stills into launch-kit/reel-frames/
//
// Options: --url (default http://localhost:3000), --fps (default 30), --out.
import { spawn } from "node:child_process"
import { mkdir, writeFile } from "node:fs/promises"
import { createRequire } from "node:module"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
// Playwright comes with the Storybook tests; reuse it rather than install another.
const { chromium } = createRequire(path.join(root, "apps/storybook/package.json"))("playwright") as typeof import("playwright")

const argv = process.argv.slice(2)
const opt = (name: string, fallback: string) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1]! : fallback
}
const cut = argv.includes("--cut")
const feed = cut && opt("shape", "") === "45"
const vertical = cut || opt("shape", "landscape") === "vertical"
const fps = Number(opt("fps", "30"))
const base = opt("url", "http://localhost:3000")
const size = feed ? { width: 1080, height: 1350 } : vertical ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 }
const kit = path.join(root, "launch-kit")
const out = opt("out", path.join(kit, cut ? (feed ? "reel-cut-45-video.mp4" : "reel-cut-video.mp4") : vertical ? "reel-vertical.mp4" : "reel.mp4"))
await mkdir(kit, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 })
const errors: string[] = []
page.on("pageerror", (e) => errors.push(String(e)))
page.on("console", (m) => m.type() === "error" && !m.text().includes("_next/webpack-hmr") && errors.push(m.text()))
await page.goto(`${base}/reel${cut ? "/cut" : ""}?external=1${vertical && !cut ? "&shape=vertical" : ""}${feed ? "&shape=45" : ""}`, { waitUntil: "load" })
await page.waitForFunction(() => document.documentElement.dataset.ready === "1", null, { timeout: 60_000 })
const duration = await page.evaluate(() => (window as unknown as { anim: { duration: number } }).anim.duration)

async function shot(t: number) {
  await page.evaluate((time) => (window as unknown as { anim: { seek(t: number): void } }).anim.seek(time), t)
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
  return page.screenshot({ type: "png" })
}

/** Mean absolute difference of two screenshots, 0..255, compared through the browser's own decoder. */
async function diff(a: Buffer, b: Buffer) {
  return page.evaluate(
    async ([x, y]) => {
      const load = async (b64: string) => createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob())
      const [ia, ib] = await Promise.all([load(x), load(y)])
      const c = new OffscreenCanvas(ia.width / 4, ia.height / 4).getContext("2d")!
      const px = (img: ImageBitmap) => {
        c.drawImage(img, 0, 0, ia.width / 4, ia.height / 4)
        return c.getImageData(0, 0, ia.width / 4, ia.height / 4).data
      }
      const pa = px(ia)
      const pb = px(ib)
      let sum = 0
      for (let i = 0; i < pa.length; i += 4) sum += Math.abs(pa[i]! - pb[i]!) + Math.abs(pa[i + 1]! - pb[i + 1]!) + Math.abs(pa[i + 2]! - pb[i + 2]!)
      return sum / ((pa.length / 4) * 3)
    },
    [a.toString("base64"), b.toString("base64")]
  )
}

const pngAt = argv.indexOf("--png")
if (pngAt >= 0) {
  const dir = path.join(kit, "reel-frames")
  await mkdir(dir, { recursive: true })
  for (const t of argv.slice(pngAt + 1).filter((a) => !a.startsWith("--")).map(Number)) {
    const file = path.join(dir, `${feed ? "f" : cut ? "c" : vertical ? "v" : "h"}-t${t.toFixed(2)}.png`)
    await writeFile(file, await shot(t))
    console.log(path.relative(root, file))
  }
} else if (argv.includes("--check")) {
  // check_anim.py's runtime checks: the loop seam, and that seek(t) is a pure function of t.
  const seam = await diff(await shot(0), await shot(duration))
  const mid = duration * 0.37
  const repeat = await diff(await shot(mid), (await shot(mid / 2), await shot(mid)))
  const step = await diff(await shot(duration - 1 / fps), await shot(0))
  console.log(`loop seam frame(0) vs frame(${duration}): ${seam.toFixed(3)} (want 0)`)
  console.log(`last step frame(${(duration - 1 / fps).toFixed(3)}) vs frame(0): ${step.toFixed(3)} (want small)`)
  console.log(`determinism seek(${mid.toFixed(2)}) twice: ${repeat.toFixed(3)} (want 0)`)
} else {
  const n = Math.round(duration * fps)
  const ffmpeg = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(fps), "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out], { stdio: ["pipe", "inherit", "inherit"] })
  for (let i = 0; i < n; i++) {
    const png = await shot(i / fps)
    if (!ffmpeg.stdin.write(png)) await new Promise((r) => ffmpeg.stdin.once("drain", r))
    if (i % Math.max(1, Math.floor(n / 10)) === 0) console.log(`  frame ${i}/${n}  t=${(i / fps).toFixed(2)}`)
  }
  ffmpeg.stdin.end()
  const code = await new Promise((r) => ffmpeg.on("close", r))
  if (code !== 0) throw new Error(`ffmpeg exited ${code}`)
  console.log(`${n} frames (${duration} s @ ${fps} fps, ${size.width}x${size.height}) -> ${path.relative(root, out)}`)
}
if (errors.length) console.log(`console errors:\n  ${errors.slice(0, 10).join("\n  ")}`)
await browser.close()
