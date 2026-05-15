/* eslint-disable turbo/no-undeclared-env-vars */
export const siteConfig = {
  name: "PushAI",
  slogan: "AI-powered git commit messages",
  username: "thelastofinusa",
  nickname: "Holiday",
  description:
    "PushAI lets you generate git commit messages with AI directly from your terminal.",
  url:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://pushai.vercel.app",
}
