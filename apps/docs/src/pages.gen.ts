// deno-fmt-ignore-file
// biome-ignore format: generated types do not need formatting
// prettier-ignore
import type { PathsForPages } from 'waku/router'

// prettier-ignore
type Page =
  | { path: '/changelog'; render: 'static' }
  | { path: '/commands/commit'; render: 'static' }
  | { path: '/commands/peak'; render: 'static' }
  | { path: '/commands/push'; render: 'static' }
  | { path: '/commands/reset'; render: 'static' }
  | { path: '/commands/switch'; render: 'static' }
  | { path: '/commands/update'; render: 'static' }
  | { path: '/'; render: 'static' }
  | { path: '/introduction/getting-started'; render: 'static' }
  | { path: '/introduction/setup-wizard'; render: 'static' }
  | { path: '/introduction/what-is-pushai'; render: 'static' }
  | { path: '/providers/byok'; render: 'static' }
  | { path: '/providers/cloud'; render: 'static' }
  | { path: '/providers/ollama'; render: 'static' }
  | { path: '/reference/cli'; render: 'static' }
  | { path: '/reference/config'; render: 'static' }

// prettier-ignore
declare module 'waku/router' {
  interface RouteConfig {
    paths: PathsForPages<Page>
  }
  interface CreatePagesConfig {
    pages: Page
  }
}
