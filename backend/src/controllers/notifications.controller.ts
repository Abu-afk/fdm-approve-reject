import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { db } from '../lib/db';

// GET /notifications
export function getMyNotifications(req: AuthRequest, res: Response): void {
  try {
    const notifications = db.notifications
      .byRecipient(req.user!.employeeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching notifications' });
  }
}

// PATCH /notifications/:id/read
export function markAsRead(req: AuthRequest, res: Response): void {
  try {
    const notif = db.notifications.markAsRead(req.params.id);

    if (!notif) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    res.status(200).json(notif);
  } catch (err) {
    res.status(400).json({ error: 'Error updating notification' });
  }
}