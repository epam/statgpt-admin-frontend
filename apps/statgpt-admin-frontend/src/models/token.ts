import { TokenSet } from '@auth/core/types';
import { JWT } from 'next-auth/jwt';

export interface Token extends JWT {
  accessTokenLifetimeMs?: number;
  providerId?: string;
  userId: string;
  refreshToken: string | TokenSet;
}
