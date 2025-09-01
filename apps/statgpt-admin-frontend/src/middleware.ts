import withAuth from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/((?!api|static|.*\\..*|_next/static|_next/image|images|favicon.svg|robots.txt).*)',
  ],
};

async function middlewareFn(request: NextRequest) {
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
    form-action 'self' https://login.microsoftonline.com;
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

const middleware = withAuth(middlewareFn);

export default middleware;
