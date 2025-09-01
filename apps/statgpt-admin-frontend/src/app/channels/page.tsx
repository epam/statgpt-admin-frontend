import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { channelsApi } from '@/src/app/api/api';
import { ListView } from '@/src/components/ListView/ListView';
import { SIGN_IN_LINK } from '@/src/constants/auth';
import { CHANNELS_COLUMNS } from '@/src/constants/columns/grid-columns';
import { Menu } from '@/src/constants/menu';
import { Channel } from '@/src/models/channel';
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

  let data = { data: [] as Channel[] } as RequestData<Channel> | null;

  try {
    data = await channelsApi.getChannels(token);
  } catch (e) {
    logger.error(`Getting channels error ${e}`);
  }

  return (
    <ListView
      menuItem={Menu.CHANNELS}
      colDefs={CHANNELS_COLUMNS}
      data={data?.data || []}
      emptyDataTitle="No Channels"
    />
  );
}
