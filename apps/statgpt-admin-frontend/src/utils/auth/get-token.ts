import { getToken, GetTokenParams, JWT } from 'next-auth/jwt';
import { getAuthSecret, getSessionCookieName } from './auth-cookie';

export const getTokenRequestParams = async (
  headers: Promise<Headers>,
  cookies: Promise<unknown>,
): Promise<GetTokenParams> => {
  const headersList = await headers;
  await cookies;

  return {
    req: {
      headers: headersList,
    },
    cookieName: getSessionCookieName(),
    secret: getAuthSecret(),
  };
};

export const getRequestToken = async (req: Request): Promise<JWT | null> =>
  getToken({
    req,
    cookieName: getSessionCookieName(),
    secret: getAuthSecret(),
  });

export const getUserToken = async (
  isEnableAuth: boolean,
  headers: Promise<Headers>,
  cookies: Promise<unknown>,
): Promise<JWT | null> => {
  const params = await getTokenRequestParams(headers, cookies);
  return isEnableAuth ? await getToken(params) : null;
};

export const getIsInvalidSession = async (
  isEnableAuth: boolean,
  token: JWT | null,
) => {
  if (!isEnableAuth) {
    return false;
  }
  const isTokenInvalid =
    token == null ||
    (token as { error?: unknown }).error != null ||
    (typeof token.accessTokenExpires === 'number' &&
      Date.now() > token.accessTokenExpires);

  return isTokenInvalid;
};
