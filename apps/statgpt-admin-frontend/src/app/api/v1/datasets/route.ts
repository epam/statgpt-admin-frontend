import { NextRequest } from 'next/server';
import { dataSetsApi } from '../../api';
import { getToken } from 'next-auth/jwt';
import { DataSet } from '@/src/models/data-sets';
import { apiResultToResponse } from '@/src/server/api';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    return apiResultToResponse(await dataSetsApi.getDataSets(token));
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as DataSet;
    const token = await getToken({ req });
    return apiResultToResponse(await dataSetsApi.createDataSet(payload, token));
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
