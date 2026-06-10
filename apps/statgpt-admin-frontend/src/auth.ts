import NextAuth from 'next-auth';
import { authOptions } from '@/src/utils/auth/auth-options';

export const { auth, handlers, signIn, signOut } = NextAuth(authOptions);
