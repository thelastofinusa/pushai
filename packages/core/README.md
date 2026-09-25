## @pushai/core

Internal package. Provides the non-terminal logic the `pushai` CLI is built
on: git operations, AI provider clients, and local config/credential storage.
Not intended for standalone use outside the pushai monorepo.

### What's in here

- **`createGitService(cwd?)`** — thin wrapper over [`simple-git`]. Checks
  whether a directory is a repo, initializes one, reads the current branch
  and change/conflict status, produces a staged diff, and stages/commits/pushes.
- **`createConfigStore({ serviceName })`** — reads and writes
  `~/.config/<name>/config.json`. API keys go through the OS keychain via
  `keytar`, falling back to a permission-locked local file if the keychain
  isn't available on the current platform.
- **`providers`** — one `AIProvider` per BYOK service (`anthropic`, `openai`,
  `gemini`), each implementing `getModels()` and `generateCommitMessage()`
  against that provider's HTTP API.
- **`ollamaProvider()` / `generateCommitMessageLocal()`** — detects a local
  Ollama install, starts it if it's not running, lists installed models, and
  generates a commit message locally.
- **`generateCommitMessage(config, diff)`** — the single entry point the CLI
  calls; it dispatches to the right provider (or Ollama) based on the user's
  stored `SetupConfig.mode`.

### Usage

```ts
import { createGitService, createConfigStore, generateCommitMessage } from "@pushai/core";

const git = createGitService();
const configStore = createConfigStore({ serviceName: "pushai" });

const config = await configStore.getStoredConfig();
const diff = await git.getDiff(true);
const message = config ? await generateCommitMessage(config, diff) : null;
```

### License

This project is licensed under the [MIT License](https://github.com/thelastofinusa/pushai-monorepo/blob/main/LICENSE).