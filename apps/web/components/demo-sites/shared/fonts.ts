import { Barlow_Condensed, Libre_Caslon_Text, Overpass, Source_Serif_4 } from "next/font/google"

/** Each demo product has its own type voice, drawn from its world. */

/** Relay: console legends, the condensed grotesk of control-room engraving. */
export const consoleFace = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-console" })

/** Meterline: a ledger serif, for a desk where money is written down. */
export const ledgerFace = Libre_Caslon_Text({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-ledger" })

/** Shipyard: highway-sign lettering, for a board read from across a room. */
export const signFace = Overpass({ subsets: ["latin"], weight: ["400", "600", "800"], variable: "--font-sign" })

/** Casefile: a document serif, for papers on a desk. */
export const documentFace = Source_Serif_4({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-document" })
