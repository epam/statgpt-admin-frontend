'use server';

import { cookies, headers } from 'next/headers';

import { dataSetsApi } from '@/src/app/api/api';
import { DataSet } from '@/src/models/data-sets';
import { getUserToken } from '@/src/utils/auth/get-token';
import { getIsEnableAuthToggle } from '@/src/utils/get-auth-toggle';

export async function createDataSet(ds: DataSet) {
  const token = await getUserToken(
    getIsEnableAuthToggle(),
    headers(),
    cookies(),
  );
  return dataSetsApi.createDataSet(ds, token);
}
