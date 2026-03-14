import { Request, Response, NextFunction } from 'express';
import { getDashboardAuthorization } from '../services/permission.service.js';
import '../types.js';

export async function requireDashboardAccess(req: Request, res: Response, next: NextFunction) {
  const discordUser = req.user;
  if (!discordUser) {
    res.status(401).send('Unauthorized');
    return;
  }

  try {
    const authorization = await getDashboardAuthorization(discordUser.id);
    if (!authorization.authorized) {
      res.status(403).send('Forbidden');
      return;
    }

    res.locals.dashboardAuthorization = authorization;
    next();
  } catch (error) {
    next(error);
  }
}
