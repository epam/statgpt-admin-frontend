import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { documentsApi } from '@/src/app/api/api';
import { ListView } from '@/src/components/ListView/ListView';
import { ForbiddenTrigger } from '@/src/components/NoAccess/ForbiddenTrigger';
import { SIGN_IN_LINK } from '@/src/constants/auth';
import { DOCUMENTS_COLUMNS_WITH_ACTIONS } from '@/src/constants/columns/grid-columns';
import { Menu } from '@/src/constants/menu';
import { Document } from '@/src/models/document';
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

  let data = { data: [] as Document[] } as RequestData<Document> | null;

  const result = await documentsApi.getList(null);
  if (result.ok) {
    data = result.data;
  } else if (result.error.status === 401 || result.error.status === 403) {
    return <ForbiddenTrigger />;
  } else {
    logger.error(`Getting documents error ${result.error.message}`);
  }

  return (
    <ListView
      menuItem={Menu.DOCUMENTS}
      colDefs={DOCUMENTS_COLUMNS_WITH_ACTIONS}
      data={(data?.results as any[]) || []}
      emptyDataTitle="No Documents"
      initialError={result.ok ? null : result.error.message}
    />
  );
}
