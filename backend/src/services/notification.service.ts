import Notification from '../models/Notification';

/**
 * Service to manage system alerts and notifications.
 */
export class NotificationService {
  async getNotifications(userId: string) {
    return Notification.find({ userId, isDeleted: false }).sort({ createdAt: -1 });
  }

  async markAsRead(id: string, userId: string) {
    return Notification.findOneAndUpdate({ _id: id, userId }, { read: true }, { new: true });
  }

  async createNotification(userId: string, title: string, message: string) {
    return Notification.create({ userId, title, message });
  }
}
export default NotificationService;
