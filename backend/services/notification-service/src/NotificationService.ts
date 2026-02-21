import axios from 'axios';

export type NotificationChannel = 'email' | 'push' | 'in_app';

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  channels: NotificationChannel[];
  createdAt?: Date;
  read?: boolean;
}

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface PushOptions {
  token: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface InAppOptions {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export class NotificationService {
  private emailServiceUrl: string;
  private pushServiceUrl?: string; // for future push notification service

  constructor(emailServiceUrl: string = process.env.EMAIL_SERVICE_URL || 'http://localhost:3005') {
    this.emailServiceUrl = emailServiceUrl;
  }

  /**
   * Send a notification through specified channels.
   */
  async send(notification: Notification): Promise<void> {
    const promises: Promise<any>[] = [];

    if (notification.channels.includes('email')) {
      promises.push(this.sendEmail(notification));
    }
    if (notification.channels.includes('push')) {
      promises.push(this.sendPush(notification));
    }
    if (notification.channels.includes('in_app')) {
      promises.push(this.saveInApp(notification));
    }

    await Promise.allSettled(promises);
  }

  private async sendEmail(notification: Notification): Promise<void> {
    try {
      // In a real implementation, you might fetch the user's email from a database.
      // For now, we assume the notification contains the user's email in data.
      const email = notification.data?.email;
      if (!email) {
        console.warn('No email address provided for notification');
        return;
      }

      await axios.post(`${this.emailServiceUrl}/send`, {
        to: email,
        subject: notification.title,
        text: notification.body,
        html: `<p>${notification.body}</p>`,
      });
      console.log(`Email sent to ${email}`);
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  private async sendPush(notification: Notification): Promise<void> {
    // Placeholder for push notification logic (e.g., Firebase Cloud Messaging)
    console.log('Push notification would be sent:', notification.title);
    // In a real implementation, you would call a push service.
  }

  private async saveInApp(notification: Notification): Promise<void> {
    try {
      // This would save the notification to a database (e.g., using Prisma)
      // Assuming you have a Notification model in your Prisma schema.
      // For now, we just log it.
      console.log('In-app notification saved (placeholder):', notification.title);
      // const prisma = new PrismaClient();
      // await prisma.notification.create({
      //   data: {
      //     userId: notification.userId,
      //     title: notification.title,
      //     body: notification.body,
      //     data: notification.data,
      //     read: false,
      //   },
      // });
    } catch (error) {
      console.error('Failed to save in-app notification:', error);
    }
  }

  /**
   * Mark an in-app notification as read.
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    // Implementation would update the database.
    console.log(`Mark notification ${notificationId} as read for user ${userId}`);
  }

  /**
   * Get unread notifications for a user.
   */
  async getUnread(userId: string): Promise<Notification[]> {
    // This would query the database.
    console.log(`Fetch unread notifications for user ${userId}`);
    return [];
  }
}

// Helper to create a configured notification service
export function createNotificationService(): NotificationService {
  return new NotificationService();
}

export default NotificationService;
