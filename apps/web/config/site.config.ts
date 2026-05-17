/* eslint-disable turbo/no-undeclared-env-vars */
export const siteConfig = {
  name: "PushAI",
  slogan: "Ship commits at the speed of thought.",
  username: "thelastofinusa",
  nickname: "Holiday",
  description:
    "PushAI stages your changes, writes meaningful commit messages with AI, and pushes — all from a single terminal command.",
  url:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://pushai.vercel.app",
}
