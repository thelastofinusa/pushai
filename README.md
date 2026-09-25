## pushai

Monorepo for **pushai** — an AI-powered Git commit assistant. Run `pai commit` in
any repo to get a generated commit message, a conflict check, and an optional
push, without leaving your terminal.

### Packages

| Package                                | Description                                              |
| --------------------------------------- | ---------------------------------------------------------- |
| [`packages/cli`](./packages/cli)       | The `pai` CLI binary — published to npm as `pushai`.       |
| [`packages/core`](./packages/core)     | Git operations, AI providers, and local config storage.    |
| [`packages/types`](./packages/types)   | Shared TypeScript types.                                    |
| [`packages/utils`](./packages/utils)   | Shared terminal/output/runtime helpers.                     |
| [`packages/tsconfig`](./packages/tsconfig) | Shared base `tsconfig.json` (internal only, not published). |

### Requirements

- [Bun](https://bun.sh) `^1.3.13`

### Getting started

```bash
bun install
bun run dev:cli   # run the CLI from source
bun run build     # build all packages
```

### Scripts

| Script          | Description                                  |
| --------------- | --------------------------------------------- |
| `build`         | Build every package via Turborepo.            |
| `build:watch`   | Build every package in watch mode.            |
| `dev`           | Run every package's `dev` script.             |
| `dev:cli`       | Run the CLI directly from source with Bun.    |
| `lint`          | Lint every package with Biome.                |
| `check`         | Lint + format-write with Biome.               |
| `format`        | Format the repo with Biome.                   |
| `clean`         | Remove build artifacts and reinstall.         |

### License

This project is licensed under the [MIT License](https://github.com/thelastofinusa/pushai-monorepo/blob/main/LICENSE).