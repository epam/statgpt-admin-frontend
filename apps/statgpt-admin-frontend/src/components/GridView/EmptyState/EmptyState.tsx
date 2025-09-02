import { FC } from 'react';
import { IconClipboardX } from '@tabler/icons-react';

interface Props {
  title: string;
}

export const EmptyState: FC<Props> = ({ title }) => {
  return (
    <div className="small text-primary flex flex-col h-full w-full items-center justify-center">
      <IconClipboardX
        className="text-secondary"
        width={60}
        height={60}
        stroke={0.5}
      />
      {title}
    </div>
  );
};
