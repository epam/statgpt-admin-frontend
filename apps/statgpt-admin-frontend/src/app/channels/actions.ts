'use server';

import { cookies, headers } from 'next/headers';

import { channelsApi } from '@/src/app/api/api';
import { Channel, ChannelTerm } from '@/src/models/channel';
import type { DeduplicationJob } from '@/src/models/deduplication-job';
import {
  DiscoveryIndexingJobStatus,
  type DiscoveryIndexingJob,
} from '@/src/models/discovery-dataset';
import type { RequestData } from '@/src/models/request-data';
import type { ApiResult } from '@/src/server/api';
import { logger } from '@/src/server/logger';
import { getUserToken } from '@/src/utils/auth/get-token';
import { getIsEnableAuthToggle } from '@/src/utils/get-auth-toggle';

export async function createChannel(channel: Channel) {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  return channelsApi.createChannel(channel, token);
}

export async function getChannel(id: string) {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  return channelsApi.getChannel(id, token);
}

export async function deduplicateDataset(
  id: string,
): Promise<ApiResult<DeduplicationJob>> {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  return channelsApi.deduplicateDataset(id, token);
}

export async function getDeduplicationJob(
  jobId: string | number,
): Promise<ApiResult<DeduplicationJob>> {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  return channelsApi.getDeduplicationJob(jobId, token);
}

export async function removeChannel(id: string) {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  return channelsApi.removeChannel(id, token);
}

export async function updateChannel(channel: Channel) {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  return channelsApi.updateChannel(channel, token);
}

export async function getChannelTerms(id: string) {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  return channelsApi.getChannelTerms(id, token);
}

export async function getChannelJobs(id: string) {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  return channelsApi.getChannelJobs(id, token);
}

export async function getChannelDatasets(id: string) {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  return channelsApi.getChannelDataset(id, token);
}

export async function addTerm(id: string, term: ChannelTerm) {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  return channelsApi.addTerm(id, term, token);
}

export async function updateChannelTerms(term: ChannelTerm) {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  return channelsApi.updateChannelTerms(term, token);
}

export async function removeChannelTerm(termId: string) {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  return channelsApi.removeChannelTerm(termId, token);
}

export async function removeChannelTerms(id: string) {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  return channelsApi.removeChannelTerms(id, token);
}

export async function exportChannel(id: string) {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  return channelsApi.exportChannel(id, token);
}

export async function getChannelDatasetAutoUpdateJobs(
  channelId: string,
  datasetId: string,
) {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  return channelsApi.getChannelDatasetAutoUpdateJobs(
    channelId,
    datasetId,
    token,
  );
}

export async function getChannelIndexStatus(id: string) {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  return channelsApi.getChannelIndexStatus(id, token);
}

const logIfFailed = (job: DiscoveryIndexingJob) => {
  if (job.status === DiscoveryIndexingJobStatus.Failed) {
    logger.error(
      `Discovery indexing job ${job.id} for channel ${job.channelId} failed: ${job.reasonForFailure}`,
    );
  }
};

export async function triggerDiscoveryIndexingJob(
  id: string,
  force: boolean,
): Promise<ApiResult<DiscoveryIndexingJob>> {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  const result = await channelsApi.triggerDiscoveryIndexingJob(
    id,
    force,
    token,
  );
  if (result.ok) logIfFailed(result.data);
  return result;
}

export async function getLatestDiscoveryIndexingJob(
  id: string,
): Promise<ApiResult<RequestData<DiscoveryIndexingJob>>> {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  return channelsApi.listDiscoveryIndexingJobs(id, 1, 0, token);
}

export async function getDiscoveryIndexingJob(
  jobId: string | number,
): Promise<ApiResult<DiscoveryIndexingJob>> {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  const result = await channelsApi.getDiscoveryIndexingJob(jobId, token);
  if (result.ok) logIfFailed(result.data);
  return result;
}
