import { AgTextEqualsFilterModel } from '@/src/models/grid';

export function getTextEquals(
  filterModel: unknown,
  field: string,
): string | undefined {
  const model = filterModel as Record<string, any> | undefined;
  const filter = model?.[field] as Partial<AgTextEqualsFilterModel> | undefined;

  if (!filter || filter.filterType !== 'text' || filter.type !== 'equals')
    return undefined;

  const value = typeof filter.filter === 'string' ? filter.filter.trim() : '';
  return value.length ? value : undefined;
}

export function getNumberEquals(
  filterModel: unknown,
  field: string,
): number | undefined {
  const value = getTextEquals(filterModel, field);

  if (!value) return undefined;

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}
