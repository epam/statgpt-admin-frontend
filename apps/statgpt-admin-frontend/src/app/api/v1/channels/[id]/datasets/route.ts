import { channelsApi } from '../../../../api';
import { getRequestToken } from '@/src/utils/auth/get-token';
import { apiResultToResponse } from '@/src/server/api';

export const dynamic = 'force-dynamic';

interface ChannelDatasetPayload {
  dsId?: string;
  isReload?: boolean;
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const token = await getRequestToken(req);
    return apiResultToResponse(
      await channelsApi.getChannelDataset(params.id, token),
    );
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const token = await getRequestToken(req);
    const [id, dsId] = params.id.split('__');
    return apiResultToResponse(
      await channelsApi.removeChannelDataset(id, dsId, token),
    );
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const token = await getRequestToken(req);
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
