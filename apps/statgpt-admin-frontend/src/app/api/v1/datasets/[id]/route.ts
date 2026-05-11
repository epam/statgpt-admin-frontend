import { NextRequest } from 'next/server';
import { dataSetsApi } from '../../../api';
import { getToken } from 'next-auth/jwt';
import { DataSet } from '@/src/models/data-sets';
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
      await dataSetsApi.removeDataSet(params.id, token),
    );
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    let res: DataSet;
    try {
      res = (await req.json()) as DataSet;
    } catch {
      return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
    return apiResultToResponse(await dataSetsApi.updateDataSet(res, token));
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
