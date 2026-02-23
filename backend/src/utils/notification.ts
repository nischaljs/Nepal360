import { prisma } from '../lib/prisma';
import { NotificationType } from '../../generated/prisma/enums';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: CreateNotificationParams) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link,
    },
  });

  return notification;
}
