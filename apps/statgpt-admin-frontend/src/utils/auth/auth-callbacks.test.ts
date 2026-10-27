/** @jest-environment node */
/* global describe, it, expect, jest, beforeEach, afterEach */
import { Token } from '@/src/models/token';

import { callbacks, refreshAccessToken } from './auth-callbacks';
import { NextClient } from './nextauth-client';
import { OAuthRefreshError, refreshOAuthToken } from './oauth-refresh';

jest.mock('./oauth-refresh', () => ({
  ...jest.requireActual('./oauth-refresh'),
  refreshOAuthToken: jest.fn(),
}));

const mockRefreshOAuthToken = refreshOAuthToken as jest.Mock;

const baseToken = (overrides: Partial<Token> = {}): Token =>
  ({
    providerId: 'google',
    userId: 'user-1',
    refreshToken: 'old-refresh-token',
    accessTokenExpires: Date.now() - 1000,
    sub: 'user-1',
    ...overrides,
  }) as Token;

const resetRefreshMap = () => {
  (globalThis as { _refreshTokenMap?: unknown })._refreshTokenMap = {};
};

const setRefreshEntry = (entry: unknown) => {
  (
    globalThis as unknown as { _refreshTokenMap: Record<string, unknown> }
  )._refreshTokenMap['user-1'] = entry;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('refreshAccessToken', () => {
  beforeEach(() => {
    resetRefreshMap();
    mockRefreshOAuthToken.mockReset();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('lock handling', () => {
    it('acquires the lock for the user before calling refreshOAuthToken', async () => {
      let lockDuringCall: boolean | undefined;
      mockRefreshOAuthToken.mockImplementation(async () => {
        lockDuringCall = NextClient.getRefreshToken('user-1')?.isRefreshing;
        return { access_token: 'a', expires_in: 3600 };
      });

      await refreshAccessToken(baseToken());

      expect(lockDuringCall).toBe(true);
    });

    it('releases the lock when refreshOAuthToken throws', async () => {
      mockRefreshOAuthToken.mockRejectedValue(new Error('network blip'));

      await refreshAccessToken(baseToken());

      expect(NextClient.getRefreshToken('user-1')?.isRefreshing).toBe(false);
    });

    it('releases the lock when the provider response has neither expires_in nor expires_at', async () => {
      mockRefreshOAuthToken.mockResolvedValue({ access_token: 'a' });

      await refreshAccessToken(baseToken());

      expect(NextClient.getRefreshToken('user-1')?.isRefreshing).toBe(false);
    });

    it('does not wait on a stuck lock for a call made after a failed one', async () => {
      mockRefreshOAuthToken.mockRejectedValueOnce(new Error('network blip'));
      await refreshAccessToken(baseToken());

      mockRefreshOAuthToken.mockResolvedValueOnce({
        access_token: 'fresh-access-token',
        refresh_token: 'fresh-refresh-token',
        expires_in: 3600,
      });
      const second = await refreshAccessToken(baseToken());

      expect((second as { error?: string }).error).toBeUndefined();
      expect((second as { access_token?: string }).access_token).toBe(
        'fresh-access-token',
      );
    });

    it('returns the cached token without calling the IdP when it has not expired', async () => {
      setRefreshEntry({
        isRefreshing: false,
        token: baseToken({
          accessTokenExpires: Date.now() + 300_000,
          access_token: 'cached-access-token',
        }),
      });

      const result = await refreshAccessToken(baseToken());

      expect(mockRefreshOAuthToken).not.toHaveBeenCalled();
      expect((result as { access_token?: string }).access_token).toBe(
        'cached-access-token',
      );
    });

    it('serializes two concurrent calls for the same user on a fresh lock', async () => {
      let concurrentCalls = 0;
      let maxConcurrentCalls = 0;
      mockRefreshOAuthToken.mockImplementation(async () => {
        concurrentCalls += 1;
        maxConcurrentCalls = Math.max(maxConcurrentCalls, concurrentCalls);
        await sleep(100);
        concurrentCalls -= 1;
        return { access_token: 'a', expires_in: 3600 };
      });

      await Promise.all([
        refreshAccessToken(baseToken()),
        refreshAccessToken(baseToken()),
      ]);

      expect(maxConcurrentCalls).toBe(1);
      expect(mockRefreshOAuthToken).toHaveBeenCalledTimes(1);
    });

    it('still serializes concurrent calls after a previous refresh cycle completed', async () => {
      mockRefreshOAuthToken.mockRejectedValueOnce(new Error('network blip'));
      await refreshAccessToken(baseToken());

      let concurrentCalls = 0;
      let maxConcurrentCalls = 0;
      mockRefreshOAuthToken.mockImplementation(async () => {
        concurrentCalls += 1;
        maxConcurrentCalls = Math.max(maxConcurrentCalls, concurrentCalls);
        await sleep(100);
        concurrentCalls -= 1;
        return { access_token: 'fresh-access-token', expires_in: 3600 };
      });

      await Promise.all([
        refreshAccessToken(baseToken()),
        refreshAccessToken(baseToken()),
      ]);

      expect(maxConcurrentCalls).toBe(1);
    });

    it("does not release another call's lock when this call fails before acquiring it", async () => {
      setRefreshEntry({ isRefreshing: true, token: baseToken() });

      await refreshAccessToken(baseToken({ providerId: '' }));

      expect(NextClient.getRefreshToken('user-1')?.isRefreshing).toBe(true);
    });
  });

  describe('error classification', () => {
    it('returns RefreshAccessTokenError for a transient failure', async () => {
      mockRefreshOAuthToken.mockRejectedValue(new Error('network blip'));

      const result = await refreshAccessToken(baseToken());

      expect((result as { error?: string }).error).toBe(
        'RefreshAccessTokenError',
      );
    });

    it('returns RefreshTokenExpired when the IdP answers invalid_grant', async () => {
      mockRefreshOAuthToken.mockRejectedValue(
        new OAuthRefreshError('rejected', 'invalid_grant'),
      );

      const result = await refreshAccessToken(baseToken());

      expect((result as { error?: string }).error).toBe('RefreshTokenExpired');
    });

    it('returns RefreshAccessTokenError when the token has no refresh token', async () => {
      const result = await refreshAccessToken(
        baseToken({ refreshToken: undefined as unknown as string }),
      );

      expect(mockRefreshOAuthToken).not.toHaveBeenCalled();
      expect((result as { error?: string }).error).toBe(
        'RefreshAccessTokenError',
      );
    });
  });

  describe('success path', () => {
    it('returns a token with updated access_token and accessTokenExpires', async () => {
      mockRefreshOAuthToken.mockResolvedValue({
        access_token: 'fresh-access-token',
        refresh_token: 'fresh-refresh-token',
        expires_in: 3600,
      });

      const result = await refreshAccessToken(baseToken());

      expect((result as { access_token?: string }).access_token).toBe(
        'fresh-access-token',
      );
      expect(
        (result as { accessTokenExpires?: number }).accessTokenExpires,
      ).toBeGreaterThan(Date.now());
    });

    it('keeps the previous refresh token when the provider omits it', async () => {
      mockRefreshOAuthToken.mockResolvedValue({
        access_token: 'fresh-access-token',
        expires_in: 3600,
      });

      const result = await refreshAccessToken(
        baseToken({ refreshToken: 'old-refresh-token' }),
      );

      expect((result as { refreshToken?: unknown }).refreshToken).toBe(
        'old-refresh-token',
      );
    });
  });
});

describe('jwt callback', () => {
  const runJwt = (token: Token) =>
    callbacks.jwt({ token, account: null, user: undefined } as never);

  beforeEach(() => {
    resetRefreshMap();
    mockRefreshOAuthToken.mockReset();
    mockRefreshOAuthToken.mockResolvedValue({
      access_token: 'fresh-access-token',
      refresh_token: 'fresh-refresh-token',
      expires_in: 3600,
    });
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps a token that is comfortably valid', async () => {
    const token = baseToken({ accessTokenExpires: Date.now() + 300_000 });

    const result = await runJwt(token);

    expect(mockRefreshOAuthToken).not.toHaveBeenCalled();
    expect(result).toBe(token);
  });

  it('refreshes a token that is about to expire, before it actually does', async () => {
    const result = await runJwt(
      baseToken({ accessTokenExpires: Date.now() + 30_000 }),
    );

    expect(mockRefreshOAuthToken).toHaveBeenCalledTimes(1);
    expect((result as { access_token?: string }).access_token).toBe(
      'fresh-access-token',
    );
  });

  it('refreshes an already expired token', async () => {
    await runJwt(baseToken({ accessTokenExpires: Date.now() - 1000 }));

    expect(mockRefreshOAuthToken).toHaveBeenCalledTimes(1);
  });

  it('never refreshes credentials-provider tokens', async () => {
    const token = baseToken({
      providerId: 'credentials',
      accessTokenExpires: Date.now() - 1000,
    });

    const result = await runJwt(token);

    expect(mockRefreshOAuthToken).not.toHaveBeenCalled();
    expect(result).toBe(token);
  });
});
