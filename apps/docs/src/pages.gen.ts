// deno-fmt-ignore-file
// biome-ignore format: generated types do not need formatting
// prettier-ignore
import type { PathsForPages } from 'waku/router'

// prettier-ignore
type Page =
  | { path: '/guides/commands/commit'; render: 'static' }
  | { path: '/guides/commands/peek'; render: 'static' }
  | { path: '/guides/commands/push'; render: 'static' }
  | { path: '/guides/commands/reset'; render: 'static' }
  | { path: '/guides/commands/switch'; render: 'static' }
  | { path: '/guides/commands/update'; render: 'static' }
  | { path: '/guides/how-it-works'; render: 'static' }
  | { path: '/guides/providers/byok'; render: 'static' }
  | { path: '/guides/providers/cloud'; render: 'static' }
  | { path: '/guides/providers/ollama'; render: 'static' }
  | { path: '/'; render: 'static' }
  | { path: '/introduction/getting-started'; render: 'static' }
  | { path: '/introduction/setup-wizard'; render: 'static' }
  | { path: '/introduction/what-is-pushai'; render: 'static' }
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
