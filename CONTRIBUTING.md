## Contributing to PushAI

Thanks for your interest in improving PushAI!
We welcome bug reports, feature requests, documentation improvements, and code contributions.

### Quick links

- [Code of Conduct](#code-of-conduct)
- [Reporting issues](#reporting-issues)
- [Development setup](#development-setup)
- [Submitting a pull request](#submitting-a-pull-request)

### Code of Conduct

Be respectful, inclusive, and constructive. Harassment or abusive behaviour will not be tolerated.

### Reporting issues

- **Bugs** – include steps to reproduce, expected vs actual behaviour, Node.js version, and OS.
- **Feature requests** – describe the use case and why it would help.
- **Questions** – open a discussion or ask in an issue.

Search [existing issues](https://github.com/thelastofinusa/pushai/issues) before creating a new one.

### Development setup

**Prerequisites**

- Node.js 18+ (20+ recommended)
- pnpm (preferred) or npm
- Git

**Clone and install**

```bash
git clone https://github.com/thelastofinusa/pushai.git
cd pushai
pnpm install
```

**Build and run locally**

```bash
pnpm build
node dist/index.mjs --help
```

Or run directly during development:

```bash
pnpm start
```

**Project structure**

```
src/
├── commands/     # CLI actions (commit, config, reset)
├── constants/    # Messages and prompts
├── providers/    # AI provider implementations
├── utils/        # Git, config, error handling
├── index.ts      # CLI entry point
└── types.ts      # TypeScript definitions
```

**Code style**

- TypeScript with strict mode (`strict: true` in tsconfig).
- Use `async/await`, avoid callbacks.
- Follow existing formatting (no semicolons, 2 spaces, etc. – run `pnpm build` to check).
- Keep functions focused and well‑named.

**Testing**

Currently, there are no automated tests – but you are encouraged to add them!
Manual testing can be done with `pnpm start` and various Git repositories.

### Submitting a pull request

1. **Fork** the repository and create a branch.
2. **Make changes** – keep them focused on a single issue/feature.
3. **Update the README** if you change behaviour or add flags.
4. **Run** `pnpm build` to ensure no TypeScript errors.
5. **Commit** using conventional commit messages (e.g., `feat: add --push flag`).
6. **Push** and open a pull request against the `main` branch.

In the PR description, explain:

- What problem it solves.
- How you tested it.
- Any breaking changes.

### Adding a new AI provider

1. Create a new provider class in `src/providers/` extending `BaseProvider`.
2. Implement `generateCommitMessage()`.
3. Add the provider to `aiProviders` array in `src/providers/index.ts`.
4. Update the `ProviderType` union in `src/types.ts`.

### License

By contributing, you agree that your contributions will be licensed under the same MIT License that covers the project.
