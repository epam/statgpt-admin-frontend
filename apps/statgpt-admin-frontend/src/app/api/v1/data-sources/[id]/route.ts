import { NextRequest } from 'next/server';
import { dataSourcesApi } from '../../../api';
import { getToken } from 'next-auth/jwt';
import { DataSource } from '@/src/models/data-source';
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
      await dataSourcesApi.removeDataSource(params.id, token),
    );
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    let res: DataSource;
    try {
      res = (await req.json()) as DataSource;
    } catch {
      return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
    return apiResultToResponse(
      await dataSourcesApi.updateDataSources(res, token),
    );
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
