import { Composition, Still } from "remotion"
import { Film, filmLength } from "./film/Film"
import { Framed } from "./film/Framed"
import { Logo, LogoSheet } from "./og/Logo"
import { OgComponent, OgDemo, OgPost, OgSite } from "./og/Og"

export function Root() {
  return (
    <>
      <Composition id="launch" component={Film} durationInFrames={filmLength} fps={30} width={1920} height={1080} />
      <Composition id="launch-vertical" component={Framed} durationInFrames={filmLength} fps={30} width={1080} height={1920} defaultProps={{ shape: "vertical" as const }} />
      <Composition id="launch-square" component={Framed} durationInFrames={filmLength} fps={30} width={1080} height={1080} defaultProps={{ shape: "square" as const }} />
      <Still id="logo" component={Logo} width={1024} height={1024} defaultProps={{ variant: "lamp" as const, padded: true }} />
      <Still id="logo-sheet" component={LogoSheet} width={2000} height={712} />
      <Still id="og-site" component={OgSite} width={1200} height={630} />
      <Still id="social-preview" component={OgSite} width={1280} height={640} defaultProps={{ social: true }} />
      <Still id="og-component" component={OgComponent} width={1200} height={630} defaultProps={{ slug: "annunciator" }} />
      <Still id="og-post" component={OgPost} width={1200} height={630} defaultProps={{ slug: "skeuomorphism-is-back" }} />
      <Still id="og-demo" component={OgDemo} width={1200} height={630} defaultProps={{ n: 1 }} />
    </>
  )
}
