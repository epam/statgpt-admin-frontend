'use client';

import { ICellRendererParams } from 'ag-grid-community';

import { DiscoveryDataset } from '@/src/models/discovery-dataset';
import { StatusIconCell } from '@/src/components/GridView/StatusIconCell/StatusIconCell';
import { DISCOVERY_INDEXING_STATUS_VISUALS } from './discovery-indexing-status-visuals';

export const IndexingStatusCell = (
  params: ICellRendererParams<DiscoveryDataset>,
) => (
  <StatusIconCell
    {...params}
    config={DISCOVERY_INDEXING_STATUS_VISUALS}
    tooltip={(data) => data?.indexError}
  />
);
