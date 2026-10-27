/** @jest-environment node */
/* global describe, it, expect, jest, beforeEach, afterEach, afterAll */
import { OAuthRefreshError, refreshOAuthToken } from './oauth-refresh';

const jsonResponse = (status: number, body: unknown): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as Response;

const fetchMock = jest.fn();

describe('refreshOAuthToken', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      AUTH_GOOGLE_CLIENT_ID: 'google-client-id',
      AUTH_GOOGLE_SECRET: 'google-secret',
      AUTH_KEYCLOAK_CLIENT_ID: 'keycloak-client-id',
      AUTH_KEYCLOAK_SECRET: 'keycloak-secret',
      AUTH_KEYCLOAK_HOST: 'https://keycloak.example.com/realms/test',
    };
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it('returns the token set on a successful response', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
      }),
    );

    const result = await refreshOAuthToken('google', 'old-refresh-token');

    expect(result.access_token).toBe('new-access-token');
    expect(result.refresh_token).toBe('new-refresh-token');
  });

  it('computes expires_at from expires_in when the provider omits it', async () => {
    const now = Date.now();
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { access_token: 'a', expires_in: 100 }),
    );

    const result = await refreshOAuthToken('google', 'old-refresh-token');

    expect(result.expires_at).toBeGreaterThanOrEqual(
      Math.floor(now / 1000) + 100,
    );
  });

  it('bounds discovery and token exchange by one shared 15s abort signal', async () => {
    const timeoutSpy = jest.spyOn(AbortSignal, 'timeout');
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(200, {
          token_endpoint: 'https://keycloak.example.com/token',
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse(200, { access_token: 'a', expires_in: 100 }),
      );

    await refreshOAuthToken('keycloak', 'old-refresh-token');

    const calls = fetchMock.mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
    expect(calls[1][1]?.signal).toBe(calls[0][1]?.signal);
    expect(timeoutSpy).toHaveBeenCalledTimes(1);
    expect(timeoutSpy).toHaveBeenCalledWith(15_000);
  });

  it('bounds the token exchange of a provider with a fixed endpoint', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { access_token: 'a', expires_in: 100 }),
    );

    await refreshOAuthToken('google', 'old-refresh-token');

    expect(fetchMock.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
  });

  it('throws OAuthRefreshError carrying the IdP error code on invalid_grant', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(400, {
        error: 'invalid_grant',
        error_description: 'Token has been expired or revoked.',
      }),
    );

    await expect(
      refreshOAuthToken('google', 'old-refresh-token'),
    ).rejects.toMatchObject({ code: 'invalid_grant' });
  });

  it('throws OAuthRefreshError without a code when the error response carries none', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(500, {}));

    let caught: unknown;
    try {
      await refreshOAuthToken('google', 'old-refresh-token');
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(OAuthRefreshError);
    expect((caught as OAuthRefreshError).code).toBeUndefined();
  });

  it('throws before any network call when the provider is not configured', async () => {
    delete process.env.AUTH_GOOGLE_SECRET;

    await expect(
      refreshOAuthToken('google', 'old-refresh-token'),
    ).rejects.toThrow('not configured');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
