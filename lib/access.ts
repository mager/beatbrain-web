/** The existing owner's stable database ID. Usernames can be changed. */
export const OWNER_USER_ID = "4";
export const PRIVATE_CACHE_CONTROL = "private, no-store, max-age=0";

export function isOwner(
  user: { id: string; username?: string | null } | null | undefined,
): boolean {
  return user?.id === OWNER_USER_ID;
}

export function isSameOrigin(
  origin: string | string[] | undefined | null,
  appURL = process.env.BETTER_AUTH_URL || "https://beatbrain.xyz",
): boolean {
  if (typeof origin !== "string") return false;
  try {
    return origin === new URL(appURL).origin;
  } catch {
    return false;
  }
}

export function safeReturnPath(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  )
    return "/";
  try {
    const decoded = decodeURIComponent(value);
    if (
      decoded.startsWith("//") ||
      decoded.includes("\\") ||
      /[\x00-\x1f]/.test(decoded)
    )
      return "/";
    return value;
  } catch {
    return "/";
  }
}

const guestAuthPaths = new Set([
  "/api/auth/sign-in/email",
  "/api/auth/sign-in/username",
  "/api/auth/sign-in/social",
  "/api/auth/callback/spotify",
  "/api/auth/sign-up/email",
  "/api/auth/get-session",
  "/api/auth/sign-out",
]);

export function isPublicPath(path: string): boolean {
  return (
    path === "/auth/signin" ||
    guestAuthPaths.has(path) ||
    path.startsWith("/_next/static/") ||
    path === "/_next/image" ||
    path === "/favicon.ico"
  );
}
