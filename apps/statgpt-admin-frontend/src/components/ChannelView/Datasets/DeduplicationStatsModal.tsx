'use client';

import { FC, useState } from 'react';

import InfoIcon from '@/public/icons/info.svg';
import { Button } from '@/src/components/BaseComponents/Button/Button';
import Modal from '@/src/components/Modal/ModalView';
import { ChannelIndexStatusDeduplication } from '@/src/models/channel-index-status';
import { PopUpState } from '@/src/types/modal';
import { DeduplicationStats } from './DeduplicationStats';

interface Props {
  deduplication?: ChannelIndexStatusDeduplication | null;
}

export const DeduplicationStatsModal: FC<Props> = ({ deduplication }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        title="Deduplicate statistics"
        cssClass="tertiary mr-3"
        icon={<InfoIcon width={18} height={18} />}
        onClick={() => setOpen(true)}
      />

      <Modal
        portalId="theme-main"
        state={open ? PopUpState.Opened : PopUpState.Closed}
        header="Duplicate statistics"
        containerClassName="w-full min-w-[90%] md:min-w-[300px] md:max-w-[420px] px-6 py-6"
        onClose={() => setOpen(false)}
      >
        {deduplication != null ? (
          <DeduplicationStats deduplication={deduplication} />
        ) : (
          <p className="text-sm text-secondary">
            No deduplication data available.
          </p>
        )}
        <div className="flex justify-end mt-4">
          <button className="secondary" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
      </Modal>
    </>
  );
};
