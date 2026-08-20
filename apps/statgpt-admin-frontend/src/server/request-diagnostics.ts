/**
 * Diagnostics helpers for outgoing `fetch` calls.
 *
 * This module is imported from both the server and the client bundle
 * (see `./api`), so it must not depend on `pino` or on any node built-in.
 */

const REDACTED = '***';

export type NetworkErrorKind =
  | 'dns'
  | 'connection-refused'
  | 'connection-reset'
  | 'timeout'
  | 'tls'
  | 'aborted'
  | 'invalid-url'
  | 'unknown';

export interface CauseDetails {
  name?: string;
  message?: string;
  code?: string;
  errno?: number;
  syscall?: string;
  hostname?: string;
  address?: string;
  port?: number;
}

export interface FetchFailureDetails {
  kind: NetworkErrorKind;
  /** Short summary — safe to show in the UI. */
  message: string;
  /** What to check next; printed in the server logs. */
  hint: string;
  method: string;
  url: string;
  host: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  /** Unwrapped `cause` chain — where node hides ENOTFOUND & friends. */
  causes: CauseDetails[];
  /** Env var the base URL came from, when the caller knows it. */
  baseUrlSource?: string;
}

/** Strips the query string and credentials so URLs are safe to log. */
export const safeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    if (parsed.username || parsed.password) {
      parsed.username = REDACTED;
      parsed.password = REDACTED;
    }
    return parsed.search
      ? `${parsed.origin}${parsed.pathname}?${REDACTED}`
      : `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url;
  }
};

export const getHost = (url: string): string => {
  try {
    return new URL(url).host;
  } catch {
    return '<unparsable url>';
  }
};

const unwrapCauses = (error: unknown, limit = 5): CauseDetails[] => {
  const causes: CauseDetails[] = [];
  let current: unknown = error;

  while (current && causes.length < limit) {
    const candidate = current as Record<string, unknown>;

    if (current !== error) {
      causes.push({
        name: typeof candidate.name === 'string' ? candidate.name : undefined,
        message:
          typeof candidate.message === 'string' ? candidate.message : undefined,
        code: typeof candidate.code === 'string' ? candidate.code : undefined,
        errno:
          typeof candidate.errno === 'number' ? candidate.errno : undefined,
        syscall:
          typeof candidate.syscall === 'string' ? candidate.syscall : undefined,
        hostname:
          typeof candidate.hostname === 'string'
            ? candidate.hostname
            : undefined,
        address:
          typeof candidate.address === 'string' ? candidate.address : undefined,
        port: typeof candidate.port === 'number' ? candidate.port : undefined,
      });
    }

    current = candidate.cause;
  }

  return causes;
};

const collectCodes = (error: unknown, causes: CauseDetails[]): string[] => {
  const ownCode = (error as { code?: unknown } | null)?.code;
  const causeCodes = causes
    .map((cause) => cause.code)
    .filter((code): code is string => Boolean(code));

  return typeof ownCode === 'string' ? [ownCode, ...causeCodes] : causeCodes;
};

const isTlsCode = (code: string): boolean =>
  code.startsWith('ERR_TLS') ||
  code.startsWith('ERR_SSL') ||
  code === 'CERT_HAS_EXPIRED' ||
  code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
  code === 'DEPTH_ZERO_SELF_SIGNED_CERT' ||
  code === 'SELF_SIGNED_CERT_IN_CHAIN';

const classify = (error: unknown, codes: string[]): NetworkErrorKind => {
  if (codes.includes('ENOTFOUND') || codes.includes('EAI_AGAIN')) {
    return 'dns';
  }
  if (codes.includes('ECONNREFUSED')) {
    return 'connection-refused';
  }
  if (codes.includes('ECONNRESET') || codes.includes('EPIPE')) {
    return 'connection-reset';
  }
  if (
    codes.includes('ETIMEDOUT') ||
    codes.includes('UND_ERR_CONNECT_TIMEOUT') ||
    codes.includes('UND_ERR_HEADERS_TIMEOUT') ||
    codes.includes('UND_ERR_BODY_TIMEOUT')
  ) {
    return 'timeout';
  }
  if (codes.some(isTlsCode)) {
    return 'tls';
  }
  if (codes.includes('ERR_INVALID_URL')) {
    return 'invalid-url';
  }
  if ((error as { name?: unknown } | null)?.name === 'AbortError') {
    return 'aborted';
  }
  return 'unknown';
};

const describe = (
  kind: NetworkErrorKind,
  host: string,
  codes: string[],
  baseUrlSource?: string,
): { message: string; hint: string } => {
  const code = codes[0] ? ` (${codes[0]})` : '';
  const source = baseUrlSource || 'the base URL env var';

  switch (kind) {
    case 'dns':
      return {
        message: `Network error: cannot resolve host "${host}"${code}.`,
        hint:
          `DNS lookup for "${host}" failed, so the request never left this process. ` +
          `Verify ${source}: the host may be misspelled, the preview/ephemeral environment may have been torn down, ` +
          `or the corporate VPN / cluster network may be required to resolve it.`,
      };
    case 'connection-refused':
      return {
        message: `Network error: connection refused by "${host}"${code}.`,
        hint: `"${host}" resolved but nothing is listening there. Check that the upstream service is up and that the port in ${source} is correct.`,
      };
    case 'connection-reset':
      return {
        message: `Network error: connection to "${host}" was reset${code}.`,
        hint: `The upstream or an intermediate proxy closed the connection. Check upstream logs and any ingress in front of "${host}".`,
      };
    case 'timeout':
      return {
        message: `Network error: request to "${host}" timed out${code}.`,
        hint: `"${host}" accepted the connection but did not answer in time. Check upstream health and network latency.`,
      };
    case 'tls':
      return {
        message: `Network error: TLS handshake with "${host}" failed${code}.`,
        hint: `Certificate validation failed for "${host}". Check the certificate chain, the scheme in ${source} (http vs https), and any corporate TLS interception.`,
      };
    case 'aborted':
      return {
        message: 'Request aborted before completion.',
        hint: 'The request was cancelled (navigation away, or an AbortController fired).',
      };
    case 'invalid-url':
      return {
        message: 'Request failed: the request URL is invalid.',
        hint: `The composed URL is not a valid absolute URL. ${source} is most likely empty or missing its scheme (e.g. "https://").`,
      };
    default:
      return {
        message: 'Request failed before a response was received.',
        hint: 'No HTTP response was received. Inspect the "causes" field for the underlying node error.',
      };
  }
};

export const describeFetchFailure = (
  url: string,
  method: string,
  error: unknown,
  baseUrlSource?: string,
): FetchFailureDetails => {
  const causes = unwrapCauses(error);
  const codes = collectCodes(error, causes);
  const host = getHost(url);
  const kind = classify(error, codes);
  const { message, hint } = describe(kind, host, codes, baseUrlSource);

  return {
    kind,
    message,
    hint,
    method,
    url: safeUrl(url),
    host,
    error: {
      name: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    },
    causes,
    baseUrlSource,
  };
};

/** Single-line summary used as a log prefix and as the UI-facing message. */
export const formatFetchFailure = (details: FetchFailureDetails): string =>
  `${details.method} ${details.url} failed [${details.kind}] - ${details.message} ${details.hint}`;

/**
 * `console` is used deliberately instead of the pino logger: this module is
 * reachable from the client bundle, where pino cannot be bundled.
 */

/** Set API_DEBUG=true to log every outgoing request, not only the failures. */
export const isRequestTracingEnabled = () => process.env.API_DEBUG === 'true';

export const logRequestStart = (
  method: string,
  url: string,
  hasToken: boolean,
) => {
  if (isRequestTracingEnabled()) {
    console.info(
      `[api] -> ${method} ${safeUrl(url)} (auth=${hasToken ? 'bearer' : 'none'})`,
    );
  }
};

export const logRequestEnd = (
  method: string,
  url: string,
  status: number,
  startedAt: number,
) => {
  if (isRequestTracingEnabled()) {
    console.info(
      `[api] <- ${status} ${method} ${safeUrl(url)} in ${Date.now() - startedAt}ms`,
    );
  }
};

/**
 * Details are serialized into the message itself: Next.js' dev logger drops
 * extra `console` arguments, so a second object argument would print as `{}`.
 */
export const asLogDetails = (details: Record<string, unknown>): string =>
  `
  details: ${JSON.stringify(details, null, 2)}`;

/** Logs a response that arrived but carried a non-2xx status. */
export const logResponseError = (
  method: string,
  url: string,
  response: Response,
  startedAt: number,
  payload: unknown,
) => {
  console.error(
    `[api] HTTP ${response.status} ${response.statusText || ''} ${method} ${safeUrl(url)} in ${Date.now() - startedAt}ms` +
      asLogDetails({
        requestedUrl: safeUrl(url),
        // Differs from the requested URL on a redirect (e.g. an SSO login page).
        responseUrl: safeUrl(response.url),
        status: response.status,
        redirected: response.redirected,
        contentType: response.headers.get('content-type'),
        payload,
      }),
  );
};

/**
 * Logs a `fetch` that never produced a response, with everything needed to tell
 * a configuration problem apart from an upstream problem: the exact URL, the
 * host, the env var the base URL came from, and the unwrapped node `cause`.
 */
export const logFetchFailure = (
  method: string,
  url: string,
  error: unknown,
  startedAt: number,
  baseUrlSource?: string,
): FetchFailureDetails => {
  const details = describeFetchFailure(url, method, error, baseUrlSource);

  console.error(
    `[api] ${formatFetchFailure(details)} (after ${Date.now() - startedAt}ms)` +
      asLogDetails({
        kind: details.kind,
        method: details.method,
        url: details.url,
        host: details.host,
        baseUrlSource: details.baseUrlSource,
        error: details.error,
        causes: details.causes,
      }),
  );

  return details;
};
