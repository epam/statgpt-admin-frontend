import { IncomingMessage } from 'http';
import { DefaultSession, getServerSession } from 'next-auth';
import { getToken, GetTokenParams, JWT } from 'next-auth/jwt';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';
import { authOptions } from './auth-options';

export const getTokenRequestParams = async (
  headers: Promise<Headers>,
  cookies: Promise<unknown>,
): Promise<GetTokenParams> => {
  const headersList = await headers;
  const cookiesList = await cookies;

  return {
    req: {
      headers: headersList,
      cookies: cookiesList as NextApiRequestCookies,
    } as unknown as IncomingMessage & {
      cookies: NextApiRequestCookies;
    },
    ...(authOptions as Partial<GetTokenParams>),
    cookieName: authOptions.cookies?.sessionToken?.name,
    secureCookie: authOptions.cookies?.sessionToken?.options?.secure,
  };
};

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
  const session = (await getServerSession(authOptions)) as DefaultSession & {
    error?: string;
  };
  const isInvalidSession = session == null || session.error != null;

  const isTokenInvalid =
    token == null ||
    (typeof token.accessTokenExpires === 'number' &&
      Date.now() > token.accessTokenExpires);

  return isInvalidSession || isTokenInvalid;
};
