import { documentsApi } from '@/src/app/api/api';
import { apiResultToResponse } from '@/src/server/api';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const search = new URL(req.url).searchParams;
    const targetPath = search.get('targetPath') as string;

    return apiResultToResponse(
      await documentsApi.uploadFile(formData, targetPath),
    );
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
