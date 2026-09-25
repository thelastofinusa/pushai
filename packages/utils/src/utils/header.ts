import chalk, { type ChalkInstance } from "chalk";

type HeaderType = "intro" | "outro";

export const headerIcons = {
  // Status
  success: "✔",
  error: "✖",
  warning: "⚠",
  info: "ℹ",
  question: "?",

  // Navigation / actions
  arrow: "→",
  arrowLeft: "←",
  arrowUp: "↑",
  arrowDown: "↓",
  chevron: "»",
  chevronLeft: "«",
  chevronUp: "⌃",
  chevronDown: "⌄",

  // Common UI
  bullet: "•",
  dot: "·",
  circle: "●",
  circleOutline: "○",
  square: "■",
  squareOutline: "□",
  diamond: "◆",
  diamondOutline: "◇",
  star: "★",
  starOutline: "☆",

  // Development / tools
  gear: "⚙",

  // Misc
  sparkle: "✦",
  sparkleAlt: "✧",
  lightning: "⚡",
  heart: "♥",
  flag: "⚑",
} as const;

export type SymbolType = keyof typeof headerIcons;

interface ShowHeaderProps {
  type?: HeaderType;
  title?: string;
  symbol?: SymbolType;
  color?: ChalkInstance;
  exitType?: 0 | 1;
}

export function showHeader({
  title = "PushAI",
  symbol,
  color = chalk.cyan,
  type = "intro",
  exitType = 0,
}: ShowHeaderProps) {
  const resolvedSymbol = symbol ?? (type === "intro" ? "chevron" : "sparkle");
  const heading = color(`${headerIcons[resolvedSymbol]} ${title}`);

  console.log();
  console.log(heading);
  console.log();
  if (type === "outro") process.exit(exitType);
}
