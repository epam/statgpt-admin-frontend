/** @jest-environment jsdom */
/* global describe, it, expect, jest, beforeEach */
import { renderHook, act } from '@testing-library/react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { useTabQueryParam } from './use-tab-query-param';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

const mockedUseRouter = useRouter as jest.Mock;
const mockedUsePathname = usePathname as jest.Mock;
const mockedUseSearchParams = useSearchParams as jest.Mock;

const VALID_KEYS = ['grade-a', 'grade-c'] as const;

describe('useTabQueryParam', () => {
  const replace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ replace });
    mockedUsePathname.mockReturnValue('/channels/42');
  });

  it('returns the default key when the query param is missing', () => {
    mockedUseSearchParams.mockReturnValue(new URLSearchParams());

    const { result } = renderHook(() =>
      useTabQueryParam('tab', VALID_KEYS, 'grade-a'),
    );

    expect(result.current[0]).toBe('grade-a');
  });

  it('returns the default key when the query param is not a valid key', () => {
    mockedUseSearchParams.mockReturnValue(new URLSearchParams('tab=bogus'));

    const { result } = renderHook(() =>
      useTabQueryParam('tab', VALID_KEYS, 'grade-a'),
    );

    expect(result.current[0]).toBe('grade-a');
  });

  it('returns the query param value when it is a valid key', () => {
    mockedUseSearchParams.mockReturnValue(new URLSearchParams('tab=grade-c'));

    const { result } = renderHook(() =>
      useTabQueryParam('tab', VALID_KEYS, 'grade-a'),
    );

    expect(result.current[0]).toBe('grade-c');
  });

  it('replaces the URL with the new tab value without pushing history', () => {
    mockedUseSearchParams.mockReturnValue(new URLSearchParams('tab=grade-a'));

    const { result } = renderHook(() =>
      useTabQueryParam('tab', VALID_KEYS, 'grade-a'),
    );

    act(() => {
      result.current[1]('grade-c');
    });

    expect(replace).toHaveBeenCalledWith('/channels/42?tab=grade-c', {
      scroll: false,
    });
  });

  it('preserves other existing query params when switching tabs', () => {
    mockedUseSearchParams.mockReturnValue(
      new URLSearchParams('tab=grade-a&foo=bar'),
    );

    const { result } = renderHook(() =>
      useTabQueryParam('tab', VALID_KEYS, 'grade-a'),
    );

    act(() => {
      result.current[1]('grade-c');
    });

    expect(replace).toHaveBeenCalledWith('/channels/42?tab=grade-c&foo=bar', {
      scroll: false,
    });
  });
});
