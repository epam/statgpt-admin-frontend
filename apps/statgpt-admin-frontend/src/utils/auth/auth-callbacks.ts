import { NextAuthConfig, Profile, Session } from 'next-auth';

import { SESSION_ERROR } from '@/src/constants/auth';
import { Token } from '@/src/models/token';
import { logError, logger } from '@/src/server/logger';
import { NextClient } from './nextauth-client';
import {
  NO_REFRESH_TOKEN_CODE,
  OAuthRefreshError,
  refreshOAuthToken,
  TERMINAL_REFRESH_ERROR_CODES,
} from './oauth-refresh';
import {
  ACCESS_TOKEN_EXPIRY_SKEW_MS,
  ACCESS_TOKEN_SKEW_LIFETIME_RATIO,
  WAIT_REFRESH_TOKEN_TIMEOUT_MS,
} from './refresh-token-timing';

/**
 * Expiry time and lifetime of an access token as the IdP reported them.
 * @param source - OAuth token response carrying `expires_in` (seconds from
 * now) or `expires_at` (epoch seconds)
 */
const getAccessTokenTiming = (source: {
  expires_in?: unknown;
  expires_at?: unknown;
}) => {
  const now = Date.now();
  const accessTokenExpires =
    typeof source.expires_in === 'number'
      ? now + source.expires_in * 1000
      : (source.expires_at as number) * 1000;

  return {
    accessTokenExpires,
    accessTokenLifetimeMs: accessTokenExpires - now,
  };
};

/**
 * How long before its expiry a token already counts as stale: the fixed skew,
 * capped by a share of the token's own lifetime when that is known.
 * @param token - token to get the skew for
 */
const getExpirySkewMs = (token: Record<string, unknown>) => {
  const lifetime = token.accessTokenLifetimeMs;

  return typeof lifetime === 'number' && lifetime > 0
    ? Math.min(
        ACCESS_TOKEN_EXPIRY_SKEW_MS,
        lifetime * ACCESS_TOKEN_SKEW_LIFETIME_RATIO,
      )
    : ACCESS_TOKEN_EXPIRY_SKEW_MS;
};

/**
 * Tells whether the access token is still valid for longer than the expiry
 * skew, i.e. safe to send to the backend without refreshing it first.
 * @param token - token to check
 */
const isAccessTokenFresh = (token: Record<string, unknown>) =>
  typeof token.accessTokenExpires === 'number' &&
  Date.now() < token.accessTokenExpires - getExpirySkewMs(token);

/**
 * Tells whether the access token has not actually expired yet, regardless of
 * the expiry skew.
 * @param token - token to check
 */
const isAccessTokenUnexpired = (token: Record<string, unknown>) =>
  typeof token.accessTokenExpires === 'number' &&
  Date.now() < token.accessTokenExpires;

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property: `RefreshTokenExpired` when the
 * IdP rejected the refresh token for good (`invalid_grant`) or none exists,
 * otherwise the transient `RefreshAccessTokenError`. While the access token has
 * not expired yet, a transient failure or a missing refresh token keeps it
 * usable and reports no error; a rejected refresh token is reported at once.
 * @param token - token whose access token has to be refreshed
 */
export async function refreshAccessToken(token: Token) {
  const displayedTokenSub =
    process.env.SHOW_TOKEN_SUB === 'true' ? token.sub : '******';
  let hasAcquiredLock = false;

  try {
    if (!token.providerId) {
      throw new Error(`No provider information exists in token`);
    }

    let msWaiting = 0;
    while (true) {
      const refresh = NextClient.getRefreshToken(token.userId);

      if (!refresh || !refresh.isRefreshing) {
        const candidate = refresh?.token ?? token;
        if (isAccessTokenFresh(candidate)) {
          return candidate;
        }

        NextClient.setIsRefreshTokenStart(token.userId, {
          isRefreshing: true,
          token: candidate,
        });
        hasAcquiredLock = true;
        break;
      }

      await NextClient.delay();
      msWaiting += 50;

      if (msWaiting >= WAIT_REFRESH_TOKEN_TIMEOUT_MS) {
        throw new Error(
          `Waiting more than ${WAIT_REFRESH_TOKEN_TIMEOUT_MS / 1000} seconds for refreshing token`,
        );
      }
    }

    const refreshToken =
      typeof token.refreshToken === 'string'
        ? token.refreshToken
        : token.refreshToken?.refresh_token;

    if (!refreshToken) {
      throw new OAuthRefreshError(
        'No refresh token exists',
        NO_REFRESH_TOKEN_CODE,
      );
    }

    const refreshedTokens = await refreshOAuthToken(
      token.providerId,
      refreshToken,
    );

    if (
      !refreshedTokens ||
      (!refreshedTokens.expires_in && !refreshedTokens.expires_at)
    ) {
      throw new Error(`Error from auth provider while refreshing token`);
    }

    if (!refreshedTokens.refresh_token) {
      logger.warn(
        `Auth provider didn't provide new refresh token. Sub: ${displayedTokenSub}`,
      );
    }

    if (!refreshedTokens.refresh_token && !token.refreshToken) {
      throw new Error(`No refresh tokens exists`);
    }

    const returnToken = {
      ...token,
      access_token: refreshedTokens.access_token,
      ...getAccessTokenTiming(refreshedTokens),
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
      error: undefined,
    };

    NextClient.setIsRefreshTokenStart(token.userId, {
      isRefreshing: false,
      token: returnToken,
    });
    return returnToken;
  } catch (error: unknown) {
    logError(error, { sub: displayedTokenSub }, 'Error when refreshing token');

    if (hasAcquiredLock) {
      NextClient.setIsRefreshTokenStart(token.userId, {
        isRefreshing: false,
        token: undefined,
      });
    }

    const isTerminal =
      error instanceof OAuthRefreshError &&
      !!error.code &&
      TERMINAL_REFRESH_ERROR_CODES.includes(error.code);

    const isMissingRefreshToken =
      error instanceof OAuthRefreshError &&
      error.code === NO_REFRESH_TOKEN_CODE;

    if (
      (!isTerminal || isMissingRefreshToken) &&
      isAccessTokenUnexpired(token)
    ) {
      return { ...token, error: undefined };
    }

    return {
      ...token,
      error: isTerminal
        ? SESSION_ERROR.RefreshTokenExpired
        : SESSION_ERROR.RefreshAccessToken,
    };
  }
}

export const callbacks = {
  jwt: async (options) => {
    if (options.account) {
      const profile = options.profile as
        | (Profile & { job_title?: string })
        | undefined;

      return {
        ...options.token,
        jobTitle: profile?.job_title,
        access_token: options.account.access_token,
        ...getAccessTokenTiming(options.account),
        refreshToken: options.account.refresh_token,
        providerId: options.account.provider,
        userId: options.user.id ?? options.token.sub ?? '',
      };
    }

    if (options.token.providerId === 'credentials') {
      return options.token;
    }

    // The refresh token is dead, asking the IdP again cannot help
    if (options.token.error === SESSION_ERROR.RefreshTokenExpired) {
      return options.token;
    }

    if (isAccessTokenFresh(options.token)) {
      return options.token.error
        ? { ...options.token, error: undefined }
        : options.token;
    }
    const typedToken = options.token as Token;
    // Access token has expired, try to update it
    return refreshAccessToken(typedToken);
  },
  signIn: async (options) => {
    if (!options.account?.access_token) {
      return false;
    }

    return true;
  },
  session: async (options) => {
    if (options.token?.error) {
      (options.session as Session & { error?: unknown }).error =
        options.token.error;
    }
    return options.session;
  },
} satisfies NextAuthConfig['callbacks'];
