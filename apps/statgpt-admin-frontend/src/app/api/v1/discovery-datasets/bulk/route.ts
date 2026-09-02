import { channelsApi } from '@/src/app/api/api';
import { getRequestToken } from '@/src/utils/auth/get-token';
import { apiResultToResponse } from '@/src/server/api';

export const dynamic = 'force-dynamic';

export async function DELETE(req: Request) {
  try {
    const { item_ids: itemIds } = (await req.json()) as {
      item_ids: number[];
    };
    const token = await getRequestToken(req);
    return apiResultToResponse(
      await channelsApi.removeDiscoveryDatasetsBulk(itemIds, token),
    );
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
