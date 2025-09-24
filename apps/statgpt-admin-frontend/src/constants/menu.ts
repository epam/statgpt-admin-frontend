export enum Menu {
  DATA_SOURCES = 'Data Sources',
  DATA_SETS = 'Datasets',
  DOCUMENTS = 'Documents',
  CHANNELS = 'Channels',
}

export enum MenuUrl {
  DATA_SOURCES = '/data-sources',
  DATA_SETS = '/data-sets',
  DOCUMENTS = '/documents',
  CHANNELS = '/channels',
}

export const MENU_MAP: Record<MenuUrl, Menu> = {
  [MenuUrl.CHANNELS]: Menu.CHANNELS,
  [MenuUrl.DATA_SETS]: Menu.DATA_SETS,
  [MenuUrl.DATA_SOURCES]: Menu.DATA_SOURCES,
  [MenuUrl.DOCUMENTS]: Menu.DOCUMENTS,
};
