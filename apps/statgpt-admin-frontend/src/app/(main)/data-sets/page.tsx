import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { dataSetsApi } from '@/src/app/api/api';
import { ForbiddenTrigger } from '@/src/components/NoAccess/ForbiddenTrigger';
import { SIGN_IN_LINK } from '@/src/constants/auth';
import { DataSet } from '@/src/models/data-sets';
import { DataSetsView } from './DataSetsView';
import { RequestData } from '@/src/models/request-data';
import { logApiFailure } from '@/src/server/logger';
import { getIsInvalidSession, getUserToken } from '@/src/utils/auth/get-token';
import { getIsEnableAuthToggle } from '@/src/utils/get-auth-toggle';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const isEnableAuth = getIsEnableAuthToggle();
  const token = await getUserToken(isEnableAuth, headers(), cookies());
  const isInvalidSession = await getIsInvalidSession(isEnableAuth, token);

  if (isInvalidSession) {
    return redirect(SIGN_IN_LINK);
  }

  let data = { data: [] as DataSet[] } as RequestData<DataSet> | null;

  const result = await dataSetsApi.getDataSets(token);
  if (result.ok) {
    data = result.data;
  } else if (result.error.status === 403) {
    return <ForbiddenTrigger />;
  } else {
    logApiFailure('data sets', result.error);
  }

  const rows = data?.data ?? [];
  const dataSources = rows
    .map((ds) => (ds as Record<string, any>).data_source?.title)
    .filter((t): t is string => typeof t === 'string');

  return (
    <DataSetsView
      data={rows}
      dataSources={dataSources}
      initialError={result.ok ? null : result.error.message}
    />
  );
}
