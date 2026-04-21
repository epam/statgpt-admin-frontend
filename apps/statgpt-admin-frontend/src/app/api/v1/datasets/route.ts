import { NextRequest } from 'next/server';
import { dataSetsApi } from '../../api';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    const data = await dataSetsApi.getDataSets(token);
    return Response.json(data);
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
