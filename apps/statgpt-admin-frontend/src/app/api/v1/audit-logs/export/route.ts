import { NextRequest } from 'next/server';
import { auditLogsApi } from '../../../api';
import { getToken } from 'next-auth/jwt';
import { AuditLogRequestModel } from '@/src/models/audit-log';
import { parseNumber } from '@/src/utils/number';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });

  const { searchParams } = new URL(req.url);

  const params: AuditLogRequestModel = {
    limit: parseNumber(searchParams.get('limit')),
    offset: parseNumber(searchParams.get('offset')),
    entity_type: searchParams.get('entity_type') ?? undefined,
    action_type: searchParams.get('action_type') ?? undefined,
    item_id: parseNumber(searchParams.get('item_id')),
    entity_id: searchParams.get('entity_id') ?? undefined,
    performed_by: searchParams.get('performed_by') ?? undefined,
    created_at_from: searchParams.get('created_at_from') ?? undefined,
    created_at_to: searchParams.get('created_at_to') ?? undefined,
  };

  return await auditLogsApi.export(token, params);
}
