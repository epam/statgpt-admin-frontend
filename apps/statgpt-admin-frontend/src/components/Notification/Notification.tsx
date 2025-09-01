import {
  IconChevronDown,
  IconCircleCheck,
  IconExclamationCircle,
  IconX,
} from '@tabler/icons-react';
import classNames from 'classnames';
import { FC, ReactNode } from 'react';

import { BASE_ICON_PROPS } from '@/src/constants/layout';
import { Button } from '@/src/components/BaseComponents/Button/Button';
import LoaderSmall from '@/src/components/BaseComponents/Loader/Loader';
import {
  NotificationConfig,
  NotificationIconColor,
  NotificationType,
} from '@/src/models/notification';

export const NotificationIcons: Record<NotificationType, ReactNode> = {
  success: <IconCircleCheck {...BASE_ICON_PROPS} />,
  error: <IconExclamationCircle {...BASE_ICON_PROPS} />,
  dynamic: <IconChevronDown {...BASE_ICON_PROPS} />,
  loading: <LoaderSmall />,
};

const Notification: FC<NotificationConfig> = ({
  type,
  title,
  description,
  onClose,
}) => {
  const Icon = NotificationIcons[type];
  const iconClassNames = classNames('inline mr-2', NotificationIconColor[type]);

  return (
    <div className="flex flex-col layer-3 px-4 py-2 w-[400px] bg-layer-3 [&:not(:last-child)]:mb-4 rounded shadow">
      <div className="flex flex-row w-full relative pr-5 items-center mb-2 ">
        <div className="flex items-center w-full">
          <i className={iconClassNames}>{Icon}</i>
          <p className="small font-semibold truncate">{title}</p>
        </div>
        <Button
          cssClass={'absolute right-0'}
          onClick={onClose}
          icon={<IconX height={18} width={18} />}
        />
      </div>
      <p className="tiny text-secondary">{description}</p>
    </div>
  );
};

export default Notification;
