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
): Promise<ApiResult<R>> => {
  return sendRequestSafe(url, 'POST', dto, qs, initHeaders);
};

export const sendGetRequest = <R extends object>(
  url: string,
): Promise<ApiResult<R>> => {
  return sendRequestSafe<object, R>(url, 'GET');
};

export const sendDeleteRequest = <R>(url: string): Promise<ApiResult<R>> => {
  return sendRequestSafe<object, R>(url, 'DELETE');
};

export function apiResultToResponse<R>(result: ApiResult<R>): Response {
  if (!result.ok) {
    return Response.json(
      { error: result.error.message },
      { status: result.error.status || 500 },
    );
  }
  return Response.json(result.data);
}

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
