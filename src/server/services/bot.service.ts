import { Client, GatewayIntentBits } from 'discord.js';
import { config } from '../config.js';
import { initShoukaku } from '../../lavalink/connection.js';

export const botClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

let readyPromise: Promise<void> | null = null;

export async function startBot() {
  if (!readyPromise) {
    readyPromise = new Promise((resolve, reject) => {
      botClient.once('ready', () => {
        console.log(`[Bot] Logged in as ${botClient.user?.tag}`);

        // Initialize Shoukaku (Lavalink client) on bot ready
        initShoukaku(botClient);

        resolve();
      });
      botClient.login(config.discordBotToken).catch(reject);
    });
  }

  return readyPromise;
}
