'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { documentsApi } from '@/src/app/api/api';
import { ListView } from '@/src/components/ListView/ListView';
import { MainShell } from '@/src/components/MainShell/MainShell';
import { NoAccessView } from '@/src/components/NoAccess/NoAccessView';
import { SIGN_IN_LINK } from '@/src/constants/auth';
import { DOCUMENTS_COLUMNS_WITH_ACTIONS } from '@/src/constants/columns/grid-columns';
import { Menu } from '@/src/constants/menu';
import { Document } from '@/src/models/document';
import { RequestData } from '@/src/models/request-data';
import { logger } from '@/src/server/logger';
import { getIsInvalidSession, getUserToken } from '@/src/utils/auth/get-token';
import { getIsEnableAuthToggle } from '@/src/utils/get-auth-toggle';

export default async function Page() {
  const isEnableAuth = getIsEnableAuthToggle();
  const token = await getUserToken(isEnableAuth, headers(), cookies());
  const isInvalidSession = await getIsInvalidSession(isEnableAuth, token);

  if (isInvalidSession) {
    return redirect(SIGN_IN_LINK);
  }

  let data = { data: [] as Document[] } as RequestData<Document> | null;

  const result = await documentsApi.getList(null);
  if (result.ok) data = result.data;
  if (!result.ok && result.error.status === 403) return <NoAccessView />;
  if (!result.ok)
    logger.error(`Getting documents error ${result.error.message}`);

  return (
    <MainShell>
      <ListView
        menuItem={Menu.DOCUMENTS}
        colDefs={DOCUMENTS_COLUMNS_WITH_ACTIONS}
        data={(data?.results as any[]) || []}
        emptyDataTitle="No Documents"
        initialError={result.ok ? null : result.error.message}
      />
    </MainShell>
  );
}
