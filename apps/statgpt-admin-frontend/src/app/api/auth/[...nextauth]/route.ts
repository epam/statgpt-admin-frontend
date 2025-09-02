import NextAuth from 'next-auth/next';
import { authOptions } from '@/src/utils/auth/auth-options';

const handler = NextAuth({ ...authOptions });
export { handler as GET, handler as POST };
