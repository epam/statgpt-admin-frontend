import { NextAuthConfig, Profile, Session } from 'next-auth';

import { Token } from '@/src/models/token';
import { NextClient } from './nextauth-client';
import {
  NO_REFRESH_TOKEN_CODE,
  OAuthRefreshError,
  refreshOAuthToken,
  TERMINAL_REFRESH_ERROR_CODES,
} from './oauth-refresh';
import {
  ACCESS_TOKEN_EXPIRY_SKEW_MS,
  WAIT_REFRESH_TOKEN_TIMEOUT_MS,
} from './refresh-token-timing';

/**
 * Tells whether the access token is still valid for longer than the expiry
 * skew, i.e. safe to send to the backend without refreshing it first.
 * @param token - token to check
 */
const isAccessTokenFresh = (token: Record<string, unknown>) =>
  typeof token.accessTokenExpires === 'number' &&
  Date.now() < token.accessTokenExpires - ACCESS_TOKEN_EXPIRY_SKEW_MS;

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property: `RefreshTokenExpired` when the
 * IdP rejected the refresh token for good (`invalid_grant`) or none exists,
 * otherwise the transient `RefreshAccessTokenError`.
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
      console.warn(
        `Auth provider didn't provide new refresh token. Sub: ${displayedTokenSub}`,
      );
    }

    if (!refreshedTokens.refresh_token && !token.refreshToken) {
      throw new Error(`No refresh tokens exists`);
    }

    const returnToken = {
      ...token,
      access_token: refreshedTokens.access_token,
      accessTokenExpires: refreshedTokens.expires_in
        ? Date.now() + refreshedTokens.expires_in * 1000
        : (refreshedTokens.expires_at as number) * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };

    NextClient.setIsRefreshTokenStart(token.userId, {
      isRefreshing: false,
      token: returnToken,
    });
    return returnToken;
  } catch (error: unknown) {
    console.error(
      error,
      `Error when refreshing token: ${
        (error as Error).message
      }. Sub: ${displayedTokenSub}`,
    );

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

    return {
      ...token,
      error: isTerminal ? 'RefreshTokenExpired' : 'RefreshAccessTokenError',
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
        accessTokenExpires:
          typeof options.account.expires_in === 'number'
            ? Date.now() + options.account.expires_in * 1000
            : (options.account.expires_at as number) * 1000,
        refreshToken: options.account.refresh_token,
        providerId: options.account.provider,
        userId: options.user.id ?? options.token.sub ?? '',
      };
    }

    // Return previous token if the access token is not about to expire
    if (
      options.token.providerId === 'credentials' ||
      isAccessTokenFresh(options.token)
    ) {
      return options.token;
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
