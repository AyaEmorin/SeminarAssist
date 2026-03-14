import { Router } from 'express';
import { config } from '../config.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireDashboardAccess } from '../middleware/requireDashboardAccess.js';
import '../types.js';
import { getAllowedAnnouncementChannels } from '../services/guild.service.js';

export const discordRouter = Router();

discordRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = req.user!;
    const authorization = await import('../services/permission.service.js').then((mod) =>
      mod.getDashboardAuthorization(user.id)
    );

    const avatarUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
      : null;

    res.json({
      id: user.id,
      username: user.username,
      avatarUrl,
      authorized: authorization.authorized,
      matchedRoles: authorization.matchedRoles
    });
  } catch (error) {
    next(error);
  }
});

discordRouter.get('/channels', requireAuth, requireDashboardAccess, async (_req, res, next) => {
  try {
    const channels = await getAllowedAnnouncementChannels();
    res.json(channels);
  } catch (error) {
    next(error);
  }
});

discordRouter.get('/health', (_req, res) => {
  res.json({ ok: true, guildId: config.discordGuildId });
});
