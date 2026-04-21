import { NextRequest } from 'next/server';
import { dataSetsApi } from '../../../api';
import { getToken } from 'next-auth/jwt';
import { DataSet } from '@/src/models/data-sets';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const token = await getToken({ req });
  const data = await dataSetsApi.removeDataSet(params.id, token);
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  let res: DataSet;
  try {
    res = (await req.json()) as DataSet;
  } catch {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
  const data = await dataSetsApi.updateDataSet(res, token);
  return Response.json(data);
}
