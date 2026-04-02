import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextProps {
  notifications: Toast[];
  notify: (type: NotificationType, message: string) => void;
  remove: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Toast[]>([]);

  const notify = useCallback((type: NotificationType, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, type, message }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      remove(id);
    }, 4000);
  }, []);

  const remove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, notify, remove }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotify = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotify must be used within a NotificationProvider');
  }
  
  const notify = context.notify;
  
  return {
    success: (msg: string) => notify('success', msg),
    error: (msg: string) => notify('error', msg),
    info: (msg: string) => notify('info', msg),
    warning: (msg: string) => notify('warning', msg),
  };
};

export const useNotificationData = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationData must be used within a NotificationProvider');
  }
  return {
    notifications: context.notifications,
    remove: context.remove,
  };
};
