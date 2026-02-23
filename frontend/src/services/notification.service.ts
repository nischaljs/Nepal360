import api from './api';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const getNotifications = async (limit = 20, offset = 0) => {
  const { data } = await api.get(`/notifications?limit=${limit}&offset=${offset}`);
  return data.data as { notifications: Notification[]; unreadCount: number };
};

export const getUnreadCount = async () => {
  const { data } = await api.get('/notifications/unread-count');
  return data.data.count as number;
};

export const markAsRead = async (id: string) => {
  await api.put(`/notifications/${id}/read`);
};

export const markAllAsRead = async () => {
  await api.put('/notifications/read-all');
};
