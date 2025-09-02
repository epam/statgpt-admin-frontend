import { BaseEntityWithDetails } from './base-entity';

export interface DataSource extends BaseEntityWithDetails {
  /** Type Id */
  type_id?: number;

  type?: DataSourceType;
}

export interface DataSourceType {
  id: number;
  /**
   * Created At
   * Format: date-time
   */
  created_at: string;
  /**
   * Updated At
   * Format: date-time
   */
  updated_at: string;
  /** Name */
  name: string;
  /** Description */
  description: string;
}

export interface DataSourceUpdate {
  /** Title */
  title?: string;
  /** Description */
  description?: string;
}
