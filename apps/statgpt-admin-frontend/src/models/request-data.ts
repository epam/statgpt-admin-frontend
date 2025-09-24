export interface RequestData<T> {
  /** Data */
  data: T[];
  results?: T[];
  /** Limit */
  limit: number;
  /** Offset */
  offset: number;
  /** Count */
  count: number;
  /** Total */
  total: number;
}
