import { FC, ReactNode } from 'react';

import AlertTriangleFilledIcon from '@/public/icons/alert-triangle-filled.svg';

interface Props {
  children: ReactNode;
  action?: ReactNode;
}

export const AlertBanner: FC<Props> = ({ children, action }) => {
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 my-4 rounded border border-warning bg-warning">
      <AlertTriangleFilledIcon width={24} height={24} className="shrink-0" />
      <div className="flex-1 text-sm text-primary">{children}</div>
      {action}
    </div>
  );
};
