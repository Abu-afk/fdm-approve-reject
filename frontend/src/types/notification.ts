export interface Notification {
  notificationId: string; 
  recipientId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  claimId?: string;
}