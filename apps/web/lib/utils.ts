export { cn } from "cn";

export async function getFn(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Unavailable");
  return res;
}
