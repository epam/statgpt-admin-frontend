export enum DeduplicationJobStatus {
  NOT_STARTED = 'NOT_STARTED',
  QUEUED = 'QUEUED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export const DEDUPLICATION_JOB_STATUS_LABEL: Record<
  DeduplicationJobStatus,
  string
> = {
  [DeduplicationJobStatus.NOT_STARTED]: 'Not started',
  [DeduplicationJobStatus.QUEUED]: 'Queued',
  [DeduplicationJobStatus.IN_PROGRESS]: 'In progress',
  [DeduplicationJobStatus.COMPLETED]: 'Completed',
  [DeduplicationJobStatus.FAILED]: 'Failed',
};

export interface DeduplicationJob {
  id: number;
  created_at: string;
  updated_at: string;
  channel_id: number;
  status: DeduplicationJobStatus;
  reason_for_failure: string;
  non_indicator_remapped: number;
  non_indicator_deleted: number;
  special_remapped: number;
  special_deleted: number;
}
