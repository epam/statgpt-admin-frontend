/** @jest-environment node */
/* global describe, it, expect */
import {
  REFRESH_FETCH_TIMEOUT_MS,
  WAIT_REFRESH_TOKEN_TIMEOUT_MS,
} from './refresh-token-timing';

describe('refresh-token-timing', () => {
  it('derives the wait timeout from the fetch timeout instead of an independent constant', () => {
    expect(WAIT_REFRESH_TOKEN_TIMEOUT_MS).toBeGreaterThan(
      REFRESH_FETCH_TIMEOUT_MS,
    );
  });

  it('gives waiters at least a 1 second margin over the fetch timeout', () => {
    expect(
      WAIT_REFRESH_TOKEN_TIMEOUT_MS - REFRESH_FETCH_TIMEOUT_MS,
    ).toBeGreaterThanOrEqual(1_000);
  });
});
