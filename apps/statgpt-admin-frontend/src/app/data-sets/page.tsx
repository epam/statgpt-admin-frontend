import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { dataSetsApi } from '@/src/app/api/api';
import { ListView } from '@/src/components/ListView/ListView';
import { SIGN_IN_LINK } from '@/src/constants/auth';
import { DATA_SETS_COLUMNS_WITH_ACTIONS } from '@/src/constants/columns/grid-columns';
import { Menu } from '@/src/constants/menu';
import { DataSet } from '@/src/models/data-sets';
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
  let data = { data: [] as DataSet[] } as RequestData<DataSet> | null;

  try {
    data = await dataSetsApi.getDataSets(token);
  } catch (e) {
    logger.error(`Getting data sets error ${e}`);
  }

  return (
    <ListView
      menuItem={Menu.DATA_SETS}
      colDefs={DATA_SETS_COLUMNS_WITH_ACTIONS}
      data={data?.data || []}
      emptyDataTitle="No Datasets"
    />
  );
}
