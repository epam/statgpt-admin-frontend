import { JWT } from 'next-auth/jwt';

import { DataSet } from '@/src/models/data-sets';
import { DataSource, DataSourceType } from '@/src/models/data-source';
import { RequestData } from '@/src/models/request-data';
import { MAIN_API } from './api';
import { BaseApi } from './base-api';

export const DATA_SOURCE_URL = `${MAIN_API}/data-sources`;
export const DATA_SOURCE_TYPE_URL = `${DATA_SOURCE_URL}/types`;

export const DATA_SOURCE_WITH_ID_URL = (id?: number | string) =>
  `${DATA_SOURCE_URL}/${id}`;

export const LOAD_AVAILABLE_DATA_SET_URL = (id?: number | string) =>
  `${DATA_SOURCE_WITH_ID_URL(id)}/available-datasets`;

export class DataSourcesApi extends BaseApi {
  getDataSources(token: JWT | null): Promise<RequestData<DataSource> | null> {
    return this.get(DATA_SOURCE_URL, token);
  }

  getDataSourcesTypes(
    token: JWT | null,
  ): Promise<RequestData<DataSourceType> | null> {
    return this.get(DATA_SOURCE_TYPE_URL, token);
  }

  createDataSource(
    ds: DataSource,
    token: JWT | null,
  ): Promise<DataSource | null> {
    return this.post(DATA_SOURCE_URL, ds, void 0, void 0, token);
  }

  updateDataSources(
    ds: DataSource,
    token: JWT | null,
  ): Promise<DataSource | null> {
    return this.post(DATA_SOURCE_WITH_ID_URL(ds.id), ds, void 0, void 0, token);
  }

  removeDataSource(id: string, token: JWT | null): Promise<unknown> {
    return this.delete(DATA_SOURCE_WITH_ID_URL(id), token);
  }

  loadAvailableDataSets(
    id: string,
    token: JWT | null,
  ): Promise<RequestData<DataSet> | null> {
    return this.get(LOAD_AVAILABLE_DATA_SET_URL(id), token);
  }
}
