import { JWT } from 'next-auth/jwt';
import {
  concatMap,
  filter,
  first,
  firstValueFrom,
  interval,
  race,
  throwError,
  timeout,
} from 'rxjs';

import { Channel, ChannelTerm } from '@/src/models/channel';
import { ChannelDataset } from '@/src/models/channel-dataset';
import { ChannelDatasetVersion } from '@/src/models/channel-dataset-version';
import { ChannelIndexStatus } from '@/src/models/channel-index-status';
import { DataSet } from '@/src/models/data-sets';
import { RequestData } from '@/src/models/request-data';
import { AutoUpdateJob } from '@/src/models/auto-update-job';
import { ApiResult, MAIN_API } from './api';
import { BaseApi } from './base-api';
import { Job, JobStatus } from '@/src/models/job';

export const CHANNELS_URL = `${MAIN_API}/channels`;
export const CHANNELS_IMPORT_URL = `${CHANNELS_URL}/import`;
export const CHANNELS_JOBS_URL = `${CHANNELS_URL}/jobs`;
export const CHANNELS_JOB_ID_URL = (id?: string | number): string =>
  `${CHANNELS_JOBS_URL}/${id}`;

export const CHANNELS_JOB_DOWNLOAD_ID_URL = (id?: string | number): string =>
  `${CHANNELS_JOB_ID_URL(id)}/download`;

export const CHANNEL_ID_URL = (id?: string | number): string =>
  `${CHANNELS_URL}/${id}`;

export const CHANNEL_TERMS_URL = (id?: string | number): string =>
  `${CHANNEL_ID_URL(id)}/terms`;

export const CHANNEL_JOBS_URL = (id?: string | number): string =>
  `${CHANNEL_ID_URL(id)}/jobs`;

export const CHANNEL_ID_EXPORT_URL = (id?: string | number): string =>
  `${CHANNEL_ID_URL(id)}/export`;

export const CHANNEL_DATA_SETS_URL = (id: string | number): string =>
  `${CHANNEL_ID_URL(id)}/datasets`;

export const CHANNEL_DEDUPLICATE_URL = (id: string | number): string =>
  `${CHANNEL_DATA_SETS_URL(id)}/deduplicate`;

export const RELOAD_ALL_DATASETS_CHANNEL_URL = (id: string | number): string =>
  `${CHANNEL_DATA_SETS_URL(id)}/reload-indicators`;

export const DATASET_CHANNEL_URL = (
  id: string | number,
  dsId: string | number,
): string => `${CHANNEL_DATA_SETS_URL(id)}/${dsId}`;

export const RELOAD_DATASET_CHANNEL_URL = (
  id: string | number,
  dsId: string | number,
): string => `${DATASET_CHANNEL_URL(id, dsId)}/reload-indicators`;

export const CHANNEL_DATASET_AUTO_UPDATE_JOBS_URL = (
  channelId: string | number,
  datasetId: string | number,
): string =>
  `${DATASET_CHANNEL_URL(channelId, datasetId)}/versions/auto-update-jobs`;

export const CHANNEL_DATASET_VERSIONS_URL = (
  channelId: string | number,
  datasetId: string | number,
): string => `${DATASET_CHANNEL_URL(channelId, datasetId)}/versions`;

export const CHANNEL_INDEX_STATUS_URL = (id: string | number): string =>
  `${CHANNEL_ID_URL(id)}/index-status`;

export class ChannelsApi extends BaseApi {
  getChannels(token: JWT | null): Promise<ApiResult<RequestData<Channel>>> {
    return this.get(CHANNELS_URL, token);
  }

  async exportChannel(
    id: string,
    token: JWT | null,
  ): Promise<ApiResult<string>> {
    const initResult = await this.post(
      CHANNEL_ID_EXPORT_URL(id),
      {},
      void 0,
      void 0,
      token,
    );

    if (!initResult.ok) {
      return initResult;
    }

    const jobId = (initResult.data as Job).id;

    return firstValueFrom(this.waitForJobReady(jobId, token).pipe()).then(
      (res) => {
        if (res === null) {
          return {
            ok: false,
            error: {
              status: 500,
              message: 'Failed to check export job status',
            },
          } as ApiResult<string>;
        }
        if ((res as Job).status === JobStatus.FAILED) {
          return {
            ok: false,
            error: {
              status: 500,
              message: (res as Job).reason_for_failure || 'Export job failed',
            },
          } as ApiResult<string>;
        }
        return { ok: true, data: `api/v1/channels/download/${jobId}` };
      },
    );
  }

  async importChannel(
    formData: FormData,
    updateDatasets: boolean,
    updateDataSources: boolean,
    cleanUp: boolean,
    token: JWT | null,
  ): Promise<ApiResult<null>> {
    const initResult = await this.post(
      `${CHANNELS_IMPORT_URL}?update_data_sources=${updateDataSources}&update_datasets=${updateDatasets}&clean_up=${cleanUp}`,
      formData,
      void 0,
      void 0,
      token,
    );

    if (!initResult.ok) {
      return initResult;
    }

    const jobId = (initResult.data as Job).id;

    return firstValueFrom(this.waitForJobReady(jobId, token).pipe()).then(
      (res) => {
        if (res === null) {
          return {
            ok: false,
            error: {
              status: 500,
              message: 'Failed to check import job status',
            },
          } as ApiResult<null>;
        }
        if ((res as Job).status === JobStatus.FAILED) {
          return {
            ok: false,
            error: {
              status: 500,
              message: (res as Job).reason_for_failure || 'Import job failed',
            },
          } as ApiResult<null>;
        }
        return { ok: true, data: null };
      },
    );
  }

  downloadFile(id: string, token: JWT | null) {
    return this.streamRequest(CHANNELS_JOB_DOWNLOAD_ID_URL(id), token);
  }

  private waitForJobReady(id: number, token: JWT | null) {
    return race(interval(2000)).pipe(
      concatMap(() => {
        return this.getRaw(CHANNELS_JOB_ID_URL(id), token);
      }),
      filter((res) => {
        if (res === null) return true;
        return (
          (res as Job).status === JobStatus.COMPLETED ||
          (res as Job).status === JobStatus.FAILED
        );
      }),
      first(),
      timeout({
        each: 5 * 60 * 1000,
        with: () =>
          throwError(() => new Error('Timeout waiting for server status')),
      }),
    );
  }

  getChannel(id: string, token: JWT | null): Promise<ApiResult<Channel>> {
    return this.get(CHANNEL_ID_URL(id), token);
  }

  getChannelTerms(
    id: string,
    token: JWT | null,
  ): Promise<ApiResult<ChannelTerm[]>> {
    return this.get<{ data: ChannelTerm[] }>(
      `${CHANNEL_TERMS_URL(id)}?limit=1000&offset=0`,
      token,
    ).then((result) =>
      result.ok ? { ok: true, data: result.data.data } : result,
    );
  }

  getChannelJobs(id: string, token: JWT | null): Promise<ApiResult<Job[]>> {
    return this.get<{ data: Job[] }>(
      `${CHANNEL_JOBS_URL(id)}?limit=1000&offset=0`,
      token,
    ).then((result) =>
      result.ok ? { ok: true, data: result.data.data } : result,
    );
  }

  updateChannelTerms(
    term: ChannelTerm,
    token: JWT | null,
  ): Promise<ApiResult<ChannelTerm[]>> {
    return this.post(
      `${MAIN_API}/terms/${term.id}`,
      term,
      void 0,
      void 0,
      token,
    );
  }

  removeChannelTerms(
    id: string,
    token: JWT | null,
  ): Promise<ApiResult<string>> {
    return this.delete(`${CHANNEL_TERMS_URL(id)}/bulk`, token);
  }

  addTerm(
    id: string,
    term: ChannelTerm,
    token: JWT | null,
  ): Promise<ApiResult<ChannelTerm[]>> {
    return this.post(CHANNEL_TERMS_URL(id), term, void 0, void 0, token);
  }

  removeChannelTerm(id: string, token: JWT | null): Promise<ApiResult<string>> {
    return this.delete(`${MAIN_API}/terms/${id}`, token);
  }

  updateChannel(
    channel: Channel,
    token: JWT | null,
  ): Promise<ApiResult<Channel>> {
    return this.post(
      CHANNEL_ID_URL(channel.id),
      channel,
      void 0,
      void 0,
      token,
    );
  }

  getChannelDataset(
    id: string,
    token: JWT | null,
  ): Promise<ApiResult<RequestData<ChannelDataset>>> {
    return this.get(`${CHANNEL_DATA_SETS_URL(id)}?limit=500`, token);
  }

  deduplicateDataset(
    id: string,
    token: JWT | null,
  ): Promise<ApiResult<RequestData<DataSet>>> {
    return this.post(CHANNEL_DEDUPLICATE_URL(id), {}, void 0, {}, token);
  }

  removeChannelDataset(
    id: string,
    dataSetId: string,
    token: JWT | null,
  ): Promise<ApiResult<string>> {
    return this.delete(DATASET_CHANNEL_URL(id, dataSetId), token);
  }

  addChannelDataset(
    id: string,
    dataSetId: string,
    token: JWT | null,
  ): Promise<ApiResult<RequestData<DataSet>>> {
    return this.post(
      DATASET_CHANNEL_URL(id, dataSetId),
      {},
      void 0,
      void 0,
      token,
    );
  }

  reloadDataSet(
    id: string,
    dataSetId: string,
    token: JWT | null,
  ): Promise<ApiResult<RequestData<DataSet>>> {
    return this.post(
      RELOAD_DATASET_CHANNEL_URL(id, dataSetId),
      {},
      void 0,
      void 0,
      token,
    );
  }

  getChannelDatasetAutoUpdateJobs(
    channelId: string,
    datasetId: string,
    token: JWT | null,
  ): Promise<ApiResult<AutoUpdateJob[]>> {
    return this.get<{ data: AutoUpdateJob[] }>(
      `${CHANNEL_DATASET_AUTO_UPDATE_JOBS_URL(channelId, datasetId)}?limit=1000&offset=0`,
      token,
    ).then((result) =>
      result.ok ? { ok: true, data: result.data.data } : result,
    );
  }

  getChannelDatasetVersions(
    channelId: string,
    datasetId: string,
    token: JWT | null,
  ): Promise<ApiResult<RequestData<ChannelDatasetVersion>>> {
    return this.get(
      `${CHANNEL_DATASET_VERSIONS_URL(channelId, datasetId)}?limit=500`,
      token,
    );
  }

  reloadDataSets(
    id: string,
    token: JWT | null,
  ): Promise<ApiResult<RequestData<DataSet>>> {
    return this.post(
      RELOAD_ALL_DATASETS_CHANNEL_URL(id),
      {},
      void 0,
      void 0,
      token,
    );
  }

  createChannel(
    channel: Channel,
    token: JWT | null,
  ): Promise<ApiResult<Channel>> {
    return this.post(CHANNELS_URL, channel, void 0, void 0, token);
  }

  removeChannel(id: string, token: JWT | null): Promise<ApiResult<string>> {
    return this.delete(`${CHANNELS_URL}/${id}`, token);
  }

  getChannelIndexStatus(
    id: string,
    token: JWT | null,
  ): Promise<ApiResult<ChannelIndexStatus>> {
    return this.get(`${CHANNEL_INDEX_STATUS_URL(id)}?scope=full`, token);
  }
}
