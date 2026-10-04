import chalk from "chalk";

const command = (value: string) => chalk.cyan(value);
const muted = (value: string) => chalk.dim(value);

const PREFIX = "  │ ";

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
  const [title, ...body] = message.split("\n").filter(Boolean);
  const width = Math.max((process.stdout.columns || 80) - PREFIX.length, 20);

  for (const line of wrap(title, width)) {
    console.log(`  ${muted("│")} ${command(line)}`);
  }

  for (const bodyLine of body) {
    for (const line of wrap(bodyLine, width)) {
      console.log(`  ${muted("│")} ${muted(line)}`);
    }
  }
}
