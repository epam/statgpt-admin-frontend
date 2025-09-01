'use client';

import React, { createContext, useContext, useState, ReactNode, FC } from 'react';
import { v4 as uuidv4 } from 'uuid';

import NotificationPortal from '@/src/components/Notification/NotificationPortal';
import { NotificationConfig, Notification } from '@/src/models/notification';

interface NotificationManager {
  showNotification: (config: Notification) => string;
  removeNotification: (id: string) => void;
}

const DEFAULT_DURATION = 60000;

const NotificationContext = createContext<NotificationManager | null>(null);

export const NotificationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationConfig[]>([]);

  const showNotification = (notification: Notification) => {
    const id = uuidv4();

    setNotifications((prev) => [
      ...prev,
      {
        ...notification,
        id,
        onClose: () => {
          return removeNotification(id);
        },
      },
    ]);

    if (notification.duration !== null) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration ?? DEFAULT_DURATION);
    }

    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => {
      return prev.filter((notification) => notification.id !== id);
    });
  };

  return (
    <NotificationContext.Provider value={{ showNotification, removeNotification }}>
      {children}
      {notifications.length > 0 && <NotificationPortal notifications={notifications} />}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};
