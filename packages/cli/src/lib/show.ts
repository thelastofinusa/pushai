import type {
  ShowProvidersOptions,
  ShowTreeOptions,
  TreeItem,
} from "@pushai/types";
import { headerIcons } from "@pushai/utils";
import chalk, { type ChalkInstance } from "chalk";
import { formatProvider } from "./format";

type ColorFunction = ChalkInstance | ((text: string) => string);

function wrap(text: string, width: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;

    if (next.length > width && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);

  return lines;
}

/**
 * Generic tree renderer for structured terminal outputs.
 */
export function showTree({
  headerTitle,
  items,
  color = chalk.cyan,
}: ShowTreeOptions & { color?: ColorFunction }) {
  if (items.length === 0) return;

  const width = Math.max((process.stdout.columns || 80) - 10, 20);

  console.log(`${color(headerIcons.branchFirst)} ${headerTitle}`);
  console.log(`${color(headerIcons.pipe)}`);

  items.forEach((item, index) => {
    const isLast = index === items.length - 1;
    const branchIcon = isLast ? headerIcons.branchLast : headerIcons.branch;

    const titleLines = wrap(item.title, width);

    // First line of the item
    console.log(`${color(branchIcon)} ${color(titleLines[0])}`);

    // Wrapped title lines
    const continuationPipe = isLast ? " " : headerIcons.pipe;
    for (const line of titleLines.slice(1)) {
      console.log(`${color(continuationPipe)}   ${color(line)}`);
    }

    // Description text
    if (item.description) {
      const descLines = wrap(item.description, width);
      for (const line of descLines) {
        console.log(`${color(continuationPipe)}   ${line}`);
      }
    }

    // Additional details (e.g. API keys or extra metadata)
    if (item.details && item.details.length > 0) {
      for (const detail of item.details) {
        console.log(`${color(continuationPipe)}   ${chalk.dim(detail)}`);
      }
    }
  });
}

/**
 * Helper to display commit messages with separate branch nodes for title and description.
 */
export function showCommitMessage(
  message: string,
  color: ColorFunction = chalk.cyan,
) {
  const lines = message.split("\n").filter(Boolean);
  const title = lines[0];
  const description = lines.slice(1).join("\n");

  const items: TreeItem[] = [
    { title },
    ...(description ? [{ title: description }] : []),
  ];

  const width = Math.max((process.stdout.columns || 80) - 10, 20);

  console.log(`${color(headerIcons.branchFirst)} proposed changes`);
  console.log(`${color(headerIcons.pipe)}`);

  items.forEach((item, index) => {
    const isLast = index === items.length - 1;
    const branchIcon = isLast ? headerIcons.branchLast : headerIcons.branch;
    const titleLines = wrap(item.title, width);

    // First line gets the branch arrow (branch vs branchLast)
    if (index === 0) {
      console.log(`${color(branchIcon)} ${color(titleLines[0])}`);
      for (const line of titleLines.slice(1)) {
        console.log(`${color(headerIcons.pipe)}   ${color(line)}`);
      }
    } else {
      console.log(`${color(branchIcon)} ${titleLines[0]}`);
      for (const line of titleLines.slice(1)) {
        console.log(`    ${line}`);
      }
    }
  });
}

/**
 * Reusable helper to display provider configurations using the tree structure.
 * Handles mapping raw providers into tree items and formatting key details.
 */
export function showProviders({
  providers,
  activeId,
  withApiKey = false,
  color = chalk.cyan,
}: ShowProvidersOptions & { color?: ColorFunction }): { hasByok: boolean } {
  let hasByok = false;

  const items: TreeItem[] = providers.map((p) => {
    const isActive = p.id === activeId;
    const activeTag = isActive
      ? chalk.yellowBright(` ${headerIcons.chevron} active`)
      : "";
    const title = `${formatProvider(p, true)}${activeTag}`;

    let keyDetail: string;

    if (p.mode === "byok") {
      hasByok = true;
      if (p.apiKey) {
        keyDetail = withApiKey ? p.apiKey : "api key configured";
      } else {
        keyDetail = `${headerIcons.error} no api key set`;
      }
    } else {
      keyDetail = `${headerIcons.info} no key required`;
    }

    return {
      title,
      details: [keyDetail],
    };
  });

  showTree({
    headerTitle: "configured providers",
    items,
    color,
  });

  return { hasByok };
}
