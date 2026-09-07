import { JWT } from 'next-auth/jwt';
import { getApiHeaders } from '@/src/utils/auth/api-headers';
import { ApiResult, sendRequestSafe, streamRequest } from './api';

export interface BaseApiConfig {
  host?: string;
  dial?: string;
  dialKey?: string;
  dialTemp?: string;
}

export class BaseApi {
  protected config: BaseApiConfig;

  constructor(config: BaseApiConfig) {
    this.config = config;
  }

  protected delete<T extends object, R>(
    url: string,
    token?: JWT | null,
    dto?: T,
  ): Promise<ApiResult<R>> {
    return this.sendRequestSafe<T, R>(
      url,
      'DELETE',
      dto,
      void 0,
      void 0,
      token,
    );
  }

  protected put<T extends object, R>(
    url: string,
    dto: T,
    qs?: Record<string, string>,
    initHeaders?: HeadersInit,
    token?: JWT | null,
  ): Promise<ApiResult<R>> {
    return this.sendRequestSafe<T, R>(url, 'PUT', dto, qs, initHeaders, token);
  }

  protected post<T extends object, R>(
    url: string,
    dto: T,
    qs?: Record<string, string>,
    initHeaders?: HeadersInit,
    token?: JWT | null,
  ): Promise<ApiResult<R>> {
    return this.sendRequestSafe<T, R>(url, 'POST', dto, qs, initHeaders, token);
  }

  protected streamRequest(url: string, token?: JWT | null) {
    return streamRequest(`${this.config.host}${url}`, 'GET', token);
  }

  protected get<R extends object>(
    url: string,
    token?: JWT | null,
    tempUrl = false,
  ): Promise<ApiResult<R>> {
    return this.sendRequestSafe<object, R>(
      url,
      'GET',
      void 0,
      void 0,
      void 0,
      token,
      tempUrl,
    );
  }

  protected getRaw<R extends object>(
    url: string,
    token?: JWT | null,
    tempUrl = false,
  ): Promise<R | null> {
    return this.sendRequest<object, R>(
      url,
      'GET',
      void 0,
      void 0,
      void 0,
      token,
      tempUrl,
    );
  }

  private async sendRequest<T extends object, R>(
    url: string,
    type: string,
    dto?: T,
    _qs?: Record<string, string>,
    initHeaders?: HeadersInit,
    token?: JWT | null,
    tempUrl = false,
  ): Promise<R | null> {
    const apiKey = this.config.dialKey
      ? { 'Api-key': this.config.dialKey }
      : {};
    const fullUrl = `${tempUrl ? this.config.dialTemp : this.config.host || this.config.dial}${url}`;
    try {
      const r = await fetch(fullUrl, {
        body: dto instanceof FormData ? dto : JSON.stringify(dto),
        method: type,
        cache: 'no-store',
        headers: {
          ...initHeaders,
          ...apiKey,
          ...getApiHeaders(
            { jwt: token?.access_token },
            dto instanceof FormData,
          ),
        } as HeadersInit,
      });
      if (!(r.status >= 200 && r.status < 300)) {
        console.error('Request error Url', r.url);
        const text = await r.text();
        console.error('Request error', r.status, text);
        return null;
      }
      return (type === 'DELETE' ? await r.text() : await r.json()) as R;
    } catch (e) {
      console.error('Error', e);
      return null;
    }
  }

  private sendRequestSafe<T extends object, R>(
    url: string,
    type: string,
    dto?: T,
    qs?: Record<string, string>,
    initHeaders?: HeadersInit,
    token?: JWT | null,
    tempUrl = false,
  ): Promise<ApiResult<R>> {
    const apiKey = this.config.dialKey
      ? { 'Api-key': this.config.dialKey }
      : {};

    return sendRequestSafe(
      `${tempUrl ? this.config.dialTemp : this.config.host || this.config.dial}${url}`,
      type,
      dto,
      qs,
      { ...initHeaders, ...apiKey } as HeadersInit,
      token,
    );
  }
}
