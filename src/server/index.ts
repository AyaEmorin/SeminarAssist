console.log('[Server] Process started, loading modules...');
import { createApp } from './app.js';
import { config } from './config.js';
import { startBot } from './services/bot.service.js';
import { registerRegistrationInteractions } from './bot/interactions/registration.interaction.js';
import { registerMusicInteractions } from './bot/interactions/music.interaction.js';
import { registerCleanInteraction } from './bot/interactions/clean.interaction.js';

async function bootstrap() {
  console.log('[Server] Starting bootstrap...');

  // 1) Register interaction handlers
  registerRegistrationInteractions();
  registerMusicInteractions();
  registerCleanInteraction();
  console.log('[Server] Interaction handlers registered.');

  // 2) Start HTTP server immediately (don't wait for bot)
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`[Server] HTTP server listening on Port ${config.port}`);
    console.log(`[Server] Public URL: ${config.publicUrl}`);
  });

  // 3) Start bot in background with timeout
  console.log('[Server] Connecting to Discord...');
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Bot login timed out after 30s')), 30_000)
    );
    await Promise.race([startBot(), timeout]);
    console.log('[Server] Bot is online!');
  } catch (error) {
    console.error('[Server] Bot startup failed:', error);
    console.error('[Server] HTTP server will continue running without bot.');
  }
}

bootstrap().catch((error) => {
  console.error('[Server] Fatal error:', error);
  process.exit(1);
});
