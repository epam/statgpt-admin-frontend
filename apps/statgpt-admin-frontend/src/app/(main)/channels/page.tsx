import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { channelsApi } from '@/src/app/api/api';
import { ListView } from '@/src/components/ListView/ListView';
import { ForbiddenTrigger } from '@/src/components/NoAccess/ForbiddenTrigger';
import { SIGN_IN_LINK } from '@/src/constants/auth';
import { CHANNELS_COLUMNS } from '@/src/constants/columns/grid-columns';
import { Menu } from '@/src/constants/menu';
import { Channel } from '@/src/models/channel';
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

  let data = { data: [] as Channel[] } as RequestData<Channel> | null;

  const result = await channelsApi.getChannels(token);
  if (result.ok) {
    data = result.data;
  } else if (result.error.status === 403) {
    return <ForbiddenTrigger />;
  } else {
    logApiFailure('channels', result.error);
  }

  return (
    <ListView
      menuItem={Menu.CHANNELS}
      colDefs={CHANNELS_COLUMNS}
      data={data?.data || []}
      emptyDataTitle="No Channels"
      initialError={result.ok ? null : result.error.message}
    />
  );
}
