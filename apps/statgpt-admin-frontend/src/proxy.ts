import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import { getSignInLink } from '@/src/constants/auth';
import {
  getAuthSecret,
  getSessionCookieName,
} from '@/src/utils/auth/auth-cookie';

export const config = {
  matcher: [
    '/((?!api|static|.*\\..*|_next/static|_next/image|images|favicon.svg|robots.txt).*)',
  ],
};

async function proxyFn(request: Request) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: http: ${
      process.env.NODE_ENV === 'production' ? '' : `'unsafe-eval'`
    };

    style-src 'self' https://cdn.jsdelivr.net 'unsafe-inline';
    img-src 'self' blob: data: https://authjs.dev;
    font-src 'self' data: https://cdn.jsdelivr.net fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    frame-ancestors ${process.env.ALLOWED_FRAME_ANCESTORS ?? "'none'"};
    ${process.env.NODE_ENV === 'production' ? 'upgrade-insecure-requests;' : ''}
`;

  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim();

  const requestHeaders = new Headers(request.headers);

  requestHeaders.set('x-nonce', nonce);
  if (!requestHeaders.has('Content-Security-Policy')) {
    requestHeaders.set(
      'Content-Security-Policy',
      contentSecurityPolicyHeaderValue,
    );
  }
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue,
  );

  return response;
}

async function authProxyFn(req: Request) {
  const token = await getToken({
    req,
    cookieName: getSessionCookieName(),
    secret: getAuthSecret(),
  });

  const isInvalidSession =
    token == null || (token as { error?: unknown }).error != null;

  if (isInvalidSession) {
    const requestUrl = new URL(req.url);
    const callbackUrl = `${requestUrl.pathname}${requestUrl.search}`;
    const signInUrl = new URL(getSignInLink(callbackUrl), requestUrl.origin);

    return NextResponse.redirect(signInUrl);
  }

  return proxyFn(req);
}

const proxy = authProxyFn;

export default proxy;
