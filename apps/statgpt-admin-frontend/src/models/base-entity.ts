export interface BaseEntity {
  /** Id */
  id?: number;
  /** Title */
  title?: string;
  /**
   * Description
   * @default
   */
  description?: string;
  /**
   * Created At
   * Format: date-time
   */
  created_at?: string;
  /**
   * Updated At
   * Format: date-time
   */
  updated_at?: string;
}

export interface BaseEntityWithDetails extends BaseEntity {
  /**
   * Details
   * @description Details in JSON format
   */
  details?: Record<string, unknown>;

  preprocessing_status?: string;
}
