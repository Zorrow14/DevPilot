import { auth } from "@/src/lib/firebase";

/**
 * Reads the current Firebase ID token outside of React.
 *
 * `auth.currentUser` is null until the SDK finishes restoring the persisted
 * session, and pages fetch from a bare effect on mount — so awaiting
 * `authStateReady()` is what keeps the first request from going out anonymous.
 *
 * Pass `forceRefresh` to bypass the token cache. A plain `getIdToken()` only
 * refreshes on expiry, so a revoked token or a skewed clock still returns the
 * stale value; the retry in `apiRequest` relies on this flag.
 */
export async function getAuthToken(forceRefresh = false): Promise<string | null> {
  await auth.authStateReady();

  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  try {
    return await user.getIdToken(forceRefresh);
  } catch {
    return null;
  }
}
