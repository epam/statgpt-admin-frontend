/** @jest-environment node */
/* global describe, it, expect, jest, beforeEach, afterEach */
import { logError } from '@/src/server/logger';
import { Token } from '@/src/models/token';

import { callbacks, refreshAccessToken } from './auth-callbacks';
import { decode, encode } from 'next-auth/jwt';

import { NextClient } from './nextauth-client';
import { OAuthRefreshError, refreshOAuthToken } from './oauth-refresh';
import { WAIT_REFRESH_TOKEN_TIMEOUT_MS } from './refresh-token-timing';

jest.mock('@/src/server/logger', () => ({
  logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
  logError: jest.fn(),
}));

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

    it('returns RefreshTokenExpired when the token has no refresh token', async () => {
      const result = await refreshAccessToken(
        baseToken({ refreshToken: undefined as unknown as string }),
      );

      expect(mockRefreshOAuthToken).not.toHaveBeenCalled();
      expect((result as { error?: string }).error).toBe('RefreshTokenExpired');
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

describe('session error handling', () => {
  const runJwt = (token: Token) =>
    callbacks.jwt({ token, account: null, user: undefined } as never);

  const resultError = (result: unknown) => (result as { error?: string }).error;

  beforeEach(() => {
    resetRefreshMap();
    mockRefreshOAuthToken.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('drops a previous error once a refresh succeeds', async () => {
    mockRefreshOAuthToken.mockResolvedValue({
      access_token: 'fresh-access-token',
      expires_in: 3600,
    });

    const result = await refreshAccessToken(
      baseToken({ error: 'RefreshAccessTokenError' }),
    );

    expect(resultError(result)).toBeUndefined();
    expect((result as { access_token?: string }).access_token).toBe(
      'fresh-access-token',
    );
  });

  it('recovers from a transient failure on the next refresh', async () => {
    mockRefreshOAuthToken.mockRejectedValueOnce(new Error('network blip'));
    const failed = await refreshAccessToken(baseToken());
    expect(resultError(failed)).toBe('RefreshAccessTokenError');

    mockRefreshOAuthToken.mockResolvedValueOnce({
      access_token: 'fresh-access-token',
      expires_in: 3600,
    });
    const recovered = await runJwt(failed as Token);

    expect(resultError(recovered)).toBeUndefined();
  });

  it('keeps serving a still valid token when a refresh fails ahead of expiry', async () => {
    mockRefreshOAuthToken.mockRejectedValue(new Error('network blip'));
    const token = baseToken({
      accessTokenExpires: Date.now() + 30_000,
      access_token: 'still-valid-access-token',
    });

    const result = await refreshAccessToken(token);

    expect(resultError(result)).toBeUndefined();
    expect((result as { access_token?: string }).access_token).toBe(
      'still-valid-access-token',
    );
  });

  it('still reports a terminal failure ahead of expiry', async () => {
    mockRefreshOAuthToken.mockRejectedValue(
      new OAuthRefreshError('rejected', 'invalid_grant'),
    );

    const result = await refreshAccessToken(
      baseToken({ accessTokenExpires: Date.now() + 30_000 }),
    );

    expect(resultError(result)).toBe('RefreshTokenExpired');
  });

  it('does not call the IdP again for a token already marked as expired for good', async () => {
    const token = baseToken({ error: 'RefreshTokenExpired' });

    const result = await runJwt(token);

    expect(mockRefreshOAuthToken).not.toHaveBeenCalled();
    expect(result).toBe(token);
  });

  it('clears a leftover transient error from a token that is valid again', async () => {
    const result = await runJwt(
      baseToken({
        error: 'RefreshAccessTokenError',
        accessTokenExpires: Date.now() + 300_000,
      }),
    );

    expect(mockRefreshOAuthToken).not.toHaveBeenCalled();
    expect(resultError(result)).toBeUndefined();
  });

  it('gives up waiting for another refresh after the wait timeout without touching its lock', async () => {
    jest.useFakeTimers();
    const holder = { isRefreshing: true, token: baseToken() };
    setRefreshEntry(holder);

    const pending = refreshAccessToken(baseToken());
    await jest.advanceTimersByTimeAsync(WAIT_REFRESH_TOKEN_TIMEOUT_MS + 100);
    const result = await pending;

    expect(resultError(result)).toBe('RefreshAccessTokenError');
    expect(mockRefreshOAuthToken).not.toHaveBeenCalled();
    expect(NextClient.getRefreshToken('user-1')).toBe(holder);
  });
});

describe('access token expiry skew', () => {
  const runJwt = (token: Token) =>
    callbacks.jwt({ token, account: null, user: undefined } as never);

  beforeEach(() => {
    resetRefreshMap();
    mockRefreshOAuthToken.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('refreshes a token without a known expiry', async () => {
    mockRefreshOAuthToken.mockResolvedValue({
      access_token: 'fresh-access-token',
      expires_in: 3600,
    });

    await runJwt(
      baseToken({ accessTokenExpires: undefined as unknown as number }),
    );

    expect(mockRefreshOAuthToken).toHaveBeenCalledTimes(1);
  });

  it('does not refresh a short-lived token on every call', async () => {
    mockRefreshOAuthToken.mockResolvedValue({
      access_token: 'fresh-access-token',
      refresh_token: 'fresh-refresh-token',
      expires_in: 30,
    });

    const refreshed = await runJwt(baseToken());
    await runJwt(refreshed as Token);
    await runJwt(refreshed as Token);

    expect(mockRefreshOAuthToken).toHaveBeenCalledTimes(1);
  });

  it('keeps a short-lived token until close to its end, then refreshes it', async () => {
    mockRefreshOAuthToken.mockResolvedValue({
      access_token: 'fresh-access-token',
      expires_in: 30,
    });
    const fresh = {
      ...baseToken(),
      accessTokenLifetimeMs: 30_000,
      accessTokenExpires: Date.now() + 20_000,
    } as Token;
    const nearEnd = {
      ...fresh,
      accessTokenExpires: Date.now() + 3_000,
    } as Token;

    await runJwt(fresh);
    expect(mockRefreshOAuthToken).not.toHaveBeenCalled();

    await runJwt(nearEnd);
    expect(mockRefreshOAuthToken).toHaveBeenCalledTimes(1);
  });
});

describe('missing refresh token', () => {
  beforeEach(() => {
    resetRefreshMap();
    mockRefreshOAuthToken.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('is not reported while the access token is still valid', async () => {
    const result = await refreshAccessToken(
      baseToken({
        refreshToken: undefined as unknown as string,
        accessTokenExpires: Date.now() + 30_000,
        access_token: 'still-valid-access-token',
      }),
    );

    expect(mockRefreshOAuthToken).not.toHaveBeenCalled();
    expect((result as { error?: string }).error).toBeUndefined();
    expect((result as { access_token?: string }).access_token).toBe(
      'still-valid-access-token',
    );
  });

  it('is reported as soon as the access token has expired', async () => {
    const result = await refreshAccessToken(
      baseToken({
        refreshToken: undefined as unknown as string,
        accessTokenExpires: Date.now() - 1_000,
      }),
    );

    expect((result as { error?: string }).error).toBe('RefreshTokenExpired');
  });
});

describe('refresh failure logging', () => {
  beforeEach(() => {
    resetRefreshMap();
    mockRefreshOAuthToken.mockReset();
    (logError as jest.Mock).mockReset();
  });

  it('logs the failure through the shared logger without the token', async () => {
    const failure = new Error('network blip');
    mockRefreshOAuthToken.mockRejectedValue(failure);

    await refreshAccessToken(baseToken());

    expect(logError).toHaveBeenCalledTimes(1);
    const [loggedError, context, message] = (logError as jest.Mock).mock
      .calls[0];
    expect(loggedError).toBe(failure);
    expect(JSON.stringify(context)).not.toContain('old-refresh-token');
    expect(message).toContain('refreshing token');
  });
});

describe('jwt callback on sign-in', () => {
  const signIn = (account: Record<string, unknown>) =>
    callbacks.jwt({
      token: { sub: 'user-1' },
      account: { provider: 'google', access_token: 'a', ...account },
      user: { id: 'user-1' },
      profile: { job_title: 'Analyst' },
    } as never);

  beforeEach(() => {
    jest.useFakeTimers({ now: 1_700_000_000_000 });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('records expiry and lifetime from expires_in', async () => {
    const result = await signIn({ expires_in: 3600, refresh_token: 'r' });

    expect(result).toMatchObject({
      accessTokenExpires: 1_700_000_000_000 + 3_600_000,
      accessTokenLifetimeMs: 3_600_000,
      providerId: 'google',
      userId: 'user-1',
      jobTitle: 'Analyst',
      refreshToken: 'r',
    });
  });

  it('records expiry and lifetime from expires_at when expires_in is absent', async () => {
    const result = await signIn({ expires_at: 1_700_000_000 + 1800 });

    expect(result).toMatchObject({
      accessTokenExpires: (1_700_000_000 + 1800) * 1000,
      accessTokenLifetimeMs: 1_800_000,
    });
  });
});

describe('token serialization', () => {
  const secret = 'test-secret-test-secret-test-secret';
  const salt = 'next-auth.session-token';

  it('does not carry a cleared error into the session cookie', async () => {
    const healed = (await callbacks.jwt({
      token: baseToken({
        error: 'RefreshAccessTokenError',
        accessTokenExpires: Date.now() + 300_000,
      }),
      account: null,
      user: undefined,
    } as never)) as Token;

    const decoded = await decode({
      token: await encode({ token: healed, secret, salt }),
      secret,
      salt,
    });

    expect(decoded).not.toBeNull();
    expect(decoded).not.toHaveProperty('error');
  });
});
