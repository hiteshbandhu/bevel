import { llmsFull, textResponse } from "@/lib/llms"

export const dynamic = "force-static"

export async function GET() {
  return textResponse(await llmsFull())
}
