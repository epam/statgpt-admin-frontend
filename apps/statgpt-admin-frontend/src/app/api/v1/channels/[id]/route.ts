import { NextRequest } from 'next/server';
import { channelsApi } from '../../../api';
import { getToken } from 'next-auth/jwt';
import { Channel } from '@/src/models/channel';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const token = await getToken({ req });
  const data = await channelsApi.removeChannel(params.id, token);
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  let res: Channel;
  try {
    res = (await req.json()) as Channel;
  } catch {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
  const token = await getToken({ req });
  const data = await channelsApi.updateChannel(res, token);
  return Response.json(data);
}
