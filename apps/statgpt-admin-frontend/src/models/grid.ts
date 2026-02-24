export interface AgTextEqualsFilterModel {
  filterType: 'text';
  type: 'equals';
  filter?: string;
}

export type EnumSelectFilterModel = { value: string } | null;
