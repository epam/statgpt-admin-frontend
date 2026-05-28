import { Menu } from '@/src/constants/menu';
import { BaseEntityWithDetails } from '@/src/models/base-entity';
import { CHANNELS_URL } from '@/src/server/channels-api';
import { DATA_SETS_URL } from '@/src/server/data-sets-api';
import { DATA_SOURCE_URL } from '@/src/server/data-sources-api';

export const getConfigureProps = (
  listView: Menu,
  data: Record<string, unknown>,
): {
  entity: BaseEntityWithDetails;
  url: string;
  showNameInput?: boolean;
  title?: string;
} => {
  if (listView === Menu.CHANNEL_DATASETS) {
    return {
      entity: data.dataset as BaseEntityWithDetails,
      url: DATA_SETS_URL,
      showNameInput: true,
      title: 'Edit Dataset',
    };
  }
  if (listView === Menu.DATA_SETS) {
    return {
      entity: data as unknown as BaseEntityWithDetails,
      url: DATA_SETS_URL,
      showNameInput: true,
      title: 'Edit Dataset',
    };
  }
  return {
    entity: data as unknown as BaseEntityWithDetails,
    url: getUrl(listView),
  };
};

export const getUrl = (item: Menu) => {
  if (item === Menu.DATA_SOURCES) {
    return DATA_SOURCE_URL;
  }

  if (item === Menu.DATA_SETS) {
    return DATA_SETS_URL;
  }

  return CHANNELS_URL;
};

export const getDeleteTitle = (item: Menu) => {
  if (item === Menu.DATA_SOURCES) {
    return 'Confirm deleting Data Source';
  }

  if (item === Menu.DATA_SETS) {
    return 'Confirm deleting Dataset';
  }

  if (item === Menu.DOCUMENTS) {
    return 'Confirm deleting Document';
  }

  return 'Confirm deleting Channel';
};

export const getDeleteDescription = (
  item: Menu,
  data?: Record<string, unknown>,
) => {
  if (item === Menu.DATA_SOURCES) {
    return 'Are you sure that you want to remove Data Source?';
  }

  if (item === Menu.DATA_SETS) {
    return 'Are you sure that you want to remove Dataset?';
  }

  if (item === Menu.DOCUMENTS) {
    return 'Are you sure that you want to remove Document?';
  }

  if (item === Menu.CHANNEL_DATASETS) {
    const datasetName = (data?.dataset as Record<string, unknown> | undefined)
      ?.title as string | undefined;
    return `Are you sure that you want to remove ${datasetName ?? 'Dataset'} from this channel?`;
  }

  return 'Are you sure that you want to remove Channel?';
};
