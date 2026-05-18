import chalk from "chalk"

export const msg = {
  common: {
    operationCancelled: "Operation cancelled.",
    interrupted: "Request interrupted.",
    dryRun: "[DRY RUN] No changes were committed or pushed.",
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

  commit: {
    intro: (provider: string, model: string) =>
      `\n${chalk.cyan("●")} ${chalk.bgCyan.black.bold(` ${provider.toUpperCase()} `)} ${chalk.dim("•")} ${chalk.white(model)}\n`,
    outro: "Successfully synced with the remote repository.",
    noteTitle: "Ready to commit",
    gitRepoMissing: "There's no Git repository in this directory.",
    initConfirm: "Would you like to initialize a new Git repository?",
    initSuccess: "Git repository initialized successfully.",
    abortNoRepo: "A Git repository is required to continue.",
    noChanges: "No changes were found to commit.",
    generating: "Putting together a commit message..",
    generatingSlow10: "Please wait.. This might take a moment.",
    generatingSlow60: "This is taking longer than usual..",
    generated: "Commit message generated.",
    generationFailed: "AI failed to generate commit message.",
    generationCancelled: "Commit message generation cancelled.",
    emptyMessageTitle: "Empty commit message",
    emptyMessagePrompt:
      "AI returned an empty commit message. What would you like to do?",
    emptyRegenerate: "Regenerate",
    emptyManual: "Enter manually",
    emptyCancel: "Cancel",
    stillEmptyWarning: "Still empty, try manual entry.",
    manualMessagePrompt: "Enter commit message manually:",
    manualMessageRequired: "Message cannot be empty",
    manualAccepted: "Manual message accepted.",
    actionPrompt: "What would you like to do next?",
    actions: {
      accept: "Commit and push changes",
      edit: "Edit commit message",
      regenerate: "Generate another message",
      cancel: "Cancel operation",
    },
    editPrompt: "Update the commit message:",
    regenerating: "Regenerating a new commit message..",
    regenerated: "New commit message ready.",
    regenerationFailed: (error: string) =>
      `Couldn't generate another message: ${error}`,
    processStopped: "Process stopped. No changes were committed or pushed.",
    committing: "Creating commit..",
    committingSlow10: "Almost there..",
    committingSlow60: "Still processing your request..",
    pushing: "Pushing changes to remote..",
    pushingSlow10: "Syncing changes..",
    pushingSlow60: "Still syncing changes.. Please wait.",
    operationFailed: "Something went wrong while completing the operation.",
    gitError: (error: string) => `Git reported an error: ${error}`,
  },

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
    saved: "Configuration saved successfully.",
    providerLabel: (name: string) => `${chalk.white.bold("Provider:")} ${name}`,
    modelLabel: (name: string) => `${chalk.white.bold("Model:   ")} ${name}`,
    apiKeyLabel: (last4: string) =>
      `${chalk.white.bold("API Key: ")} ****${last4}`,
    configFile: (filePath: string) => `\nFile: ${filePath}`,
    commandsHint: "Here are a few commands to try:",
    hintCommit: "Generate AI-powered commit messages",
    hintConfig: "Update provider or API settings",
    hintReset: "Clear saved configuration",

    // New for --peek and updates
    peekIntro: "Current PushAI Configuration",
    peekOutro: "Use `pai config --help` to see how to update.",
    updateIntro: "Configuration updated successfully",
    updateOutro: "Ready to use PushAI",
    noValuesProvided: "No values provided. Use --provider, --model, or --key",
    notSet: "(not set)",

    // For providers listing
    providersIntro: "Available Providers & Models",
    providerTitle: (name: string) => `${name} models`,
    noModels: "  No models available",
    providersOutro: "Use `pai config -p <name> -m <model_id>` to configure.",
  },

  reset: {
    intro: "Resetting PushAI configuration",
    confirm: "Remove all PushAI configurations and API keys?",
    outro: "PushAI configuration removed successfully.",
    nothingToDelete: "There's no configuration data to remove.",
  },

  errors: {
    authFix: "Run `pai reset` to update your credentials.",
  },
}
