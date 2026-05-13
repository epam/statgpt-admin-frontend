import { BaseEntity } from './base-entity';

export interface DataSetUrn {
  agencyId?: string;
  resourceId?: string;
  version?: string;
}

export interface DataSetDetails {
  urn?: DataSetUrn;
}

export interface DataSet extends BaseEntity {
  /** Data Source Id */
  data_source_id?: number;
  details?: DataSetDetails;
  preprocessing_status?: string;
}
