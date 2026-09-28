export const siteConfig = {
  name: "PushAI",
  title: "Your Git workflow, quietly smarter.",
  slogan: "AI-powered git workflow",
  username: "thelastofinusa",
  nickname: "Osilama",
  description:
    "Generate thoughtful commit messages, switch AI providers, and push your work without leaving the terminal.",
  url:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://pushai.vercel.app",
};
