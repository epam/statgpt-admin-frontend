import { dataSetsApi } from '../../api';
import { getRequestToken } from '@/src/utils/auth/get-token';
import { DataSet } from '@/src/models/data-sets';
import { apiResultToResponse } from '@/src/server/api';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const token = await getRequestToken(req);
    return apiResultToResponse(await dataSetsApi.getDataSets(token));
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as DataSet;
    const token = await getRequestToken(req);
    return apiResultToResponse(await dataSetsApi.createDataSet(payload, token));
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
