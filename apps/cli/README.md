<p align="center" style="margin-top: 30px;">
  <img src="https://pushai.vercel.app/logo.png" alt="PushAI logo" width="64" height="64" />
</p>

<h1 align="center">PushAI</h1>

<p align="center">
  <strong>Stop writing manual commit messages.</strong><br />
  Let AI analyze your diffs, generate conventional commits, and push to remote – in one keystroke.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/pushai"><img src="https://img.shields.io/npm/dt/pushai.svg" alt="npm downloads" /></a>
  <a href="https://www.npmjs.com/package/pushai"><img src="https://img.shields.io/npm/v/pushai.svg" alt="npm version" /></a>
  <a href="https://github.com/thelastofinusa/pushai/blob/main/LICENSE"><img src="https://img.shields.io/github/license/thelastofinusa/pushai" alt="License" /></a>
</p>

## Installation

**Run instantly (no global install)**

```bash
npx pushai

# or: pnpm dlx pushai | yarn pushai | bunx --bun pushai
```

**Install globally**

```bash
npm install -g pushai

# or: pnpm add -g pushai | yarn global add pushai | bun install -g pushai
```

After global installation, you can use the shorthand `pushai` or `pai` (recommended).

## Quick Start

1. **Configure your AI provider** – run `pai config` and follow the wizard.
2. **Stage and commit** – run `pai` (or `pai commit`). PushAI stages all changes, generates a conventional commit message, and asks for approval before pushing.

## Features

| Feature                  | Description                                   |
| ------------------------ | --------------------------------------------- |
| **Multi‑Provider**       | Gemini, OpenAI, HuggingFace                   |
| **Conventional Commits** | Standardized messages (`feat:`, `fix:`, etc.) |
| **Auto‑Push**            | Stages, commits, and pushes in one flow       |
| **Smart Init**           | Detects missing repo and offers to initialize |
| **Interactive Approval** | Review, edit, or regenerate the message       |
| **Dry‑Run Mode**         | Preview message without committing/pushing    |
| **Progressive Timeouts** | Feedback at 10s and 60s (slow operations)     |

## Commands

| Command         | Description                                                |
| --------------- | ---------------------------------------------------------- |
| `pai commit`    | Stage, generate, approve, commit, and push.                |
| `pai config`    | Interactive setup (provider, API key, model).              |
| `pai reset`     | Delete all configuration and API keys (with confirmation). |
| `pai list`      | List all available AI providers and their models.          |
| `pai --version` | Show version.                                              |
| `pai --help`    | Show help.                                                 |

### Flags

| Flag                     | Applies to | Description                                                     |
| ------------------------ | ---------- | --------------------------------------------------------------- |
| `--yes` / `-y`           | `reset`    | Skip confirmation, delete configuration without asking.         |
| `--dry-run`              | `commit`   | Preview message – no commit or push.                            |
| `--push` / `-p`          | `commit`   | Skip approval, commit and push immediately.                     |
| `-m` / `--message <msg>` | `commit`   | Use a custom commit message (skips AI generation).              |
| `-e` / `--edit`          | `config`   | Open configuration file in default editor.                      |
| `--provider <name>`      | `config`   | Set the AI provider (e.g., `gemini`, `openai`).                 |
| `--model <id>`           | `config`   | Set the model ID directly.                                      |
| `--key <apiKey>`         | `config`   | Set the API key directly (non‑interactive).                     |
| `--peek`                 | `config`   | Show current saved configuration (provider, model, masked key). |

## Configuration

PushAI stores your non‑secret settings in `~/.config/pushai/config.json` and your API key in the system keychain (macOS/Windows/Linux).

You can configure PushAI in several ways:

- **Interactive wizard** – `pai config` (recommended for first‑time setup).
- **Non‑interactive flags** – set provider, model, or API key directly:
  `pai config --provider openai --model gpt-4o-mini --key "sk-..."`
- **View current config** – `pai config --peek`
- **List all available providers/models** – `pai list`

Example `config.json`:

```json
{
  "provider": "openai",
  "model": "gpt-4o"
}
```

> **Note:** The API key is stored securely via `keytar` and never appears in the config file.

## How It Works

1. **`pai` / `pai commit`**
   - Checks if you are inside a Git repository.
   - Stages all changes (`git add -A`).
   - Sends the diff to your chosen AI provider with a specialized prompt.
   - Returns a conventional commit message (`feat(scope): description`).
   - If the operation takes longer than 10 seconds, you’ll see a friendly warning; after 60 seconds, a further alert appears.

2. **Interactive approval**
   - You see the generated message inside a clean note box.
   - Options: accept, edit, regenerate, or cancel.
   - The “regenerate” action asks for a **different** message (increased temperature + extra prompt instruction).
   - When you use `-p` / `--push`, this approval step is skipped – the message is generated and the commit/push happen automatically.

3. **Security**
   - API keys are stored in the system keychain, not in plain text.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on reporting issues, setting up the development environment, and submitting pull requests.

## License

MIT © [Holiday](https://github.com/thelastofinusa)
See the [LICENSE](LICENSE) file for details.
