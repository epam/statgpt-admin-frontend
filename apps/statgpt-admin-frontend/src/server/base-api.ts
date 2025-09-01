import { JWT } from 'next-auth/jwt';
import { sendRequest, streamRequest } from './api';

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

  protected async delete<T extends object, R>(
    url: string,
    token?: JWT | null,
  ): Promise<R | null> {
    return this.sendRequest<T, R>(url, 'DELETE', void 0, void 0, void 0, token);
  }

  protected async put<T extends object, R>(
    url: string,
    dto: T,
    qs?: Record<string, string>,
    initHeaders?: HeadersInit,
    token?: JWT | null,
  ): Promise<R | null> {
    return this.sendRequest<T, R>(url, 'PUT', dto, qs, initHeaders, token);
  }

  protected async post<T extends object, R>(
    url: string,
    dto: T,
    qs?: Record<string, string>,
    initHeaders?: HeadersInit,
    token?: JWT | null,
  ): Promise<R | null> {
    return this.sendRequest<T, R>(url, 'POST', dto, qs, initHeaders, token);
  }

  protected streamRequest(url: string, token?: JWT | null) {
    return streamRequest(`${this.config.host}${url}`, 'GET', token);
  }

  protected get<R extends object>(
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

  private sendRequest<T extends object, R>(
    url: string,
    type: string,
    dto?: T,
    qs?: Record<string, string>,
    initHeaders?: HeadersInit,
    token?: JWT | null,
    tempUrl = false,
  ): Promise<R | null> {
    const apiKey = this.config.dialKey
      ? { 'Api-key': this.config.dialKey }
      : {};

    return sendRequest(
      `${tempUrl ? this.config.dialTemp : this.config.host || this.config.dial}${url}`,
      type,
      dto,
      qs,
      { ...initHeaders, ...apiKey } as HeadersInit,
      token,
    );
  }
}
