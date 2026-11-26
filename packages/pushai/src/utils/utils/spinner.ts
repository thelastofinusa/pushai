import ora, { type Color } from "ora";

export const spinner = ora();

export function setSpinnerColor(color?: Color) {
  spinner.color = color ?? "yellow";
}
