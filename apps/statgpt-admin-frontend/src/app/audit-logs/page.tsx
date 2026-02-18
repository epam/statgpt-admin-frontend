import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auditLogsApi } from '@/src/app/api/api';
import { ListView } from '@/src/components/ListView/ListView';
import { SIGN_IN_LINK } from '@/src/constants/auth';
import { AUDIT_LOGS_COLUMNS } from '@/src/constants/columns/grid-columns';
import { Menu } from '@/src/constants/menu';
import { RequestData } from '@/src/models/request-data';
import { logger } from '@/src/server/logger';
import { getIsInvalidSession, getUserToken } from '@/src/utils/auth/get-token';
import { getIsEnableAuthToggle } from '@/src/utils/get-auth-toggle';
import { AuditLog } from '@/src/models/audit-log';
import { AuditLogsHeader } from '@/src/components/AuditLogs/AuditLogsHeader';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const isEnableAuth = getIsEnableAuthToggle();
  const token = await getUserToken(isEnableAuth, headers(), cookies());
  const isInvalidSession = await getIsInvalidSession(isEnableAuth, token);

  if (isInvalidSession) {
    return redirect(SIGN_IN_LINK);
  }

  let data = { data: [] as AuditLog[] } as RequestData<AuditLog> | null;

  try {
    data = await auditLogsApi.getAuditLogs(token);
  } catch (e) {
    logger.error(`Getting audit logs error ${e}`);
  }

  return (
    <ListView
      menuItem={Menu.AUDIT_LOGS}
      colDefs={AUDIT_LOGS_COLUMNS}
      data={data?.data || []}
      emptyDataTitle="No audit logs"
      customHeader={<AuditLogsHeader />}
    />
  );
}
