import { NextRequest } from 'next/server';
import { channelsApi } from '../../../../../api';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const token = await getToken({ req });
  const data = await channelsApi.reloadDataSets(params.id, token);
  return Response.json(data);
}
