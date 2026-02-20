import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { SIGN_IN_LINK } from '@/src/constants/auth';
import { getIsInvalidSession, getUserToken } from '@/src/utils/auth/get-token';
import { getIsEnableAuthToggle } from '@/src/utils/get-auth-toggle';
import { AuditLogsListView } from '@/src/components/AuditLogs/AuditLogsListView';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const isEnableAuth = getIsEnableAuthToggle();
  const token = await getUserToken(isEnableAuth, headers(), cookies());
  const isInvalidSession = await getIsInvalidSession(isEnableAuth, token);

  if (isInvalidSession) {
    return redirect(SIGN_IN_LINK);
  }

  return <AuditLogsListView />;
}
