import { NextRequest } from 'next/server';
import { channelsApi } from '../../../../../api';
import { getToken } from 'next-auth/jwt';
import { apiResultToResponse } from '@/src/server/api';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const token = await getToken({ req });
    return apiResultToResponse(
      await channelsApi.reloadDataSets(params.id, token),
    );
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
