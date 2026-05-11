import { NextRequest } from 'next/server';
import { channelsApi } from '../../../api';
import { getToken } from 'next-auth/jwt';
import { Channel } from '@/src/models/channel';
import { apiResultToResponse } from '@/src/server/api';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const token = await getToken({ req });
    return apiResultToResponse(
      await channelsApi.removeChannel(params.id, token),
    );
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let res: Channel;
    try {
      res = (await req.json()) as Channel;
    } catch {
      return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
    const token = await getToken({ req });
    return apiResultToResponse(await channelsApi.updateChannel(res, token));
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
