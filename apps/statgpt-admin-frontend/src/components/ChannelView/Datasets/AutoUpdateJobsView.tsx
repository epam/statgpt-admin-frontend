'use client';

import { FC, useEffect, useState } from 'react';

import {
  getChannelDatasetAutoUpdateJobs,
  getChannelDatasets,
} from '@/src/app/channels/actions';
import { Loader } from '@/src/components/BaseComponents/Loader/Loader';
import { GridView } from '@/src/components/GridView/GridView';
import { useApiNotification } from '@/src/hooks/use-api-notification';
import { useAccessControl } from '@/src/context/AccessControlContext';
import { usePageInitialLoadingSync } from '@/src/context/NavigationLoadingContext';
import { AutoUpdateJob } from '@/src/models/auto-update-job';
import { DETAILS_TOOLTIP_KEY } from '@/src/components/GridView/DetailsTooltip/DetailsTooltip';
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
  const withNotification = useApiNotification();
  const [isLoading, setIsLoading] = useState(true);
  usePageInitialLoadingSync(isLoading);
  const [jobs, setJobs] = useState<AutoUpdateJob[]>([]);
  const [datasetName, setDatasetName] = useState<string>('');

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
    },
    {
      field: 'result',
      headerName: 'Result',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'details',
      headerName: 'Details',
      filter: 'agTextColumnFilter',
      tooltipField: 'details',
      tooltipComponent: DETAILS_TOOLTIP_KEY,
    },
    {
      field: 'reason_for_failure',
      headerName: 'Reason for Failure',
      filter: 'agTextColumnFilter',
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

    Promise.all([
      withNotification(
        getChannelDatasetAutoUpdateJobs(selectedChannelId, selectedDatasetId),
        'Failed to Load Auto Update Jobs',
        [403],
      ),
      getChannelDatasets(selectedChannelId),
    ]).then(([jobsResult, datasetsResult]) => {
      if (!jobsResult.ok && jobsResult.error.status === 403) {
        setForbidden();
        return;
      }
      setJobs(jobsResult.ok ? jobsResult.data : []);

      if (datasetsResult.ok) {
        const match = datasetsResult.data.data.find(
          (ds) => String(ds.dataset_id) === selectedDatasetId,
        );
        if (match?.dataset?.title) {
          setDatasetName(match.dataset.title);
        }
      }

      setIsLoading(false);
    });
  }, [selectedChannelId, selectedDatasetId]);

  return isLoading ? (
    <div className="flex items-center w-full justify-center h-full">
      <Loader />
    </div>
  ) : (
    <div className="bg-layer-2 flex flex-col h-full common-paddings">
      <div className="flex flex-row items-center justify-between mb-3">
        <h1 className="mb-4">
          Auto Update Jobs{datasetName ? `: ${datasetName}` : ''}
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
