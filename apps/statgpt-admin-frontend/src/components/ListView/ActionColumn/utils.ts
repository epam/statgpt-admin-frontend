import { Menu } from '@/src/constants/menu';
import { CHANNELS_URL } from '@/src/server/channels-api';
import { DATA_SETS_URL } from '@/src/server/data-sets-api';
import { DATA_SOURCE_URL } from '@/src/server/data-sources-api';

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

export const getDeleteDescription = (item: Menu) => {
  if (item === Menu.DATA_SOURCES) {
    return 'Are you sure that you want to remove Data Source?';
  }

  if (item === Menu.DATA_SETS) {
    return 'Are you sure that you want to remove Dataset?';
  }

  if (item === Menu.DOCUMENTS) {
    return 'Are you sure that you want to remove Document?';
  }

  return 'Are you sure that you want to remove Channel?';
};
