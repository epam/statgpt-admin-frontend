import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { dataSourcesApi } from '@/src/app/api/api';
import { ListView } from '@/src/components/ListView/ListView';
import { MainShell } from '@/src/components/MainShell/MainShell';
import { NoAccessView } from '@/src/components/NoAccess/NoAccessView';
import { SIGN_IN_LINK } from '@/src/constants/auth';
import { DATA_SOURCE_COLUMNS_WITH_ACTIONS } from '@/src/constants/columns/grid-columns';
import { Menu } from '@/src/constants/menu';
import { DataSource } from '@/src/models/data-source';
import { RequestData } from '@/src/models/request-data';
import { logger } from '@/src/server/logger';
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

  let data = { data: [] as DataSource[] } as RequestData<DataSource> | null;

  const result = await dataSourcesApi.getDataSources(token);
  if (result.ok) {
    data = result.data;
  } else if (result.error.status === 403) {
    return <NoAccessView />;
  } else {
    logger.error(`Getting data sources error ${result.error.message}`);
  }

  return (
    <MainShell>
      <ListView
        menuItem={Menu.DATA_SOURCES}
        colDefs={DATA_SOURCE_COLUMNS_WITH_ACTIONS}
        data={data?.data || []}
        emptyDataTitle="No Data Sources"
        initialError={result.ok ? null : result.error.message}
      />
    </MainShell>
  );
}
