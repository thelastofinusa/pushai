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

After global installation, you can use the shorthand `pushai` or `pai` to see available commands.

## Quick Start

**1. Configure your provider**

```bash
pai config
```

Choose:

- AI provider
- API key
- Model

PushAI stores your API key securely using your system keychain.

**2. Generate and push commits**

```bash
pai commit
```

PushAI will:

- Detect your Git repository
- Stage changes
- Analyze diffs
- Generate a conventional commit message
- Let you review/edit/regenerate
- Commit and push to remote

## Features

| Feature                    | Description                                                |
| -------------------------- | ---------------------------------------------------------- |
| **Multi-Provider Support** | Works with Gemini, OpenAI, Hugging Face, and more          |
| **Conventional Commits**   | Generates clean `feat:`, `fix:`, `refactor:` style commits |
| **Interactive Flow**       | Approve, edit, regenerate, or cancel before pushing        |
| **Smart Git Detection**    | Detects missing repositories and offers initialization     |
| **Timed Loading States**   | Progressive feedback for slow AI or Git operations         |
| **Custom Messages**        | Skip AI generation entirely with `-m`                      |
| **Dry Run Mode**           | Preview commits without committing or pushing              |
| **Secure API Keys**        | Uses system keychain via `keytar`                          |
| **Provider Explorer**      | View available providers and supported models              |
| **Config Editor**          | Open and edit config directly from your terminal           |

## Commands

| Command         | Description                                 |
| --------------- | ------------------------------------------- |
| `pai commit`    | stage changes, generate a message, and push |
| `pai config`    | configure AI providers and API keys         |
| `pai list`      | browse available providers & models         |
| `pai reset`     | clear saved configuration and API keys      |
| `pai --version` | output the version number                   |
| `pai --help`    | display help for command                    |

### Flags

**commit**

| Flag                    | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `-d`, `--dry`           | generate message only, no commit/push            |
| `-p`, `--push`          | skip confirmation, commit and push automatically |
| `-m`, `--msg <message>` | use custom commit message (skip generation)      |

**config**

| Flag                      | Description                               |
| ------------------------- | ----------------------------------------- |
| `-e`, `--edit`            | edit the configuration file manually      |
| `-p`, `--provider <name>` | set AI provider (e.g. `gemini`, `openai`) |
| `-m`, `--model <model>`   | set model ID directly                     |
| `-k`, `--key <apiKey>`    | save or update your API key               |
| `-s`, `--show`            | display the current configuration         |

**reset**

| Flag          | Description                                  |
| ------------- | -------------------------------------------- |
| `-y`, `--yes` | skip confirmation and delete configuration   |
| `-k`, `--key` | only delete the API key, keep provider/model |

## Configuration

PushAI stores your non‑secret settings in `~/.config/pushai/config.json` and your API key in the system keychain (macOS/Windows/Linux).

You can configure PushAI in several ways:

- **Interactive wizard** – `pai config` (recommended for first‑time setup).
- **Non‑interactive flags** – set provider, model, or API key directly:
  `pai config --provider openai --model gpt-4o-mini --key "sk-..."`
- **View current config** – `pai config --show`
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
