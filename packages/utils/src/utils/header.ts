import chalk, { type ChalkInstance } from "chalk";

type HeaderType = "intro" | "outro";

const icons = {
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

export type SymbolType = keyof typeof icons;

interface ShowHeaderProps {
  type?: HeaderType;
  title?: string;
  symbol?: SymbolType;
  color?: ChalkInstance;
}

export function showHeader({
  title = "PushAI",
  symbol = "diamond",
  color = chalk.cyan,
  type = "intro",
}: ShowHeaderProps) {
  const heading = color(`${icons[symbol]} ${title}`);

  console.log();

  if (type === "intro") {
    console.log(heading);
  } else {
    console.log(heading);
  }

  console.log();
}
