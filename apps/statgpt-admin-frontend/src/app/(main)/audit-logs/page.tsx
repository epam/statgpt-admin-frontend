import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { AuditLogsListView } from '@/src/components/AuditLogs/AuditLogsListView';
import { ForbiddenTrigger } from '@/src/components/NoAccess/ForbiddenTrigger';
import { SIGN_IN_LINK } from '@/src/constants/auth';
import { getIsInvalidSession, getUserToken } from '@/src/utils/auth/get-token';
import { getIsEnableAuthToggle } from '@/src/utils/get-auth-toggle';
import { auditLogsApi } from '../../api/api';
import { logApiFailure } from '@/src/server/logger';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const isEnableAuth = getIsEnableAuthToggle();
  const token = await getUserToken(isEnableAuth, headers(), cookies());
  const isInvalidSession = await getIsInvalidSession(isEnableAuth, token);

  if (isInvalidSession) {
    return redirect(SIGN_IN_LINK);
  }

  const enumsResult = await auditLogsApi.getEnumValues(token);
  let enums = null;
  if (enumsResult.ok) {
    enums = enumsResult.data;
  } else if (enumsResult.error.status === 403) {
    return <ForbiddenTrigger />;
  } else {
    logApiFailure('audit log enum values', enumsResult.error);
  }

  return (
    <AuditLogsListView
      enums={enums}
      initialError={enumsResult.ok ? null : enumsResult.error.message}
    />
  );
}
