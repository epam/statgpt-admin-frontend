import { JWT } from 'next-auth/jwt';

import { getApiHeaders } from '@/src/utils/auth/api-headers';

export const ADMIN = '';
export const API = 'api/v1';
export const MAIN_API = `${ADMIN}/${API}`;

export const CACHE: RequestInit = { cache: 'no-store' };
const PREVIEW_BODY_LENGTH = 1000;

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
