import { Router } from 'express';
import { config } from '../config.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireDashboardAccess } from '../middleware/requireDashboardAccess.js';
import '../types.js';
import { getAllowedAnnouncementChannels, getGuildMembers, getGuildRoles } from '../services/guild.service.js';

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

discordRouter.get('/members', requireAuth, requireDashboardAccess, async (_req, res, next) => {
  try {
    const members = await getGuildMembers();
    res.json(members);
  } catch (error) {
    console.error('[Route] GET /api/members error:', error);
    next(error);
  }
});

discordRouter.get('/roles', requireAuth, requireDashboardAccess, async (_req, res, next) => {
  try {
    const roles = await getGuildRoles();
    res.json(roles);
  } catch (error) {
    console.error('[Route] GET /api/roles error:', error);
    next(error);
  }
});
