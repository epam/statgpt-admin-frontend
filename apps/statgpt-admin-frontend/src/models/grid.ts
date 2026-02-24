export type GridEnumSelectFilterModel = { value: string } | null;

export type GridTextFilterType = 'equals' | 'contains';

export interface GridTextFilterModel {
  filterType: 'text';
  type: GridTextFilterType;
  filter?: string;
}
