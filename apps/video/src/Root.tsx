import { Composition } from "remotion"
import { Launch, launchLength } from "./Launch"

export function Root() {
  return (
    <Composition id="launch" component={Launch} durationInFrames={launchLength} fps={30} width={1920} height={1080} />
  )
}
