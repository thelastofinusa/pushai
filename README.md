<p align="center">
  <img src="./apps/web/public/logo.svg" alt="PushAI logo" width="64" height="64" />
</p>

<h1 align="center">PushAI</h1>

<p align="center">
  <strong>Stop writing manual commit messages.</strong><br />
  Let AI analyze your diffs, generate conventional commits, and push to remote – in one keystroke.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/pushai"><img src="https://img.shields.io/npm/v/pushai.svg" alt="npm version" /></a>
  <a href="https://github.com/thelastofinusa/pushai/blob/main/LICENSE"><img src="https://img.shields.io/github/license/thelastofinusa/pushai" alt="GitHub license" /></a>
  <a href="https://www.npmjs.com/package/pushai"><img src="https://img.shields.io/npm/dt/pushai.svg" alt="npm downloads" /></a>
</p>

### Features

- **Multi‑Provider** – Google Gemini, OpenAI, HuggingFace, and any OpenAI‑compatible local endpoint (Ollama, LM Studio).
- **Privacy First** – Run completely locally by connecting to your own LLM instance.
- **Conventional Commits** – Generates standardised, readable messages (`feat:`, `fix:`, `docs:`, etc.).
- **Auto‑Push** – Stages all changes, commits with the generated message, and pushes to remote in one seamless flow.
- **Smart Init** – Automatically detects missing Git repositories and offers to initialise them.
- **Interactive Approval** – Review, edit, or regenerate the commit message before anything is pushed.
- **Dry‑Run Mode** – Preview the generated message without committing or pushing.

---

### Installation

**Run instantly (no global install)**

```bash
npx pushai
# or
pnpm dlx pushai
# or
yarn pushai
# or
bunx --bun pushai
```

**Install globally**

```bash
npm install -g pushai
# or
pnpm add -g pushai
# or
yarn global add pushai
# or
bun install -g pushai
```

After global installation, you can use the shorthand `pai` (recommended).

---

### Quick Start

1. **Configure your AI provider**

   ```bash
   pai config
   ```

   Follow the interactive wizard to select a provider (e.g., OpenAI, Gemini), enter your API key, and choose a model.

2. **Stage your changes and let AI do the rest**

   ```bash
   pai
   ```

   PushAI will:
   - Stage all modified/untracked files.
   - Generate a conventional commit message based on your diff.
   - Show you the message and ask for confirmation.
   - Commit and push (if you approve).

---

### Commands

| Command                | Description                                                            |
| ---------------------- | ---------------------------------------------------------------------- |
| `pai commit`           | Stage, generate, approve, commit, and push.                            |
| `pai commit --dry-run` | Generate a commit message and show it, but do not commit or push.      |
| `pai config`           | Interactive setup: choose provider, model, and set API key / base URL. |
| `pai reset`            | Deletes all local configuration and API keys from your system.         |
| `pai --version` / `-v` | Display the installed version.                                         |
| `pai --help` / `-h`    | Show help for all commands.                                            |

---

### Configuration

PushAI stores your non‑secret settings in `~/.config/pushai/config.json` and your API key in the system keychain (macOS/Windows/Linux).

You can manually edit the config file, but using `pai config` is recommended.

Example `config.json`:

```json
{
  "provider": "openai",
  "model": "gpt-4o",
  "baseUrl": "http://localhost:11434/v1" // optional, for local Ollama
}
```

> **Note:** The API key is stored securely via `keytar` and never appears in the config file.

---

### How It Works

1. **`pai` / `pai commit`**
   - Checks if you are inside a Git repository.
   - Stages all changes (`git add .`).
   - Sends the diff to your chosen AI provider with a specialised prompt.
   - Returns a conventional commit message (`feat(scope): description`).

2. **Interactive approval**
   - You see the generated message inside a box.
   - Options: accept, edit, regenerate, or cancel.
   - If you accept, the tool commits and pushes to the current remote branch.

3. **Security**
   - API keys are stored in the system keychain, not in plain text.
   - Local endpoints (`baseUrl`) keep all data on your machine.

---

### License

[MIT](./LICENSE) © Holiday
