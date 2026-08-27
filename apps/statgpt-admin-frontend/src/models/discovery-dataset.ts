export enum DiscoveryValidationStatus {
  NotValidated = 'NOT_VALIDATED',
  Valid = 'VALID',
  Invalid = 'INVALID',
}

export const DISCOVERY_VALIDATION_STATUS_LABEL: Record<
  DiscoveryValidationStatus,
  string
> = {
  [DiscoveryValidationStatus.NotValidated]: 'Not validated',
  [DiscoveryValidationStatus.Valid]: 'Valid',
  [DiscoveryValidationStatus.Invalid]: 'Invalid',
};

export enum DiscoveryIndexingStatus {
  New = 'NEW',
  Outdated = 'OUTDATED',
  Indexed = 'INDEXED',
  Failed = 'FAILED',
}

export const DISCOVERY_INDEXING_STATUS_LABEL: Record<
  DiscoveryIndexingStatus,
  string
> = {
  [DiscoveryIndexingStatus.New]: 'New',
  [DiscoveryIndexingStatus.Outdated]: 'Outdated',
  [DiscoveryIndexingStatus.Indexed]: 'Indexed',
  [DiscoveryIndexingStatus.Failed]: 'Failed',
};

export interface DiscoveryValidationIssue {
  field?: string;
  message?: string;
}

export const formatDiscoveryValidationIssues = (
  issues?: DiscoveryValidationIssue[] | null,
): string => {
  if (!issues || !issues.length) return '';
  return issues
    .map((issue) =>
      issue.field ? `${issue.field}: ${issue.message}` : issue.message,
    )
    .join('; ');
};

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
