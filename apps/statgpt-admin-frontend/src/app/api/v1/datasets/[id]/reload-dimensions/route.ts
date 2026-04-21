import { NextRequest } from 'next/server';
import { dataSetsApi } from '../../../../api';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const token = await getToken({ req });
    const data = await dataSetsApi.reloadDimensionsDataSet(params.id, token);
    return Response.json(data);
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
