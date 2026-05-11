import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { SIGN_IN_LINK } from '@/src/constants/auth';
import { getIsInvalidSession, getUserToken } from '@/src/utils/auth/get-token';
import { getIsEnableAuthToggle } from '@/src/utils/get-auth-toggle';
import { AuditLogsListView } from '@/src/components/AuditLogs/AuditLogsListView';
import { auditLogsApi } from '../api/api';
import { logger } from '@/src/server/logger';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const isEnableAuth = getIsEnableAuthToggle();
  const token = await getUserToken(isEnableAuth, headers(), cookies());
  const isInvalidSession = await getIsInvalidSession(isEnableAuth, token);

  if (isInvalidSession) {
    return redirect(SIGN_IN_LINK);
  }

  const enumsResult = await auditLogsApi.getEnumValues(token);
  if (!enumsResult.ok) {
    logger.error(
      `Getting audit log enum values error ${enumsResult.error.message}`,
    );
  }
  const enums = enumsResult.ok ? enumsResult.data : null;

  return (
    <AuditLogsListView
      enums={enums}
      initialError={enumsResult.ok ? null : enumsResult.error.message}
    />
  );
}
