import { NextRequest } from 'next/server';
import { channelsApi } from '../../../../api';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const token = await getToken({ req });
  const data = await channelsApi.getChannelDataset(params.id, token);
  return Response.json(data);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const token = await getToken({ req });
  const [id, dsId] = params.id.split('__');
  const data = await channelsApi.removeChannelDataset(id, dsId, token);
  return Response.json(data);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const token = await getToken({ req });
  const res = await req.json();
  const data = res.isReload
    ? await channelsApi.reloadDataSet(params.id, res.dsId, token)
    : await channelsApi.addChannelDataset(params.id, res.dsId, token);
  return Response.json(data);
}
