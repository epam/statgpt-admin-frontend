import type { ApiResult } from '@/src/server/api';

const UNAUTHORIZED = 401;

const TERMINAL_SESSION_ERROR = 'RefreshTokenExpired';

let refreshInFlight: Promise<boolean> | null = null;
let signInRequested = false;

/**
 * Sends the browser to the sign-in page. Done at most once per page load, so a
 * burst of failing requests cannot start several redirects.
 * @param signIn - `signIn` from `next-auth/react`
 */
const requestSignIn = (signIn: () => Promise<unknown>) => {
  if (signInRequested) {
    return;
  }

  signInRequested = true;
  signIn().catch(() => undefined);
};

/**
 * Asks Auth.js for the current session. `/api/auth/session` runs the `jwt`
 * callback, which renews an expired access token, and the response sets the
 * refreshed session cookie. Concurrent callers share a single request. When
 * the session carries the terminal `RefreshTokenExpired` error (refresh token
 * rejected or never issued) retrying cannot help, so the user is sent to
 * sign-in. A transient error or a missing session only reports failure.
 * `next-auth/react` is imported lazily so this module stays safe to import
 * from code that also runs on the server.
 * @returns whether the session is usable afterwards
 */
const refreshSession = (): Promise<boolean> => {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const { getSession, signIn } = await import('next-auth/react');
        const session = await getSession();
        const error = (session as { error?: string } | null)?.error;

        if (session && !error) {
          return true;
        }

        if (error === TERMINAL_SESSION_ERROR) {
          requestSignIn(signIn);
        }

        return false;
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

/**
 * Wraps a server action returning `ApiResult` so that it is repeated once,
 * with the same arguments, after a 401 and a session refresh (see
 * `withAuthRetry`). Server actions read the session cookie sent by the
 * browser, so they hit the same expired token as the BFF route handlers.
 * @param action - server action to wrap
 */
export const withAuthRetryAction =
  <A extends unknown[], R>(action: (...args: A) => Promise<ApiResult<R>>) =>
  (...args: A): Promise<ApiResult<R>> =>
    withAuthRetry(() => action(...args));
