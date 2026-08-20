import { JWT } from 'next-auth/jwt';
import { getApiHeaders } from '@/src/utils/auth/api-headers';
import { ApiResult, sendRequestSafe, streamRequest } from './api';
import {
  asLogDetails,
  logFetchFailure,
  logRequestEnd,
  logRequestStart,
  logResponseError,
} from './request-diagnostics';

export interface BaseApiConfig {
  host?: string;
  dial?: string;
  dialKey?: string;
  dialTemp?: string;
}

interface ResolvedUrl {
  fullUrl: string;
  /** Env var the base URL came from — the first thing to check on failure. */
  source: string;
}

export class BaseApi {
  protected config: BaseApiConfig;

  constructor(config: BaseApiConfig) {
    this.config = config;
  }

  /**
   * Composes the upstream URL and records which env var supplied the base, so
   * a failing request can be attributed to a specific piece of configuration.
   */
  private resolveUrl(url: string, tempUrl: boolean): ResolvedUrl {
    const { base, source } = tempUrl
      ? { base: this.config.dialTemp, source: 'dialTemp (DIAL_API_URL)' }
      : this.config.host
        ? { base: this.config.host, source: 'API_URL' }
        : { base: this.config.dial, source: 'DIAL_API_URL' };

    if (!base) {
      console.error(
        `[api] ${this.constructor.name}: base URL is not configured, request to "${url}" will fail - set ${source}` +
          asLogDetails(this.describeConfig()),
      );
    }

    return { fullUrl: `${base ?? ''}${url}`, source };
  }

  /** Presence-only view of the config — never logs keys or full URLs. */
  private describeConfig(): Record<string, string> {
    const describe = (value?: string) => {
      if (!value) {
        return '<empty>';
      }
      try {
        return new URL(value).host;
      } catch {
        return '<invalid url>';
      }
    };

    return {
      host: describe(this.config.host),
      dial: describe(this.config.dial),
      dialTemp: describe(this.config.dialTemp),
      dialKey: this.config.dialKey ? '<set>' : '<empty>',
    };
  }

  protected delete<T extends object, R>(
    url: string,
    token?: JWT | null,
  ): Promise<ApiResult<R>> {
    return this.sendRequestSafe<T, R>(
      url,
      'DELETE',
      void 0,
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
    const { fullUrl, source } = this.resolveUrl(url, false);
    return streamRequest(fullUrl, 'GET', token, source);
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
    const { fullUrl, source } = this.resolveUrl(url, tempUrl);
    const startedAt = Date.now();
    logRequestStart(type, fullUrl, Boolean(token?.access_token));
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
        const text = await r.text();
        logResponseError(type, fullUrl, r, startedAt, text);
        return null;
      }
      logRequestEnd(type, fullUrl, r.status, startedAt);
      return (type === 'DELETE' ? await r.text() : await r.json()) as R;
    } catch (e) {
      logFetchFailure(type, fullUrl, e, startedAt, source);
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
    const { fullUrl, source } = this.resolveUrl(url, tempUrl);

    return sendRequestSafe(
      fullUrl,
      type,
      dto,
      qs,
      { ...initHeaders, ...apiKey } as HeadersInit,
      token,
      source,
    );
  }
}
