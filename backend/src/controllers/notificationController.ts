import { Response } from 'express';
import { query, execute } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export async function getNotifications(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const notifications = await query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
      [userId]
    );

    return res.json({
      success: true,
      notifications
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
}

export async function markAsRead(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (id === 'all') {
      await execute('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
    } else {
      await execute('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, userId]);
    }

    return res.json({ success: true, message: 'Notification(s) updated.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
}
