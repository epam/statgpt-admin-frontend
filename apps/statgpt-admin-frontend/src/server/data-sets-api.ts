import { JWT } from 'next-auth/jwt';

import { DataSet } from '@/src/models/data-sets';
import { RequestData } from '@/src/models/request-data';
import { ApiResult, MAIN_API } from './api';
import { BaseApi } from './base-api';

export const DATA_SETS_URL = `${MAIN_API}/datasets`;

export const DATA_SETS_WITH_ID_URL = (id?: string | number) =>
  `${DATA_SETS_URL}/${id}`;

export const RELOAD_DIMENSIONS_DATA_SETS_WITH_ID_URL = (id?: string | number) =>
  `${DATA_SETS_WITH_ID_URL(id)}/reload-dimensions`;

export class DataSetsApi extends BaseApi {
  getDataSets(token: JWT | null): Promise<ApiResult<RequestData<DataSet>>> {
    return this.get(`${DATA_SETS_URL}?limit=500`, token);
  }

  createDataSet(
    ds: DataSet,
    token: JWT | null,
  ): Promise<ApiResult<RequestData<DataSet>>> {
    return this.post(DATA_SETS_URL, ds, void 0, void 0, token);
  }

  removeDataSet(id: string, token: JWT | null): Promise<ApiResult<string>> {
    return this.delete(`${DATA_SETS_URL}/${id}`, token);
  }

  updateDataSet(ds: DataSet, token: JWT | null): Promise<ApiResult<DataSet>> {
    return this.post(DATA_SETS_WITH_ID_URL(ds.id), ds, void 0, void 0, token);
  }

  reloadDimensionsDataSet(
    id: string,
    token: JWT | null,
  ): Promise<ApiResult<DataSet>> {
    return this.post(
      RELOAD_DIMENSIONS_DATA_SETS_WITH_ID_URL(id),
      {},
      void 0,
      void 0,
      token,
    );
  }
}
