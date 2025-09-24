import { NextRequest } from 'next/server';
import { dataSetsApi } from '../../api';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  const data = await dataSetsApi.getDataSets(token);
  return Response.json(data);
}
