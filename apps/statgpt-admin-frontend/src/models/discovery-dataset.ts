export enum DiscoveryValidationStatus {
  Pending = 'pending',
  Valid = 'valid',
  Invalid = 'invalid',
}

export enum DiscoveryIndexingStatus {
  Pending = 'pending',
  Indexing = 'indexing',
  Indexed = 'indexed',
  Failed = 'failed',
}

export interface DiscoveryValidationIssue {
  field?: string;
  message?: string;
}

export interface DiscoveryDataset {
  id: number;
  referenceArea?: string;
  regionalCoverage?: string;
  excludedRegionalValues?: string;
  agency?: string;
  datasetId?: string;
  name?: string;
  description?: string;
  url?: string;
  timeCoverage?: string;
  frequencyCoverage?: string;
  indicatorsCoverage?: string;
  missingIndicators?: string;
  channelId?: number;
  validationStatus?: DiscoveryValidationStatus;
  validationIssues?: DiscoveryValidationIssue[] | null;
  validatedAt?: string;
  indexingStatus?: DiscoveryIndexingStatus;
  indexedAt?: string;
  indexError?: string;
}

export interface DiscoveryUploadSummary {
  created: number;
  updated: number;
  unchanged: number;
  deleted: number;
  rowsRead: number;
  rowsSkipped: number;
}

export interface DiscoveryPayloadProblem {
  message: string;
  field?: string;
  index?: number;
  row?: number;
  cell?: string;
}

export interface DiscoveryPayloadErrorDetail {
  message: string;
  problems: DiscoveryPayloadProblem[];
  truncated: boolean;
}

export interface DiscoveryPayloadErrorResponse {
  detail: DiscoveryPayloadErrorDetail;
}
