import { NextRequest } from 'next/server';
import { channelsApi } from '../../../../api';
import { getToken } from 'next-auth/jwt';
import { apiResultToResponse } from '@/src/server/api';

export const dynamic = 'force-dynamic';

interface ChannelDatasetPayload {
  dsId?: string;
  isReload?: boolean;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const token = await getToken({ req });
    return apiResultToResponse(
      await channelsApi.getChannelDataset(params.id, token),
    );
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const token = await getToken({ req });
    const [id, dsId] = params.id.split('__');
    return apiResultToResponse(
      await channelsApi.removeChannelDataset(id, dsId, token),
    );
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const token = await getToken({ req });
    let res: ChannelDatasetPayload;
    try {
      res = (await req.json()) as ChannelDatasetPayload;
    } catch {
      return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    if (!res.dsId) {
      return Response.json({ error: 'Missing field: dsId' }, { status: 400 });
    }

    return apiResultToResponse(
      res.isReload
        ? await channelsApi.reloadDataSet(params.id, res.dsId, token)
        : await channelsApi.addChannelDataset(params.id, res.dsId, token),
    );
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
