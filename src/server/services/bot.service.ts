import { Client, Events, GatewayIntentBits } from 'discord.js';
import { config } from '../config.js';

export const botClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

let readyPromise: Promise<void> | null = null;

export async function startBot() {
  if (!readyPromise) {
    readyPromise = new Promise((resolve, reject) => {
      botClient.once(Events.ClientReady, () => {
        console.log(`[Bot] Logged in as ${botClient.user?.tag}`);
        resolve();
      });
      botClient.login(config.discordBotToken).catch(reject);
    });
  }

  return readyPromise;
}
