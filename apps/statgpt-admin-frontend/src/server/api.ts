import { JWT } from 'next-auth/jwt';

import { getApiHeaders } from '@/src/utils/auth/api-headers';
import { parseApiError } from './api-error-parser';

export const ADMIN = '';
export const API = 'api/v1';
export const MAIN_API = `${ADMIN}/${API}`;

export const CACHE: RequestInit = { cache: 'no-store' };
const PREVIEW_BODY_LENGTH = 1000;

export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
  raw?: unknown;
}

export type ApiResult<R> =
  | {
      ok: true;
      data: R;
    }
  | {
      ok: false;
      error: ApiError;
    };

export const sendPostRequest = <T extends object, R>(
  url: string,
  dto?: T,
  qs?: Record<string, string>,
  initHeaders?: HeadersInit,
): Promise<R | null> => {
  return sendRequest(url, 'POST', dto, qs, initHeaders);
};

export const sendPutRequest = <T extends object, R>(
  url: string,
  dto?: T,
  qs?: Record<string, string>,
  initHeaders?: HeadersInit,
): Promise<R | null> => {
  return sendRequest(url, 'PUT', dto, qs, initHeaders);
};

export const sendGetRequest = <T extends object, R>(
  url: string,
  dto?: T,
  qs?: Record<string, string>,
  initHeaders?: HeadersInit,
): Promise<R | null> => {
  return sendRequest(url, 'GET', dto, qs, initHeaders);
};

export const sendDeleteRequest = <R>(url: string): Promise<R | null> => {
  return sendRequest(url, 'DELETE');
};

export const sendPostRequestSafe = <T extends object, R>(
  url: string,
  dto?: T,
  qs?: Record<string, string>,
  initHeaders?: HeadersInit,
): Promise<ApiResult<R>> => {
  return sendRequestSafe(url, 'POST', dto, qs, initHeaders);
};

export const sendPutRequestSafe = <T extends object, R>(
  url: string,
  dto?: T,
  qs?: Record<string, string>,
  initHeaders?: HeadersInit,
): Promise<ApiResult<R>> => {
  return sendRequestSafe(url, 'PUT', dto, qs, initHeaders);
};

export const sendDeleteRequestSafe = <R>(
  url: string,
): Promise<ApiResult<R>> => {
  return sendRequestSafe(url, 'DELETE');
};

export const streamRequest = async (
  url: string,
  type: string,
  token?: JWT | null,
) => {
  try {
    const res = await fetch(url, {
      method: type,
      cache: 'no-store',
      headers: {
        ...getApiHeaders({ jwt: token?.access_token }, true),
      },
    });

    const contentType = res.headers.get('content-type');
    if (!res.ok && contentType?.toLowerCase().includes('text/html')) {
      const bodyPreview = (await res.text()).slice(0, PREVIEW_BODY_LENGTH);
      console.error(
        'Proxy error: Unexpected HTML response from upstream',
        res.status,
        bodyPreview,
      );
      return Response.json(
        { error: 'Unexpected HTML response from upstream service' },
        { status: 502 },
      );
    }

    const headers = new Headers(res.headers);

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });
  } catch (e) {
    console.error('Error', e);
    return Response.json({ error: 'Proxy error' }, { status: 500 });
  }
};

export const sendRequest = async <T extends object, R>(
  url: string,
  type: string,
  dto?: T,
  qs?: Record<string, string>,
  initHeaders?: HeadersInit,
  token?: JWT | null,
): Promise<R | null> => {
  try {
    return fetch(url, {
      body: dto instanceof FormData ? dto : JSON.stringify(dto),
      method: type,
      cache: 'no-store',
      headers: {
        ...initHeaders,
        ...getApiHeaders({ jwt: token?.access_token }, dto instanceof FormData),
      },
    }).then((r) => {
      if (!(r.status >= 200 && r.status < 300)) {
        console.error('Request error Url', r.url);

        return r.text().then((text) => {
          console.error('Request error', r.status, text);
          return null;
        });
      }
      return (type === 'DELETE' ? r.text() : r.json()) as Promise<R>;
    });
  } catch (e) {
    console.error('Error', e);
    return Promise.resolve(null);
  }
};

export const sendRequestSafe = async <T extends object, R>(
  url: string,
  type: string,
  dto?: T,
  qs?: Record<string, string>,
  initHeaders?: HeadersInit,
  token?: JWT | null,
): Promise<ApiResult<R>> => {
  try {
    const response = await fetch(url, {
      body: dto instanceof FormData ? dto : JSON.stringify(dto),
      method: type,
      cache: 'no-store',
      headers: {
        ...initHeaders,
        ...getApiHeaders({ jwt: token?.access_token }, dto instanceof FormData),
      },
    });

    if (!(response.status >= 200 && response.status < 300)) {
      console.error('Request error Url', response.url);

      const error = await parseApiError(response);
      console.error(
        'Request error',
        response.status,
        error.raw || error.message,
      );
      return { ok: false, error };
    }

    const data = (
      type === 'DELETE' ? await response.text() : await response.json()
    ) as R;
    return { ok: true, data };
  } catch (e) {
    console.error('Error', e);
    return {
      ok: false,
      error: {
        status: 0,
        message: 'Request failed',
        raw: e,
      },
    };
  }
};
