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
import { DataSet } from '@/src/models/data-sets';
import { RequestData } from '@/src/models/request-data';
import { MAIN_API } from './api';
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

export class ChannelsApi extends BaseApi {
  getChannels(token: JWT | null): Promise<RequestData<Channel> | null> {
    return this.get(CHANNELS_URL, token);
  }

  exportChannel(
    id: string,
    token: JWT | null,
  ): Promise<{ ok: boolean; res?: unknown }> {
    return this.post(CHANNEL_ID_EXPORT_URL(id), {}, void 0, void 0, token).then(
      (res) => {
        const id = (res as Job).id;

        return firstValueFrom(this.waitForJobReady(id, token).pipe()).then(
          (res) => {
            if ((res as Job).status === JobStatus.FAILED) {
              return { ok: false, res: (res as Job).reason_for_failure };
            } else {
              return { ok: true, res: `api/v1/channels/download/${id}` };
            }
          },
        );
      },
    );
  }

  importChannel(
    formData: FormData,
    updateDatasets: boolean,
    updateDataSources: boolean,
    cleanUp: boolean,
    token: JWT | null,
  ): Promise<{ ok: boolean; res?: unknown }> {
    return this.post(
      `${CHANNELS_IMPORT_URL}?update_data_sources=${updateDataSources}&update_datasets=${updateDatasets}&clean_up=${cleanUp}`,
      formData,
      void 0,
      void 0,
      token,
    ).then((res) => {
      const id = (res as Job).id;

      return firstValueFrom(this.waitForJobReady(id, token).pipe()).then(
        (res) => {
          if ((res as Job).status === JobStatus.FAILED) {
            return { ok: false, res: (res as Job).reason_for_failure };
          }
          return { ok: true };
        },
      );
    });
  }

  downloadFile(id: string, token: JWT | null) {
    return this.streamRequest(CHANNELS_JOB_DOWNLOAD_ID_URL(id), token);
  }

  private waitForJobReady(id: number, token: JWT | null) {
    return race(interval(2000)).pipe(
      concatMap(() => {
        return this.get(CHANNELS_JOB_ID_URL(id), token);
      }),
      filter((res) => {
        console.log('Preparing job', (res as Job).status);
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

  getChannel(id: string, token: JWT | null): Promise<Channel | null> {
    return this.get(CHANNEL_ID_URL(id), token);
  }

  getChannelTerms(
    id: string,
    token: JWT | null,
  ): Promise<ChannelTerm[] | null> {
    return this.get(`${CHANNEL_TERMS_URL(id)}?limit=1000&offset=0`, token).then(
      (res) => (res as { data: ChannelTerm[] }).data,
    );
  }

  getChannelJobs(id: string, token: JWT | null): Promise<Job[] | null> {
    return this.get(`${CHANNEL_JOBS_URL(id)}?limit=1000&offset=0`, token).then(
      (res) => (res as { data: Job[] }).data,
    );
  }

  updateChannelTerms(
    term: ChannelTerm,
    token: JWT | null,
  ): Promise<ChannelTerm[] | null> {
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
  ): Promise<ChannelTerm[] | null> {
    return this.delete(`${CHANNEL_TERMS_URL(id)}/bulk`, token);
  }

  addTerm(
    id: string,
    term: ChannelTerm,
    token: JWT | null,
  ): Promise<ChannelTerm[] | null> {
    return this.post(CHANNEL_TERMS_URL(id), term, void 0, void 0, token);
  }

  removeChannelTerm(
    id: string,
    token: JWT | null,
  ): Promise<ChannelTerm[] | null> {
    return this.delete(`${MAIN_API}/terms/${id}`, token);
  }

  updateChannel(channel: Channel, token: JWT | null): Promise<Channel | null> {
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
  ): Promise<RequestData<DataSet> | null> {
    return this.get(CHANNEL_DATA_SETS_URL(id), token);
  }

  removeChannelDataset(
    id: string,
    dataSetId: string,
    token: JWT | null,
  ): Promise<RequestData<DataSet> | null> {
    return this.delete(DATASET_CHANNEL_URL(id, dataSetId), token);
  }

  addChannelDataset(
    id: string,
    dataSetId: string,
    token: JWT | null,
  ): Promise<RequestData<DataSet> | null> {
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
  ): Promise<RequestData<DataSet> | null> {
    return this.post(
      RELOAD_DATASET_CHANNEL_URL(id, dataSetId),
      {},
      void 0,
      void 0,
      token,
    );
  }

  reloadDataSets(
    id: string,
    token: JWT | null,
  ): Promise<RequestData<DataSet> | null> {
    return this.post(
      RELOAD_ALL_DATASETS_CHANNEL_URL(id),
      {},
      void 0,
      void 0,
      token,
    );
  }

  createChannel(channel: Channel, token: JWT | null): Promise<Channel | null> {
    return this.post(CHANNELS_URL, channel, void 0, void 0, token);
  }

  removeChannel(id: string, token: JWT | null): Promise<unknown> {
    return this.delete(`${CHANNELS_URL}/${id}`, token);
  }
}
