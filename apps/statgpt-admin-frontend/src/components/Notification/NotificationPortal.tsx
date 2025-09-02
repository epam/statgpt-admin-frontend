import { FC } from 'react';
import { createPortal } from 'react-dom';

import DynamicNotification from '@/src/components/Notification/DynamicNotification';
import Notification from '@/src/components/Notification/Notification';
import {
  NotificationConfig,
  NotificationType,
} from '@/src/models/notification';

interface Props {
  notifications: NotificationConfig[];
}

const NotificationPortal: FC<Props> = ({ notifications }) => {
  return (
    <>
      {createPortal(
        <div className="flex flex-col fixed bottom-3 right-3 z-50">
          {notifications.map((notification) =>
            notification.type === NotificationType.dynamic ? (
              <DynamicNotification key={notification.id} {...notification} />
            ) : (
              <Notification key={notification.id} {...notification} />
            ),
          )}
        </div>,
        document.body,
      )}
    </>
  );
};

export default NotificationPortal;
