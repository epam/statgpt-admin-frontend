import { documentsApi } from '@/src/app/api/api';
import { apiResultToResponse } from '@/src/server/api';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const search = req.nextUrl.searchParams;
    const targetPath = search.get('targetPath') as string;

    return apiResultToResponse(
      await documentsApi.uploadFile(formData, targetPath),
    );
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
