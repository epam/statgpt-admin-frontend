import { documentsApi } from '@/src/app/api/api';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const search = req.nextUrl.searchParams;
  const targetPath = search.get('targetPath') as string;

  const res = await documentsApi.uploadFile(formData, targetPath);
  return NextResponse.json(res);
}
