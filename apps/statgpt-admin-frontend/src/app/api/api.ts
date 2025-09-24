import { ChannelsApi } from '@/src/server/channels-api';
import { DataSetsApi } from '@/src/server/data-sets-api';
import { DataSourcesApi } from '@/src/server/data-sources-api';
import { DocumentsApi } from '@/src/server/documents-api';

export const dataSourcesApi = new DataSourcesApi({
  host: process.env.API_URL || '',
});

export const channelsApi = new ChannelsApi({
  host: process.env.API_URL || '',
});

export const dataSetsApi = new DataSetsApi({
  host: process.env.API_URL || '',
});

export const documentsApi = new DocumentsApi({
  dial: process.env.DIAL_API_URL || '',
  dialKey: process.env.DIAL_API_KEY || '',
});
