import { GridTextFilterModel, GridTextFilterType } from '@/src/models/grid';

function getGridTextFilterValue(
  filterModel: unknown,
  field: string,
  expectedType: GridTextFilterType,
): string | undefined {
  const model = filterModel as Record<string, unknown> | undefined;
  const filter = model?.[field] as Partial<GridTextFilterModel> | undefined;

  if (!filter || filter.filterType !== 'text' || filter.type !== expectedType) {
    return undefined;
  }

  const value = typeof filter.filter === 'string' ? filter.filter.trim() : '';
  return value.length ? value : undefined;
}

export function getTextEquals(
  filterModel: unknown,
  field: string,
): string | undefined {
  return getGridTextFilterValue(filterModel, field, 'equals');
}

export function getTextContains(
  filterModel: unknown,
  field: string,
): string | undefined {
  return getGridTextFilterValue(filterModel, field, 'contains');
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

export function getEnumFilterValue(
  filterModel: unknown,
  field: string,
): string | undefined {
  const model = filterModel as Record<string, any> | undefined;
  const filter = model?.[field] as { value?: string } | undefined;
  const value = typeof filter?.value === 'string' ? filter.value.trim() : '';
  return value || undefined;
}

/**
 * Drops enum-select filters whose selected value is no longer among the allowed
 * values for that field. Fields absent from `allowedValues` are left untouched.
 * @param filterModel - the grid's current filter model
 * @param allowedValues - values still available per field
 * @returns the pruned model, or null when nothing was stale
 */
export function pruneStaleEnumFilters(
  filterModel: Record<string, unknown> | null | undefined,
  allowedValues: Record<string, readonly string[]>,
): Record<string, unknown> | null {
  if (!filterModel) return null;

  const pruned: Record<string, unknown> = {};
  let changed = false;

  for (const [field, filter] of Object.entries(filterModel)) {
    const allowed = allowedValues[field];
    const value = getEnumFilterValue(filterModel, field);
    if (allowed && value !== undefined && !allowed.includes(value)) {
      changed = true;
    } else {
      pruned[field] = filter;
    }
  }

  return changed ? pruned : null;
}

export function getNestedValue(data: unknown, field: string): string {
  const parts = field.split('.');
  let cur: unknown = data;
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return '';
    cur = (cur as Record<string, unknown>)[part];
  }
  return String(cur ?? '');
}

export function normalizeEnumValues(values: readonly string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values ?? []) {
    const s = String(v);
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out;
}
