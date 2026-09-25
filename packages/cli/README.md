## pushai (`pai`)

An AI Git assistant for your terminal. `pai` looks at your staged changes,
writes a commit message for you, and can push the result — all from one
command.

```bash
npm install -g pushai
# or
bunx pushai setup
```

Once installed, the binary is called `pai`.

### Quick start

```bash
pai setup     # choose a provider and (if needed) an API key or local model
pai commit    # generate a commit, review it, optionally push
```

### Commands

#### `pai setup`

Runs the interactive setup wizard. Choose one of three modes:

- **Bring Your Own API Key (BYOK)** — connect an Anthropic, OpenAI, or Gemini key.
  Keys are validated live against the provider before being saved.
- **Run AI Locally** — uses [Ollama](https://ollama.com). `pai` detects
  whether Ollama is installed and running, starts it if needed, and lets you
  pick from your locally installed models.
- **PushAI Managed AI** — coming soon; no key or local setup required.

Your configuration is written to `~/.config/pushai/config.json`. API keys are
stored in your OS keychain when available, falling back to a permission-locked
local file (`~/.config/pushai/key.json`) otherwise.

#### `pai commit`

Runs the full commit flow:

1. Checks whether the current directory is a git repository, and offers to
   run `git init` if it isn't.
2. Shows the current branch and how many files have changed.
3. Stops and lists any files with unresolved merge conflicts.
4. Asks whether to generate a commit message (skipped if `-m` is passed).
5. Generates the message using whichever provider you configured in `setup`.
6. Creates the commit, then asks whether to push.

**Options**

| Flag                    | Description                                         |
| ------------------------ | ------------------------------------------------------ |
| `-p, --push`            | Skip the push prompt and push automatically.         |
| `-m, --message <text>`  | Use a custom message instead of generating one.       |
| `--dry-run`             | Generate and display the message, but don't commit.   |

```bash
pai commit                       # interactive
pai commit -m "fix: null branch" # skip generation
pai commit --push                # commit and push without asking
pai commit --dry-run             # preview only
```

#### `pai peak`

Shows your current configuration (mode, model, provider). Pass `-k`/`--key`
to reveal the stored API key in plaintext — omit it and the CLI just tells
you the command to run.

```bash
pai peak
pai peak --key
```

#### `pai reset`

Deletes your local configuration and stored API key, then offers to run
`setup` again.

```bash
pai reset
```

### Configuration file

| Path                              | Contents                                  |
| ---------------------------------- | -------------------------------------------- |
| `~/.config/pushai/config.json`    | Mode, provider, model (no secrets)         |
| `~/.config/pushai/key.json`       | Fallback API key store, used only if your OS keychain is unavailable |

### Uninstall

```bash
npm uninstall -g pushai
```

This does **not** delete `~/.config/pushai` — run `pai reset` first if you
want your stored config and key removed too.

### License

This project is licensed under the [MIT License](https://github.com/thelastofinusa/pushai-monorepo/blob/main/LICENSE).