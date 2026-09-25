import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const REGISTRY = "https://registry.npmjs.org";
const TIMEOUT_MS = 3000;
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h

export interface UpdateInfo {
  current: string;
  latest: string;
  outdated: boolean;
}

function isNewer(latest: string, current: string): boolean {
  const clean = (v: string) =>
    v.replace(/^v/, "").split("-")[0].split(".").map(Number);
  const [aMaj, aMin, aPat] = clean(latest);
  const [bMaj, bMin, bPat] = clean(current);

  if (aMaj !== bMaj) return (aMaj ?? 0) > (bMaj ?? 0);
  if (aMin !== bMin) return (aMin ?? 0) > (bMin ?? 0);
  return (aPat ?? 0) > (bPat ?? 0);
}

async function fetchLatestVersion(packageName: string): Promise<string | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${REGISTRY}/${packageName}/latest`, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as { version?: string };
    return data.version ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function cachePath(serviceName: string): string {
  return path.join(os.homedir(), ".config", serviceName, ".update-check.json");
}

interface CacheEntry {
  checkedAt: number;
  info: UpdateInfo;
}

function readCache(serviceName: string): CacheEntry | null {
  try {
    const file = cachePath(serviceName);
    if (!fs.existsSync(file)) return null;

    const entry = JSON.parse(fs.readFileSync(file, "utf8")) as CacheEntry;

    if (Date.now() - entry.checkedAt > CACHE_TTL_MS) return null;

    return entry;
  } catch {
    return null;
  }
}

function writeCache(serviceName: string, info: UpdateInfo): void {
  try {
    const file = cachePath(serviceName);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(
      file,
      JSON.stringify({ checkedAt: Date.now(), info } satisfies CacheEntry),
    );
  } catch {
    /* cache write is best-effort */
  }
}

/**
 * Check whether the running package is outdated. Results are cached for
 * 24h under ~/.config/<serviceName>/.update-check.json. Never throws.
 */
export async function checkForUpdate(
  packageName: string,
  currentVersion: string,
  serviceName: string = packageName,
): Promise<UpdateInfo> {
  const cached = readCache(serviceName);
  if (cached) return cached.info;

  const latest = await fetchLatestVersion(packageName);

  const info: UpdateInfo = latest
    ? {
        current: currentVersion,
        latest,
        outdated: isNewer(latest, currentVersion),
      }
    : { current: currentVersion, latest: currentVersion, outdated: false };

  writeCache(serviceName, info);

  return info;
}

/** Force a fresh check, bypassing the cache. Used by `pai update`. */
export async function checkForUpdateFresh(
  packageName: string,
  currentVersion: string,
  serviceName: string = packageName,
): Promise<UpdateInfo> {
  const latest = await fetchLatestVersion(packageName);

  const info: UpdateInfo = latest
    ? {
        current: currentVersion,
        latest,
        outdated: isNewer(latest, currentVersion),
      }
    : { current: currentVersion, latest: currentVersion, outdated: false };

  writeCache(serviceName, info);

  return info;
}
