import { NextRequest } from 'next/server';
import { dataSetsApi } from '../../api';
import { getToken } from 'next-auth/jwt';
import { DataSet } from '@/src/models/data-sets';

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

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as DataSet;
    const token = await getToken({ req });
    const result = await dataSetsApi.createDataSetSafe(payload, token);

    if (!result.ok) {
      return Response.json({
        ok: false,
        res:
          result.error.message ||
          'Failed to create dataset. Please check required fields.',
      });
    }

    return Response.json({ ok: true, res: result.data });
  } catch {
    return Response.json({
      ok: false,
      res: 'Internal Server Error',
    });
  }
}
