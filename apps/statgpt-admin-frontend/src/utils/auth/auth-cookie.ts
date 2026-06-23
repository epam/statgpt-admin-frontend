/**
 * Cookie name and secret resolution shared between the NextAuth config
 * (`auth-options.ts`) and code paths that decode the JWT directly.
 */

const authUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;

export const isSecureAuthUrl = !!authUrl && authUrl.startsWith('https:');

export const getAuthSecret = () =>
  process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

export const getSessionCookieName = () =>
  `${isSecureAuthUrl ? '__Secure-' : ''}next-auth.session-token`;
