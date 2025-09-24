import { NextRequest } from 'next/server';
import { dataSetsApi } from '../../../api';
import { getToken } from 'next-auth/jwt';

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
  const res = await req.json();
  const data = await dataSetsApi.updateDataSet(res, token);
  return Response.json(data);
}
