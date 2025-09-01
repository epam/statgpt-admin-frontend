import { NextRequest } from 'next/server';
import { dataSourcesApi } from '../../../api';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const token = await getToken({ req });
  const data = await dataSourcesApi.removeDataSource(params.id, token);
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  const res = await req.json();
  const data = await dataSourcesApi.updateDataSources(res, token);
  return Response.json(data);
}
