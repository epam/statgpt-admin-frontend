'use client';

import { FC, useEffect, useState } from 'react';

import { getChannelJobs } from '@/src/app/channels/actions';
import { Loader } from '@/src/components/BaseComponents/Loader/Loader';
import { GridView } from '@/src/components/GridView/GridView';
import { Job } from '@/src/models/job';
import { ColDef } from 'ag-grid-community';
import { JobsActionColumn } from './ActionColumn';

interface Props {
  selectedChannelId: string;
}

export const JobsView: FC<Props> = ({ selectedChannelId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);

  const columns: ColDef[] = [
    {
      field: 'file',
      headerName: 'File name',
      filter: 'agTextColumnFilter',
      valueFormatter: (params) => {
        return params.value ? params.value.split('/').pop() : '';
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'type',
      headerName: 'Type',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'reason_for_failure',
      headerName: 'Reason',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'updated_at',
      headerName: 'Updated At',
      filter: 'agTextColumnFilter',
      valueFormatter: (params) => {
        return params.value ? new Date(params.value).toLocaleString() : '';
      },
    },
    {
      width: 32,
      maxWidth: 32,
      cellRenderer: JobsActionColumn,
      cellClass: 'ag-grid__action-column',
    },
  ];

  useEffect(() => {
    setIsLoading(true);
    getChannelJobs(selectedChannelId).then((jobs) => {
      setJobs(jobs || []);

      setIsLoading(false);
    });
  }, [selectedChannelId]);

  return isLoading ? (
    <div className="flex items-center w-full justify-center h-full">
      <Loader />
    </div>
  ) : (
    <div className="bg-layer-2 flex flex-col h-full common-paddings">
      <div className="flex flex-row items-center justify-between mb-3">
        <h1 className="mb-4">Jobs</h1>
      </div>
      <div className="flex-1 min-h-0">
        <GridView colDefs={columns} data={jobs} emptyDataTitle="No jobs" />
      </div>
    </div>
  );
};
