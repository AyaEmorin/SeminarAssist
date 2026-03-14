import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import '../types.js';

const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).send('Unauthorized: Missing or invalid Authorization header');
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      res.status(401).send('Unauthorized: Invalid token');
      return;
    }

    req.user = {
      id: user.user_metadata.provider_id || user.user_metadata.sub || user.identities?.[0]?.id || user.id, // Discord ID
      username: user.user_metadata.full_name || user.user_metadata.name || user.user_metadata.preferred_username || 'Unknown',
      avatar: user.user_metadata.avatar_url ? user.user_metadata.avatar_url.split('/avatars/')[1]?.split('.')[0] || null : null
    };
    next();
  } catch (error) {
    res.status(401).send('Unauthorized');
  }
}

