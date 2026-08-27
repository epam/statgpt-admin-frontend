'use client';

import { ICellRendererParams } from 'ag-grid-community';

import {
  DiscoveryDataset,
  formatDiscoveryValidationIssues,
} from '@/src/models/discovery-dataset';
import { StatusIconCell } from '@/src/components/GridView/StatusIconCell/StatusIconCell';
import { DISCOVERY_VALIDATION_STATUS_VISUALS } from './discovery-validation-status-visuals';

export const ValidationStatusCell = (
  params: ICellRendererParams<DiscoveryDataset>,
) => (
  <StatusIconCell
    {...params}
    config={DISCOVERY_VALIDATION_STATUS_VISUALS}
    tooltip={(data) => formatDiscoveryValidationIssues(data?.validationIssues)}
  />
);
