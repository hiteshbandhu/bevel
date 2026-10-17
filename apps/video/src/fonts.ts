import { loadFont as loadSans } from "@remotion/google-fonts/SchibstedGrotesk"
import { loadFont as loadMono } from "@remotion/google-fonts/GeistMono"

export const sans = loadSans("normal", { weights: ["400", "500", "700", "800"], subsets: ["latin"] }).fontFamily
export const mono = loadMono("normal", { weights: ["400", "500"], subsets: ["latin"] }).fontFamily
