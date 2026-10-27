/**
 * Client-side versions of the data source server actions: each one refreshes
 * the session and retries once when the backend answers 401. Client
 * components must import from here instead of `./actions`.
 */
import { withAuthRetryAction } from '@/src/utils/client/auth-retry';
import {
  loadProviders as loadProvidersAction,
  loadAvailableDataSets as loadAvailableDataSetsAction,
  getDataSources as getDataSourcesAction,
  createDataSource as createDataSourceAction,
  updateDataSources as updateDataSourcesAction,
  getDataSourcesTypes as getDataSourcesTypesAction,
} from './actions';

export const loadProviders = withAuthRetryAction(loadProvidersAction);
export const loadAvailableDataSets = withAuthRetryAction(
  loadAvailableDataSetsAction,
);
export const getDataSources = withAuthRetryAction(getDataSourcesAction);
export const createDataSource = withAuthRetryAction(createDataSourceAction);
export const updateDataSources = withAuthRetryAction(updateDataSourcesAction);
export const getDataSourcesTypes = withAuthRetryAction(
  getDataSourcesTypesAction,
);
