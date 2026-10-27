/** @jest-environment jsdom */
/* global describe, it, expect, jest, beforeEach */
import type { ApiResult } from '@/src/server/api';

import { withAuthRetry, withAuthRetryAction } from './auth-retry';

const mockGetSession = jest.fn();

jest.mock('next-auth/react', () => ({
  getSession: () => mockGetSession(),
}));

const ok = (data: string): ApiResult<string> => ({ ok: true, data });

const failure = (status: number): ApiResult<string> => ({
  ok: false,
  error: { status, message: `status ${status}` },
});

describe('withAuthRetry', () => {
  beforeEach(() => {
    mockGetSession.mockReset();
    mockGetSession.mockResolvedValue({ user: {} });
  });

  it('returns a successful result without touching the session', async () => {
    const send = jest.fn().mockResolvedValue(ok('data'));

    const result = await withAuthRetry(send);

    expect(result).toEqual(ok('data'));
    expect(send).toHaveBeenCalledTimes(1);
    expect(mockGetSession).not.toHaveBeenCalled();
  });

  it.each([400, 403, 404, 500])(
    'returns a %i error without refreshing or retrying',
    async (status) => {
      const send = jest.fn().mockResolvedValue(failure(status));

      const result = await withAuthRetry(send);

      expect(result).toEqual(failure(status));
      expect(send).toHaveBeenCalledTimes(1);
      expect(mockGetSession).not.toHaveBeenCalled();
    },
  );

  it('refreshes the session on 401 and retries once', async () => {
    const send = jest
      .fn()
      .mockResolvedValueOnce(failure(401))
      .mockResolvedValueOnce(ok('data'));

    const result = await withAuthRetry(send);

    expect(result).toEqual(ok('data'));
    expect(mockGetSession).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledTimes(2);
  });

  it('does not loop when the retry is rejected with 401 again', async () => {
    const send = jest.fn().mockResolvedValue(failure(401));

    const result = await withAuthRetry(send);

    expect(result).toEqual(failure(401));
    expect(mockGetSession).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledTimes(2);
  });

  it('shares one session refresh between concurrent 401s', async () => {
    let resolveSession: (value: unknown) => void = () => undefined;
    mockGetSession.mockReturnValue(
      new Promise((resolve) => {
        resolveSession = resolve;
      }),
    );
    const sendA = jest
      .fn()
      .mockResolvedValueOnce(failure(401))
      .mockResolvedValueOnce(ok('a'));
    const sendB = jest
      .fn()
      .mockResolvedValueOnce(failure(401))
      .mockResolvedValueOnce(ok('b'));

    const both = Promise.all([withAuthRetry(sendA), withAuthRetry(sendB)]);
    await new Promise((resolve) => setTimeout(resolve, 20));
    resolveSession({ user: {} });
    const [a, b] = await both;

    expect(a).toEqual(ok('a'));
    expect(b).toEqual(ok('b'));
    expect(mockGetSession).toHaveBeenCalledTimes(1);
  });

  it('refreshes again on a later 401 once the previous refresh has settled', async () => {
    const send = jest.fn().mockResolvedValue(failure(401));

    await withAuthRetry(send);
    await withAuthRetry(send);

    expect(mockGetSession).toHaveBeenCalledTimes(2);
  });

  it('returns the original 401 without retrying when there is no session', async () => {
    mockGetSession.mockResolvedValue(null);
    const send = jest.fn().mockResolvedValue(failure(401));

    const result = await withAuthRetry(send);

    expect(result).toEqual(failure(401));
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('returns the original 401 without retrying when the session carries an error', async () => {
    mockGetSession.mockResolvedValue({ error: 'RefreshAccessTokenError' });
    const send = jest.fn().mockResolvedValue(failure(401));

    const result = await withAuthRetry(send);

    expect(result).toEqual(failure(401));
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('returns the original 401 without retrying when fetching the session fails', async () => {
    mockGetSession.mockRejectedValue(new Error('network down'));
    const send = jest.fn().mockResolvedValue(failure(401));

    const result = await withAuthRetry(send);

    expect(result).toEqual(failure(401));
    expect(send).toHaveBeenCalledTimes(1);
  });
});

describe('withAuthRetryAction', () => {
  beforeEach(() => {
    mockGetSession.mockReset();
    mockGetSession.mockResolvedValue({ user: {} });
  });

  it('forwards the arguments and returns the action result', async () => {
    const action = jest.fn().mockResolvedValue(ok('data'));

    const result = await withAuthRetryAction(action)('42', { force: true });

    expect(result).toEqual(ok('data'));
    expect(action).toHaveBeenCalledWith('42', { force: true });
  });

  it('retries with the same arguments after a 401', async () => {
    const action = jest
      .fn()
      .mockResolvedValueOnce(failure(401))
      .mockResolvedValueOnce(ok('data'));

    const result = await withAuthRetryAction(action)('42', 7);

    expect(result).toEqual(ok('data'));
    expect(action).toHaveBeenCalledTimes(2);
    expect(action).toHaveBeenNthCalledWith(1, '42', 7);
    expect(action).toHaveBeenNthCalledWith(2, '42', 7);
    expect(mockGetSession).toHaveBeenCalledTimes(1);
  });
});
