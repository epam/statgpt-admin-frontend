import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { channelsApi } from '@/src/app/api/api';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const token = await getToken({ req });
  return (await channelsApi.downloadFile(params.id, token)) as any;
}
