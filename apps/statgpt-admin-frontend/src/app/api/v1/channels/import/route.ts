import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { channelsApi } from '@/src/app/api/api';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const search = req.nextUrl.searchParams;
  const updateDatasets = search.get('updateDatasets') === 'true';
  const updateDataSources = search.get('updateDataSources') === 'true';
  const cleanUp = search.get('cleanUp') === 'true';
  const token = await getToken({ req });

  return channelsApi.importChannel(
    formData,
    updateDatasets,
    updateDataSources,
    cleanUp,
    token,
  ) as any;
}
