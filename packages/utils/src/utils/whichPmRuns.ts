import { whichPMRuns } from "which-pm-runs";

export function getPackageManager() {
  const pm = whichPMRuns();

  switch (pm?.name) {
    case "pnpm":
      return { name: "pnpm", runner: "pnpm dlx" };
    case "yarn":
      return { name: "yarn", runner: "yarn dlx" };
    case "bun":
      return { name: "bun", runner: "bunx" };
    default:
      return { name: "npm", runner: "npx" };
  }
}
