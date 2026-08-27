'use client';

import { ICellRendererParams } from 'ag-grid-community';

import { StatusIconCell } from '@/src/components/GridView/StatusIconCell/StatusIconCell';
import { PREPROCESSING_STATUS_VISUALS } from './preprocessing-status-visuals';

interface WithFailureReason {
  reason_for_failure: string;
}

export const PreprocessingStatusCell = (
  params: ICellRendererParams<WithFailureReason>,
) => (
  <StatusIconCell
    {...params}
    config={PREPROCESSING_STATUS_VISUALS}
    tooltip={(data) => data?.reason_for_failure}
  />
);
