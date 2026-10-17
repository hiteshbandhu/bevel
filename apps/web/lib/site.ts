/** Where the docs site and its registry are served. Set NEXT_PUBLIC_SITE_URL in production. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")

/** The registry namespace users add to components.json. */
export const registryNamespace = "@bevel"
export const registryUrl = `${siteUrl}/r/{name}.json`
