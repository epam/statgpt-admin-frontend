export interface Job {
  id: number;
  status: JobStatus;
  file: string;
  updateAt: string;
  createAt: string;
  reason_for_failure: string;
}

export enum JobStatus {
  QUEUED = 'QUEUED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  IN_PROGRESS = 'IN_PROGRESS',
}
