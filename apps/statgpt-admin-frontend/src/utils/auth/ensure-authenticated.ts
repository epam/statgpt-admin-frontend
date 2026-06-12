import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { SIGN_IN_LINK } from '@/src/constants/auth';
import { getIsEnableAuthToggle } from '@/src/utils/get-auth-toggle';
import { getIsInvalidSession, getUserToken } from './get-token';

export const ensureAuthenticated = async () => {
  const isEnableAuth = getIsEnableAuthToggle();
  const token = await getUserToken(isEnableAuth, headers(), cookies());
  const isInvalidSession = await getIsInvalidSession(isEnableAuth, token);

  if (isInvalidSession) {
    redirect(SIGN_IN_LINK);
  }
};
