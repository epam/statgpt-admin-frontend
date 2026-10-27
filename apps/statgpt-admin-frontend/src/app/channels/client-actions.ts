import { withAuthRetryAction } from '@/src/utils/client/auth-retry';
import {
  createChannel as createChannelAction,
  getChannel as getChannelAction,
  deduplicateDataset as deduplicateDatasetAction,
  getDeduplicationJob as getDeduplicationJobAction,
  removeChannel as removeChannelAction,
  updateChannel as updateChannelAction,
  getChannelTerms as getChannelTermsAction,
  getChannelJobs as getChannelJobsAction,
  getChannelDatasets as getChannelDatasetsAction,
  addTerm as addTermAction,
  updateChannelTerms as updateChannelTermsAction,
  removeChannelTerm as removeChannelTermAction,
  removeChannelTerms as removeChannelTermsAction,
  exportChannel as exportChannelAction,
  getChannelDatasetAutoUpdateJobs as getChannelDatasetAutoUpdateJobsAction,
  getChannelIndexStatus as getChannelIndexStatusAction,
  triggerDiscoveryIndexingJob as triggerDiscoveryIndexingJobAction,
  getLatestDiscoveryIndexingJob as getLatestDiscoveryIndexingJobAction,
  getDiscoveryIndexingJob as getDiscoveryIndexingJobAction,
} from './actions';

/**
 * Client-side versions of the channel server actions: each one refreshes the
 * session and retries once when the backend answers 401. Client components
 * must import from here instead of `./actions`.
 */
export const createChannel = withAuthRetryAction(createChannelAction);
export const getChannel = withAuthRetryAction(getChannelAction);
export const deduplicateDataset = withAuthRetryAction(deduplicateDatasetAction);
export const getDeduplicationJob = withAuthRetryAction(
  getDeduplicationJobAction,
);
export const removeChannel = withAuthRetryAction(removeChannelAction);
export const updateChannel = withAuthRetryAction(updateChannelAction);
export const getChannelTerms = withAuthRetryAction(getChannelTermsAction);
export const getChannelJobs = withAuthRetryAction(getChannelJobsAction);
export const getChannelDatasets = withAuthRetryAction(getChannelDatasetsAction);
export const addTerm = withAuthRetryAction(addTermAction);
export const updateChannelTerms = withAuthRetryAction(updateChannelTermsAction);
export const removeChannelTerm = withAuthRetryAction(removeChannelTermAction);
export const removeChannelTerms = withAuthRetryAction(removeChannelTermsAction);
export const exportChannel = withAuthRetryAction(exportChannelAction);
export const getChannelDatasetAutoUpdateJobs = withAuthRetryAction(
  getChannelDatasetAutoUpdateJobsAction,
);
export const getChannelIndexStatus = withAuthRetryAction(
  getChannelIndexStatusAction,
);
export const triggerDiscoveryIndexingJob = withAuthRetryAction(
  triggerDiscoveryIndexingJobAction,
);
export const getLatestDiscoveryIndexingJob = withAuthRetryAction(
  getLatestDiscoveryIndexingJobAction,
);
export const getDiscoveryIndexingJob = withAuthRetryAction(
  getDiscoveryIndexingJobAction,
);
