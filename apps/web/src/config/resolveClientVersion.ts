/**
 * Build identifier sent as X-Client-Version on API calls and client error reports.
 */

export function resolveClientVersion(): string {
  const env = import.meta.env;
  const sha = env.VITE_VERCEL_GIT_COMMIT_SHA;
  if (typeof sha === "string" && sha.length > 0) {
    return sha.slice(0, 12);
  }
  const appVersion = env.VITE_APP_VERSION;
  if (typeof appVersion === "string" && appVersion.length > 0) {
    return appVersion;
  }
  return "dev";
}
