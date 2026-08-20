import pino from 'pino';
import pretty from 'pino-pretty';

import type { ApiError } from './api';

const stream = pretty({
  colorize: true,
  messageFormat: '{msg} [trace_id={trace_id}, span_id={span_id}]',
  translateTime: 'yyyy-mm-dd HH:MM:ss.l o',
});

export const logger = pino(stream);

export const logError = (
  error: unknown,
  context: Record<string, unknown>,
  message: string,
) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack =
    error instanceof Error ? error.stack : 'No stack trace available';

  logger.error(
    {
      error: {
        message: errorMessage,
        stack: errorStack,
      },
      ...context,
    },
    message,
  );
};

/**
 * Logs a failed API call with everything needed to locate the cause:
 * HTTP status (0 means the request never reached an HTTP response), the
 * actionable hint and the raw network diagnostics attached by `sendRequestSafe`.
 */
export const logApiFailure = (
  entity: string,
  error: ApiError,
  context: Record<string, unknown> = {},
) => {
  logger.error(
    {
      entity,
      status: error.status,
      reachedUpstream: error.status !== 0,
      details: error.details,
      diagnostics: error.raw,
      ...context,
    },
    `Getting ${entity} error: ${error.message}${
      error.status === 0 ? ' (no HTTP response - see diagnostics)' : ''
    }`,
  );
};
