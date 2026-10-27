/**
 * Shared timing constants for the token-refresh lock (auth-callbacks.ts) and
 * the underlying IdP fetch calls (oauth-refresh.ts). The wait timeout is
 * derived from the fetch timeout so the two cannot drift apart: a caller
 * waiting for another caller's in-flight refresh must never give up before
 * that refresh's own fetch timeout could have fired.
 */

/**
 * Total time budget for a single refreshOAuthToken() call: discovery and
 * token exchange share one deadline instead of restarting it per fetch.
 */
export const REFRESH_FETCH_TIMEOUT_MS = 15_000;

const WAIT_TIMEOUT_BUFFER_MS = 2_000;

/**
 * How long a caller waits for another caller's in-flight refresh before
 * giving up and reporting its own request as failed.
 */
export const WAIT_REFRESH_TOKEN_TIMEOUT_MS =
  REFRESH_FETCH_TIMEOUT_MS + WAIT_TIMEOUT_BUFFER_MS;

/**
 * An access token closer to expiry than this is treated as expired, so it is
 * refreshed before a backend request can run into its actual expiry.
 */
export const ACCESS_TOKEN_EXPIRY_SKEW_MS = 60_000;

/**
 * Upper bound of the expiry skew as a share of the token's own lifetime, so a
 * short-lived token is not treated as expired from the moment it is issued.
 */
export const ACCESS_TOKEN_SKEW_LIFETIME_RATIO = 0.2;
