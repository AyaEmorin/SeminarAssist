import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireDashboardAccess } from '../middleware/requireDashboardAccess.js';
import { sendAnnouncement } from '../services/embed.service.js';

export const dashboardRouter = Router();

dashboardRouter.post('/announcements/send', requireAuth, requireDashboardAccess, async (req, res, next) => {
  try {
    await sendAnnouncement(req.body);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
