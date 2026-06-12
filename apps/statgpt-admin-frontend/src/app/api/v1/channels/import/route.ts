import { getRequestToken } from '@/src/utils/auth/get-token';
import { channelsApi } from '@/src/app/api/api';
import { apiResultToResponse } from '@/src/server/api';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const search = new URL(req.url).searchParams;
    const updateDatasets = search.get('updateDatasets') === 'true';
    const updateDataSources = search.get('updateDataSources') === 'true';
    const cleanUp = search.get('cleanUp') === 'true';
    const token = await getRequestToken(req);
    return apiResultToResponse(
      await channelsApi.importChannel(
        formData,
        updateDatasets,
        updateDataSources,
        cleanUp,
        token,
      ),
    );
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
