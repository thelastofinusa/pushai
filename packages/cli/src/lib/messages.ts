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

export function showCommitMessage(message: string) {
  const [title, description] = message.split("\n").filter(Boolean);

  const width = Math.max((process.stdout.columns || 80) - 10, 20);

  console.log(`  ${chalk.cyan(headerIcons.branchFirst)} proposed changes`);
  console.log(chalk.cyan(`  ${headerIcons.pipe}`));

  const titleLines = wrap(title, width);
  console.log(
    `  ${chalk.cyan(headerIcons.branch)} ${chalk.cyan(titleLines[0])}`,
  );

  for (const line of titleLines.slice(1)) {
    console.log(`  ${headerIcons.pipe}   ${chalk.cyan(line)}`);
  }

  if (description) {
    const descriptionLines = wrap(description, width);

    console.log(
      `  ${chalk.cyan(headerIcons.branchLast)} ${descriptionLines[0]}`,
    );

    for (const line of descriptionLines.slice(1)) {
      console.log(`      ${line}`);
    }
  }
}
