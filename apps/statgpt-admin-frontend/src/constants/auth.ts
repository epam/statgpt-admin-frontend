export const SIGN_IN_LINK = '/api/auth/signin';

/**
 * Values of the `error` field the `jwt` callback puts on the session token and
 * the `session` callback copies onto the session. `RefreshTokenExpired` is
 * terminal (the user has to sign in again), `RefreshAccessTokenError` is
 * transient and can recover on the next refresh.
 */
export const SESSION_ERROR = {
  RefreshAccessToken: 'RefreshAccessTokenError',
  RefreshTokenExpired: 'RefreshTokenExpired',
} as const;

export const getSignInLink = (callbackUrl?: string | null) => {
  const normalizedCallbackUrl = callbackUrl?.trim();

  if (!normalizedCallbackUrl) {
    return SIGN_IN_LINK;
  }

  return `${SIGN_IN_LINK}?${new URLSearchParams({
    callbackUrl: normalizedCallbackUrl,
  }).toString()}`;
};
