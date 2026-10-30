/** @jest-environment node */
/* global describe, it, expect, jest, beforeAll, beforeEach, afterAll, afterEach */
import { sendDeleteRequest, sendGetRequest, sendPostRequest } from './api';

const mockGetSession = jest.fn();

jest.mock('next-auth/react', () => ({
  getSession: () => mockGetSession(),
}));

const fetchMock = jest.fn();

const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

describe('client request helpers', () => {
  const originalFetch = global.fetch;

  beforeAll(() => {
    (globalThis as { window?: unknown }).window = globalThis;
  });

  afterAll(() => {
    delete (globalThis as { window?: unknown }).window;
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    fetchMock.mockReset();
    mockGetSession.mockReset();
    mockGetSession.mockResolvedValue({ user: {} });
    global.fetch = fetchMock as unknown as typeof fetch;
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('re-sends the same FormData after refreshing the session on 401', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(401, { detail: 'Could not validate credentials' }),
      )
      .mockResolvedValueOnce(jsonResponse(200, { created: 3 }));
    const formData = new FormData();
    formData.append('file', new Blob(['a,b']), 'datasets.csv');

    const result = await sendPostRequest<FormData, { created: number }>(
      '/api/v1/channels/1/discovery-datasets/upload?mode=upsert',
      formData,
    );

    expect(result).toEqual({ ok: true, data: { created: 3 } });
    expect(mockGetSession).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][1].body).toBe(formData);
    expect(fetchMock.mock.calls[1][1].body).toBe(formData);
  });

  it('retries a GET once after a 401', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { detail: 'expired' }))
      .mockResolvedValueOnce(jsonResponse(200, { items: [] }));

    const result = await sendGetRequest<{ items: unknown[] }>('/api/v1/x');

    expect(result).toEqual({ ok: true, data: { items: [] } });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retries a DELETE once after a 401', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { detail: 'expired' }))
      .mockResolvedValueOnce(new Response('', { status: 200 }));

    const result = await sendDeleteRequest('/api/v1/x/1');

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('surfaces the 401 when the session cannot be refreshed', async () => {
    mockGetSession.mockResolvedValue(null);
    fetchMock.mockResolvedValue(
      jsonResponse(401, { detail: 'Could not validate credentials' }),
    );

    const result = await sendPostRequest('/api/v1/x', { a: 1 });

    expect(result).toMatchObject({ ok: false, error: { status: 401 } });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not retry other errors', async () => {
    fetchMock.mockResolvedValue(jsonResponse(403, { detail: 'forbidden' }));

    const result = await sendGetRequest('/api/v1/x');

    expect(result).toMatchObject({ ok: false, error: { status: 403 } });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(mockGetSession).not.toHaveBeenCalled();
  });
});
