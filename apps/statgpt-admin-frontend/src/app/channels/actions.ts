'use server';

import { cookies, headers } from 'next/headers';

import { channelsApi } from '@/src/app/api/api';
import { Channel, ChannelTerm } from '@/src/models/channel';
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

export async function importChannel(
  formData: FormData,
  updateDatasets: boolean,
  updateDataSources: boolean,
  cleanUp: boolean,
) {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  return channelsApi.importChannel(
    formData,
    updateDatasets,
    updateDataSources,
    cleanUp,
    token,
  );
}
