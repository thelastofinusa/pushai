import { getPackageManager, showHeader } from "@pushai/utils";
import chalk from "chalk";
import { formatProvider } from "../../lib/format";

export async function runPeak(withApiKey = false, run: string) {
  showHeader({
    title: "Current PushAI Configuration",
    color: chalk.cyan,
    type: "intro",
    symbol: "gear",
  });

  const pm = getPackageManager();
  const config = await getConfigAndRun();

  if (!config) return;

  const active = config.providers.find(
    (provider) => provider.id === config.activeId,
  );

  console.log(
    ` ${chalk.dim("Active".padEnd(12))} ${
      active ? chalk.green(formatProvider(active)) : chalk.yellow("none")
    }`,
  );

  console.log();

  console.log(` ${chalk.dim(`Providers (${config.providers.length}):`)}`);

  let hasByok = false;

  for (const provider of config.providers) {
    const isActive = provider.id === config.activeId;

    const marker = isActive ? chalk.green("●") : chalk.dim("○");

    const label = isActive
      ? chalk.green(formatProvider(provider))
      : chalk.white(formatProvider(provider));

    console.log(
      `   ${marker} ${label}${isActive ? chalk.green(" (active)") : ""}`,
    );

    if (provider.mode === "byok") {
      hasByok = true;

      const keyDisplay = withApiKey
        ? chalk.magenta(provider.apiKey)
        : chalk.dim("••••••••••••••••");

      console.log(`       ${chalk.dim("api key")}  ${keyDisplay}`);
    }
  }

  if (hasByok && !withApiKey) {
    console.log();

    console.log(
      ` ${chalk.dim("Use")} ${chalk.cyan(
        `${pm.runner} ${run}`,
      )} ${chalk.dim("to show the configured API keys.")}`,
    );
  }

  showHeader({
    title: "Configuration loaded successfully.",
    color: chalk.green,
    symbol: "success",
    type: "outro",
  });

  return config;
}
