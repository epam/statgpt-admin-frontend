'use server';

import { cookies, headers } from 'next/headers';

import { dataSourcesApi } from '@/src/app/api/api';
import { DataSource } from '@/src/models/data-source';
import { getUserToken } from '@/src/utils/auth/get-token';
import { getIsEnableAuthToggle } from '@/src/utils/get-auth-toggle';

export async function loadAvailableDataSets(id: number) {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  return dataSourcesApi.loadAvailableDataSets(id.toString(), token);
}

export async function getDataSources() {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  return dataSourcesApi.getDataSources(token);
}

export async function createDataSource(ds: DataSource) {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  return dataSourcesApi.createDataSource(ds, token);
}

export async function updateDataSources(ds: DataSource) {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  return dataSourcesApi.updateDataSources(ds, token);
}

export async function getDataSourcesTypes() {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  return dataSourcesApi.getDataSourcesTypes(token);
}
