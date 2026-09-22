import chalk from "chalk";

const command = (value: string) => chalk.cyan(value);
const muted = (value: string) => chalk.dim(value);

export function showOllamaNotInstalled(run: string) {
  console.log(`
${chalk.yellow("PushAI requires Ollama for local AI.")}

${muted("Install it, then come back and run:")}

  ${chalk.bold(run)}

${muted("macOS / Linux")}  ${command("curl -fsSL https://ollama.com/install.sh | sh")}
${muted("Windows")}        ${command("irm https://ollama.com/install.ps1 | iex")}

${muted("Download:")} ${command("https://ollama.com/download")}
`);
}

export function showNoModels(run: string) {
  console.log(`
${muted("Ollama is installed, but no models are available.")}

${muted("Browse and choose a model:")}
  ${command("https://ollama.com/search")}

${muted("Then install it with:")}
  ${command("ollama pull <model>")}

${muted("Once the model is installed, run:")} ${chalk.bold(run)}
`);
}

export function showConfiguration(config: {
  mode: string;
  provider?: string;
  model?: string;
  apiKey?: string;
}) {
  console.log(`
${chalk.bold("Current PushAI configuration:")}

${muted("Mode:")}     ${chalk.bold(config.mode)}
${config.provider ? `${muted("Provider:")} ${chalk.bold(config.provider)}\n` : ""}${config.model ? `${muted("Model:")}    ${chalk.bold(config.model)}\n` : ""}${config.apiKey ? `${muted("API Key:")}  ${chalk.green("configured")}` : ""}
`);
}
