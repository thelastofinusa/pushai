## pushai

[![npm monthly downloads](https://img.shields.io/npm/dm/pushai)](https://www.npmjs.com/package/pushai)
[![GitHub commits](https://img.shields.io/github/commit-activity/t/thelastofinusa/pushai)](https://github.com/thelastofinusa/pushai/commits/main)

An AI Git assistant for your terminal. `pushai` looks at your staged changes,
writes a commit message for you, and can push the result — all from one
command.

```bash
npm install -g pushai
# or
bunx pushai setup
```

Once installed globally, the binary is called `pai`.

### Quick start

```bash
pai setup     # choose a provider and (if needed) an API key or local model
pai commit    # generate a commit, review it, optionally push
```

### Commands

#### `pai setup`

Runs the interactive setup wizard.

- **First run** walks you through one of two modes:
  - **Bring Your Own API Key (BYOK)** — connect an Anthropic, OpenAI, Gemini,
    or Hugging Face key. Keys are validated live against the provider before
    being saved.
  - **Run AI Locally** — uses [Ollama](https://ollama.com). `pai` detects
    whether Ollama is installed and running, starts it if needed, and lets you
    pick from your locally installed models.
- **If you already have a configuration**, `setup` instead lets you **add
  another provider** alongside your existing ones or **replace the active
  one** — you can have multiple providers configured and switch between them
  with `pai switch`.

A managed, no-key-required mode is planned but not available yet.

Configuration is written to `~/.config/pushai/config.json`. API keys are
stored in your OS keychain when available, falling back to a
permission-locked local file per provider otherwise.

#### `pai commit`

Runs the commit flow:

1. Fails immediately if the current directory isn't a git repository.
2. Stages all changes (`git add .`) and reads the staged diff.
3. Fails with the conflicting files listed if any are unresolved.
4. Generates a commit message with your active provider (skipped entirely if
   `-m` is passed).
5. Lets you accept, edit, or regenerate the message.
6. Creates the commit and shows the resulting hash.
7. Pushes automatically if `-p`/`--push` was passed; otherwise tells you to
   push manually.

**Options**

| Flag                    | Description                                       |
| ------------------------ | -------------------------------------------------- |
| `-p, --push`            | Automatically push the commit.                     |
| `-m, --message <text>`  | Use a custom message instead of generating one.     |
| `--dry-run`             | Generate and display the message, but don't commit. |

```bash
pai commit                       # interactive
pai commit -m "fix: null branch" # skip generation
pai commit --push                # commit and push
pai commit --dry-run             # preview only
```

#### `pai switch`

Lists every provider you've configured (marking the active one) and lets you
pick a new active provider. If no configuration exists yet, it offers to run
`setup` instead.

```bash
pai switch
```

#### `pai peak`

Lists all of your saved providers, marking which one is active. Pass
`-k`/`--key` to also reveal stored BYOK API keys in plaintext.

```bash
pai peak
pai peak --key
```

#### `pai reset`

Lets you remove a single saved provider (and its stored key), or delete every
provider and your entire configuration at once.

```bash
pai reset
```

#### `pai update`

Checks npm for a newer version of `pushai` and installs it in place if one is
available.

```bash
pai update
```

### Configuration file

| Path                                       | Contents                                                        |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `~/.config/pushai/config.json`             | Active provider and every saved provider's mode/model (no secrets) |
| `~/.config/pushai/key-<provider-id>.json`  | Per-provider fallback API key store, used only if your OS keychain is unavailable |

### Uninstall

```bash
npm uninstall -g pushai
```

This does **not** delete `~/.config/pushai` — run `pai reset` first if you
want your stored config and keys removed too.

### License

This project is licensed under the [MIT License](https://github.com/thelastofinusa/pushai/blob/main/LICENSE).