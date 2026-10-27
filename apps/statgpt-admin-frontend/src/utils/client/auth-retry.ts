import type { ApiResult } from '@/src/server/api';

const UNAUTHORIZED = 401;

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Asks Auth.js for the current session. `/api/auth/session` runs the `jwt`
 * callback, which renews an expired access token, and the response sets the
 * refreshed session cookie. Concurrent callers share a single request.
 * `next-auth/react` is imported lazily so this module stays safe to import
 * from code that also runs on the server.
 * @returns whether the session is usable afterwards
 */
const refreshSession = (): Promise<boolean> => {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const { getSession } = await import('next-auth/react');
        const session = await getSession();
        return !!session && !(session as { error?: unknown }).error;
      } catch {
        return false;
      }
    })().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
};

/**
 * Runs a request and, if the backend answers 401 (expired access token in the
 * session cookie), refreshes the session and sends the same request once more.
 * A 401 means the request was rejected before being processed, so repeating it
 * is safe. Does nothing on the server, where there is no browser session.
 * @param send - performs the request; must be safe to call twice
 */
export const withAuthRetry = async <R>(
  send: () => Promise<ApiResult<R>>,
): Promise<ApiResult<R>> => {
  const result = await send();

  if (
    result.ok ||
    result.error.status !== UNAUTHORIZED ||
    typeof window === 'undefined'
  ) {
    return result;
  }

  if (!(await refreshSession())) {
    return result;
  }

  return send();
};
