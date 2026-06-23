import { getRequestToken } from '@/src/utils/auth/get-token';
import { channelsApi } from '@/src/app/api/api';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const token = await getRequestToken(req);
    return (await channelsApi.downloadFile(params.id, token)) as any;
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
