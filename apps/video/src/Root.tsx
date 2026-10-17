import { Composition } from "remotion"
import { Film, filmLength } from "./film/Film"

export function Root() {
  return <Composition id="launch" component={Film} durationInFrames={filmLength} fps={30} width={1920} height={1080} />
}
