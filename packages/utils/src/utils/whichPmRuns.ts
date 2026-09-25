import { whichPMRuns } from "which-pm-runs";

export function getPackageManager() {
  const pm = whichPMRuns();

  switch (pm?.name) {
    case "pnpm":
      return {
        name: "pnpm",
        installer: "pnpm add",
        runner: "pnpm dlx",
      };

    case "yarn":
      return {
        name: "yarn",
        installer: "yarn add",
        runner: "yarn dlx",
      };

    case "bun":
      return {
        name: "bun",
        installer: "bun add",
        runner: "bunx",
      };

    default:
      return {
        name: "npm",
        installer: "npm install",
        runner: "npx",
      };
  }
}

export function getCliCommand() {
  const executable = process.argv[1] ?? "";

  // Installed globally/locally and exposed through the `pai` bin.
  if (executable.endsWith("/pai") || executable.endsWith("\\pai")) {
    return "pai";
  }

  const { runner } = getPackageManager();

  return `${runner} pushai`;
}
