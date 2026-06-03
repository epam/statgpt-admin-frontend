export enum PreprocessingStatus {
  NOT_STARTED = 'NOT_STARTED',
  QUEUED = 'QUEUED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export const PREPROCESSING_STATUS_LABEL: Record<PreprocessingStatus, string> = {
  [PreprocessingStatus.NOT_STARTED]: 'Not started',
  [PreprocessingStatus.QUEUED]: 'Queued',
  [PreprocessingStatus.IN_PROGRESS]: 'In progress',
  [PreprocessingStatus.COMPLETED]: 'Completed',
  [PreprocessingStatus.FAILED]: 'Failed',
};
