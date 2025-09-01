import { JWT } from 'next-auth/jwt';

import { getApiHeaders } from '@/src/utils/auth/api-headers';

export const ADMIN = '';
export const API = 'api/v1';
export const MAIN_API = `${ADMIN}/${API}`;

export const CACHE: RequestInit = { cache: 'no-store' };

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
    const reader = res?.body?.getReader();
    const steam = new ReadableStream({
      start(controller) {
        return pump();
        function pump(): unknown {
          return reader?.read().then(({ done, value }) => {
            // When no more data needs to be consumed, close the stream
            if (done) {
              controller.close();
              return;
            }
            // Enqueue the next data chunk into our target stream
            controller.enqueue(value);
            return pump();
          });
        }
      },
    });
    return new Response(steam);
  } catch (e) {
    console.error('Error', e);
    return new Promise(() => null);
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
  } catch {
    return new Promise(() => null);
  }
};
