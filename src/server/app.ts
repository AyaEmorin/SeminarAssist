import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { dashboardRouter } from './routes/dashboard.routes.js';
import { discordRouter } from './routes/discord.routes.js';
import './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client');
const clientIndexPath = path.join(clientDistPath, 'index.html');

export function createApp() {
  const app = express();

  app.use(express.json({ limit: '1mb' }));
  app.use('/api', discordRouter);
  app.use('/api', dashboardRouter);

  // Serve static files from public directory
  const rootPath = path.resolve(__dirname, '../../');
  app.use(express.static(path.join(rootPath, 'public')));

  if (config.nodeEnv === 'production') {
    app.use(express.static(clientDistPath));

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        next();
        return;
      }
      res.sendFile(clientIndexPath);
    });
  }

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    const status = message === 'Forbidden' ? 403 : 500;
    res.status(status).send(message);
  });

  return app;
}
