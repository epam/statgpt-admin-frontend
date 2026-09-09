import { getIsDiscoveryDatasetsEnabled } from '@/src/utils/feature-flags';
import { ApiResult } from './api';

const NOT_FOUND_MESSAGE = 'Not Found';

/**
 * Guards a Grade C (discovery) datasets route handler. Returns a 404 response
 * to answer with when the feature is disabled, or `null` when the handler
 * should proceed. The response mirrors the catch-all API route, so a disabled
 * endpoint is indistinguishable from one that does not exist.
 */
export function guardDiscoveryDatasetsEnabled(): Response | null {
  if (getIsDiscoveryDatasetsEnabled()) return null;

  return Response.json({ error: NOT_FOUND_MESSAGE }, { status: 404 });
}

/**
 * Guards a Grade C (discovery) datasets server action. Returns a failed
 * `ApiResult` to return when the feature is disabled, or `null` when the
 * action should proceed.
 */
export function guardDiscoveryDatasetsEnabledResult<R>(): ApiResult<R> | null {
  if (getIsDiscoveryDatasetsEnabled()) return null;

  return { ok: false, error: { status: 404, message: NOT_FOUND_MESSAGE } };
}
