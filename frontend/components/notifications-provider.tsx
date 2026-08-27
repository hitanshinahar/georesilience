"use client";

import { useNotifications } from '@/lib/hooks/use-notifications';

export function NotificationsProvider() {
  useNotifications();
  return null;
}
