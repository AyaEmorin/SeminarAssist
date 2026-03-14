import { createApp } from './app.js';
import { config } from './config.js';
import { startBot } from './services/bot.service.js';
import { registerRegistrationInteractions } from './bot/interactions/registration.interaction.js';
import { registerMusicInteractions } from './bot/interactions/music.interaction.js';

async function bootstrap() {
  registerRegistrationInteractions();
  registerMusicInteractions();
  await startBot();

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`HTTP server listening on ${config.publicUrl}`);
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
