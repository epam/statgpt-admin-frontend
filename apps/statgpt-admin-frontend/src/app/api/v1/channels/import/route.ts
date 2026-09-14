import { getRequestToken } from '@/src/utils/auth/get-token';
import { channelsApi } from '@/src/app/api/api';
import { apiResultToResponse } from '@/src/server/api';
import { DiscoveryUploadMode } from '@/src/models/discovery-dataset';

export const runtime = 'nodejs';

function parseRecordUploadMode(value: string | null): DiscoveryUploadMode {
  return value === DiscoveryUploadMode.Replace
    ? DiscoveryUploadMode.Replace
    : DiscoveryUploadMode.Upsert;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const search = new URL(req.url).searchParams;
    const updateDatasets = search.get('updateDatasets') === 'true';
    const updateDataSources = search.get('updateDataSources') === 'true';
    const cleanUp = search.get('cleanUp') === 'true';
    const discoveryDatasetsMode = parseRecordUploadMode(
      search.get('discoveryDatasetsMode'),
    );
    const glossaryTermsMode = parseRecordUploadMode(
      search.get('glossaryTermsMode'),
    );
    const token = await getRequestToken(req);
    return apiResultToResponse(
      await channelsApi.importChannel(
        formData,
        updateDatasets,
        updateDataSources,
        cleanUp,
        discoveryDatasetsMode,
        glossaryTermsMode,
        token,
      ),
    );
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
