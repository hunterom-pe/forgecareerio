"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type NotificationType = "intel" | "radar" | "reminder" | "report";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  date: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "read" | "date">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);


  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = React.useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const addNotification = React.useCallback((notif: Omit<Notification, "id" | "read" | "date">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [
      { ...notif, id, read: false, date: new Date() },
      ...prev,
    ]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      markAsRead(id);
    }, 3000);
  }, [markAsRead]);

  const markAllAsRead = React.useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
