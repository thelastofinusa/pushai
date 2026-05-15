import chalk from "chalk"

export const msg = {
  // Common messages
  common: {
    operationCancelled: "Operation cancelled.",

    interrupted: "Request interrupted.",

    dryRun: {
      header: "[DRY RUN] No changes were committed or pushed.",

      proposed: (message: string) =>
        `Here's the generated commit message:\n${message}`,
    },

    noRemote: {
      header: "There's no Git remote repository configured.",

      instruction:
        "Try adding a remote repository (e.g. `git remote add origin <url>`) and run the command again.",
    },

    success: {
      committed: "Changes committed successfully.",

      pushed: "Changes pushed successfully.",
    },
  },

  // Commit command
  commit: {
    intro: (provider: string, model: string) =>
      `${chalk.cyan("●")} ${chalk.bgCyan.black.bold(` ${provider.toUpperCase()} `)} ${chalk.dim("•")} ${chalk.white(model)}\n`,
    outro: "Successfully synced with the remote repository.",

    noteTitle: "Commit message preview",

    gitRepoMissing: "There's no Git repository in this directory.",

    initConfirm: "Would you like to initialize a new Git repository?",

    initSuccess: "Git repository initialized successfully.",

    abortNoRepo: "A Git repository is required to continue.",

    noChanges: "No changes were found to commit.",

    generating: "Putting together a commit message",

    generated: "Commit message ready.",

    generationFailed: "Couldn't generate a commit message.",

    generationCancelled: "Commit message generation cancelled.",

    actionPrompt: "What would you like to do next?",

    actions: {
      accept: "Commit and push changes",
      edit: "Edit commit message",
      regenerate: "Generate another message",
      cancel: "Cancel operation",
    },

    editPrompt: "Update the commit message:",

    regenerating: "Regenerating a new commit message",

    regenerated: "New commit message ready.",

    regenerationFailed: (errMsg: string) =>
      `Couldn't generate another message: ${errMsg}`,

    processStopped: "Process stopped. No changes were committed or pushed.",

    committing: "Creating commit",

    pushing: "Pushing changes to remote",

    operationFailed: "Something went wrong while completing the operation.",

    gitError: (errMsg: string) => `Git reported an error: ${errMsg}`,
  },

  // Config command
  config: {
    intro: "Welcome to PushAI. Let's get things set up.",

    outro: "Configuration complete. You're ready to go!",

    providerPrompt: "Choose from the available AI providers:",

    apiKeyPrompt: (provider: string) =>
      `Enter your ${chalk.cyan.bold(provider)} API key:`,

    apiKeyRequired:
      "You'll need an API key to continue. Simply copy and paste to proceed.",

    modelPrompt: "Which model would you like to use?",

    customModelSeparator: "Use a custom model ID",

    customModelPrompt: "Enter the custom model ID:",

    customModelRequired: "A model ID is required.",

    baseUrlPrompt: "Enter a base URL",

    baseUrlPromptPlaceholder: "Optional — press Enter to skip",

    saved: "Configuration saved successfully.",

    providerLabel: (name: string) => `${chalk.white.bold("Provider:")} ${name}`,

    modelLabel: (model: string) => `${chalk.white.bold("Model:   ")} ${model}`,

    apiKeyLabel: (lastFour: string) =>
      `${chalk.white.bold("API Key: ")} ****${lastFour}`,

    configFile: (path: string) => `\nFile: ${path}`,

    commandsHint: "Here are a few commands to try:",

    hintCommit: "Generate AI-powered commit messages",

    hintConfig: "Update provider or API settings",

    hintReset: "Clear saved configuration",
  },

  // Reset command
  reset: {
    intro: "Resetting PushAI configuration",
    confirm: "Remove all PushAI configurations and API keys?",
    outro: "PushAI configuration removed successfully.",
    nothingToDelete: "There's no configuration data to remove.",
  },

  // Error handling
  errors: {
    authInvalid:
      "Authentication failed. The API key or token appears to be invalid.",

    authFix: "Try running `pai reset` to update your credentials.",

    unknown: (message: string) =>
      `\n${message || "Something unexpected went wrong."}`,
  },
}
