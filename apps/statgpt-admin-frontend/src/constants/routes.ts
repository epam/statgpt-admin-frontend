import { MenuUrl } from './menu';

type Id = string | number;

export const ROUTES = {
  dataSources: MenuUrl.DATA_SOURCES,
  dataSets: MenuUrl.DATA_SETS,
  documents: MenuUrl.DOCUMENTS,
  auditLogs: MenuUrl.AUDIT_LOGS,
  channels: MenuUrl.CHANNELS,
  channel: (channelId: Id) => `${MenuUrl.CHANNELS}/${channelId}`,
  channelGlossary: (channelId: Id) =>
    `${MenuUrl.CHANNELS}/${channelId}/glossary`,
  channelJobs: (channelId: Id) => `${MenuUrl.CHANNELS}/${channelId}/jobs`,
  datasetVersions: (channelId: Id, datasetId: Id) =>
    `${MenuUrl.CHANNELS}/${channelId}/datasets/${datasetId}/versions`,
  datasetAutoUpdateJobs: (channelId: Id, datasetId: Id) =>
    `${MenuUrl.CHANNELS}/${channelId}/datasets/${datasetId}/auto-update-jobs`,
} as const;
