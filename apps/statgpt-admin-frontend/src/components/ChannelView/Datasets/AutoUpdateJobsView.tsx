'use client';

import { FC, useEffect, useState } from 'react';

import { getChannelDatasetAutoUpdateJobs } from '@/src/app/channels/actions';
import { Loader } from '@/src/components/BaseComponents/Loader/Loader';
import { GridView } from '@/src/components/GridView/GridView';
import { useApiNotification } from '@/src/hooks/use-api-notification';
import { useAccessControl } from '@/src/context/AccessControlContext';
import { useDatasetData } from '@/src/context/DatasetDataContext';
import { usePageInitialLoadingSync } from '@/src/context/NavigationLoadingContext';
import {
  AUTO_UPDATE_RESULT_LABEL,
  AutoUpdateJob,
  AutoUpdateResult,
} from '@/src/models/auto-update-job';
import { DETAILS_TOOLTIP_KEY } from '@/src/components/GridView/DetailsTooltip/DetailsTooltip';
import { PreprocessingStatusCell } from '@/src/components/GridView/PreprocessingStatusCell/PreprocessingStatusCell';
import { ColDef } from 'ag-grid-community';

interface Props {
  selectedChannelId: string;
  selectedDatasetId: string;
}

export const AutoUpdateJobsView: FC<Props> = ({
  selectedChannelId,
  selectedDatasetId,
}) => {
  const { setForbidden } = useAccessControl();
  const { dataset } = useDatasetData();
  const withNotification = useApiNotification();
  const [isLoading, setIsLoading] = useState(true);
  usePageInitialLoadingSync(isLoading);
  const [jobs, setJobs] = useState<AutoUpdateJob[]>([]);

  const datasetName = dataset?.dataset.title ?? '';

  const columns: ColDef[] = [
    {
      field: 'base_version_id',
      headerName: 'Base Version ID',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'created_version_id',
      headerName: 'Created Version ID',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'status',
      headerName: 'Status',
      filter: 'agTextColumnFilter',
      cellRenderer: PreprocessingStatusCell,
      cellStyle: { overflow: 'visible' },
      tooltipValueGetter: () => undefined,
    },
    {
      field: 'result',
      headerName: 'Result',
      filter: 'agTextColumnFilter',
      valueFormatter: ({ value }: { value: AutoUpdateResult | null }) =>
        value != null ? (AUTO_UPDATE_RESULT_LABEL[value] ?? value) : '',
    },
    {
      field: 'details',
      headerName: 'Details',
      filter: 'agTextColumnFilter',
      tooltipField: 'details',
      tooltipComponent: DETAILS_TOOLTIP_KEY,
    },
    {
      field: 'updated_at',
      headerName: 'Updated At',
      filter: 'agTextColumnFilter',
      valueFormatter: ({ value }: { value: string | null }) =>
        value ? new Date(value).toLocaleString() : '',
    },
  ];

  useEffect(() => {
    setIsLoading(true);

    withNotification(
      getChannelDatasetAutoUpdateJobs(selectedChannelId, selectedDatasetId),
      'Failed to Load Auto Update Jobs',
      [403],
    ).then((jobsResult) => {
      setIsLoading(false);
      if (!jobsResult.ok) {
        if (jobsResult.error.status === 403) setForbidden();
        return;
      }
      setJobs(jobsResult.data);
    });
  }, [selectedChannelId, selectedDatasetId, setForbidden, withNotification]);

  return isLoading ? (
    <div className="flex items-center w-full justify-center h-full">
      <Loader />
    </div>
  ) : (
    <div className="bg-layer-2 flex flex-col h-full common-paddings">
      <div className="flex flex-row items-center justify-between mb-3">
        <h1 className="mb-6">
          {datasetName ? `${datasetName}: Version Checks` : 'Version Checks'}
        </h1>
      </div>
      <div className="flex-1 min-h-0">
        <GridView
          colDefs={columns}
          data={jobs}
          emptyDataTitle="No auto update jobs"
        />
      </div>
    </div>
  );
};
