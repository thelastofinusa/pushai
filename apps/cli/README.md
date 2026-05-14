## pushai (pai)

The only Git CLI you'll ever need. Stop wasting time thinking of commit messages. Let AI do it, then push in one click.

[![npm version](https://img.shields.io/npm/v/pushai.svg)](https://www.npmjs.com/package/pushai)

### Features

- **Multi-Provider:** Google Gemini, OpenAI, and HuggingFace support.
- **Privacy First:** Support for Local LLMs (Ollama/LM Studio) via custom base URLs.
- **Conventional Commits:** Automatically generates standard, readable messages.
- **Auto-Push:** Stages, commits, and pushes to remote in one flow.
- **Smart Init:** Automatically detects and offers to initialize git in new folders.

### Installation

**Run instantly**

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
bunx --bun pushai
```

### Usage

You can use the full command `pushai` or the shorthand `pai`.

**1. Initial Setup**

The first time you run `pai`, it will guide you through configuring your AI provider and API key.

```bash
pai config
```

**2. The Main Workflow**

Simply run `pai` when you have unstaged or modified changes.

```bash
pai
# or
pai commit
```

### Commands

| Command         | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| `pai`           | Default action: stages changes, generates message, and pushes. |
| `pai commit`    | Explicitly triggers the commit/push workflow.                  |
| `pai config`    | Update your API key, provider, or model choice.                |
| `pai reset`     | Deletes the entire `pushai` config directory.                  |
| `pai --version` | Display current version.                                       |
| `pai --help`    | Display help message.                                          |

### Supported Providers

- **Google Gemini:** `gemini-1.5-flash` (Fast & Free tier available).
- **OpenAI:** `gpt-4o`, `gpt-4o-mini`.
- **HuggingFace:** `Llama 3`, `Mistral`, etc.
- **Local/Custom:** Anything OpenAI-compatible (Ollama, Groq).
