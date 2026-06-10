import { handlers } from '@/src/auth';

const { GET: authGet, POST: authPost } = handlers;

export const GET = (request: Request) =>
  authGet(request as Parameters<typeof authGet>[0]);

export const POST = (request: Request) =>
  authPost(request as Parameters<typeof authPost>[0]);
