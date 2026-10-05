import type { ShowTreeOptions, TreeItem } from "@pushai/types";
import { headerIcons } from "@pushai/utils";
import chalk from "chalk";

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
export function showTree({ headerTitle, items }: ShowTreeOptions) {
  if (items.length === 0) return;

  const width = Math.max((process.stdout.columns || 80) - 10, 20);

  console.log(`  ${chalk.cyan(headerIcons.branchFirst)} ${headerTitle}`);
  console.log(`  ${chalk.cyan(headerIcons.pipe)}`);

  items.forEach((item, index) => {
    const isLast = index === items.length - 1;
    const branchIcon = isLast ? headerIcons.branchLast : headerIcons.branch;

    const titleLines = wrap(item.title, width);

    // First line of the item
    console.log(`  ${chalk.cyan(branchIcon)} ${chalk.cyan(titleLines[0])}`);

    // Wrapped title lines
    const continuationPipe = isLast ? " " : headerIcons.pipe;
    for (const line of titleLines.slice(1)) {
      console.log(`  ${chalk.cyan(continuationPipe)}   ${chalk.cyan(line)}`);
    }

    // Description text
    if (item.description) {
      const descLines = wrap(item.description, width);
      for (const line of descLines) {
        console.log(`  ${chalk.cyan(continuationPipe)}   ${line}`);
      }
    }

    // Additional details (e.g. API keys or extra metadata)
    if (item.details && item.details.length > 0) {
      for (const detail of item.details) {
        console.log(`  ${chalk.cyan(continuationPipe)}   ${chalk.dim(detail)}`);
      }
    }
  });
}

/**
 * Helper to display commit messages with separate branch nodes for title and description.
 */
export function showCommitMessage(message: string) {
  const lines = message.split("\n").filter(Boolean);
  const title = lines[0];
  const description = lines.slice(1).join("\n");

  const items: TreeItem[] = [
    { title },
    ...(description ? [{ title: description }] : []),
  ];

  const width = Math.max((process.stdout.columns || 80) - 10, 20);

  console.log(`  ${chalk.cyan(headerIcons.branchFirst)} proposed changes`);
  console.log(`  ${chalk.cyan(headerIcons.pipe)}`);

  items.forEach((item, index) => {
    const isLast = index === items.length - 1;
    const branchIcon = isLast ? headerIcons.branchLast : headerIcons.branch;
    const titleLines = wrap(item.title, width);

    // First line gets the branch arrow (branch vs branchLast)
    if (index === 0) {
      console.log(`  ${chalk.cyan(branchIcon)} ${chalk.cyan(titleLines[0])}`);
      for (const line of titleLines.slice(1)) {
        console.log(`  ${chalk.cyan(headerIcons.pipe)}   ${chalk.cyan(line)}`);
      }
    } else {
      console.log(`  ${chalk.cyan(branchIcon)} ${titleLines[0]}`);
      for (const line of titleLines.slice(1)) {
        console.log(`      ${line}`);
      }
    }
  });
}

/**
 * Reusable helper to display provider configurations using the tree structure.
 */
export function showProviders(
  providers: Array<{
    id: string;
    mode: string;
    label: string;
    isActive: boolean;
    apiKeyInfo?: string;
  }>,
) {
  const items: TreeItem[] = providers.map((p) => {
    const activeTag = p.isActive ? chalk.dim(" (active)") : "";
    const title = `${p.label}${activeTag}`;

    let keyDetail = p.apiKeyInfo;
    if (!keyDetail) {
      if (p.mode === "byok") {
        keyDetail = "no api key set";
      } else {
        keyDetail = "no key required";
      }
    }

    return {
      title,
      details: [keyDetail],
    };
  });

  showTree({
    headerTitle: "configured providers",
    items,
  });
}
