import { FC } from 'react';

import { AddChannelsModal } from '@/src/components/AddChannelsModal/AddChannelsModal';
import { AddDataSetModal } from '@/src/components/AddDataSet/AddDataSet';
import { AddDataSourceModal } from '@/src/components/AddDataSourceModal/AddDataSourceModal';
import { AddDocumentModal } from '@/src/components/AddDocument/AddDocument';
import { Menu } from '@/src/constants/menu';

interface Props {
  type: string;
  close: () => void;
}

export const AddEntityModal: FC<Props> = ({ close, type }) => {
  if (type === Menu.DATA_SOURCES) {
    return <AddDataSourceModal close={() => close()} />;
  }

  if (type === Menu.CHANNELS) {
    return <AddChannelsModal close={() => close()} />;
  }

  if (type === Menu.DOCUMENTS) {
    return <AddDocumentModal close={() => close()} />;
  }

  return (
    <>{type === Menu.DATA_SETS && <AddDataSetModal close={() => close()} />}</>
  );
};
