/** @jest-environment node */
/* global describe, it, expect, jest */
import type { ApiResult } from '@/src/server/api';

import { withAuthRetry } from './auth-retry';

const mockGetSession = jest.fn();

jest.mock('next-auth/react', () => ({
  getSession: () => mockGetSession(),
}));

describe('withAuthRetry on the server', () => {
  it('never refreshes or retries outside the browser', async () => {
    const failure: ApiResult<string> = {
      ok: false,
      error: { status: 401, message: 'Unauthorized' },
    };
    const send = jest.fn().mockResolvedValue(failure);

    const result = await withAuthRetry(send);

    expect(result).toEqual(failure);
    expect(send).toHaveBeenCalledTimes(1);
    expect(mockGetSession).not.toHaveBeenCalled();
  });
});
