import { Client } from 'discord.js';
import { Shoukaku, Connectors } from 'shoukaku';
import { lavalinkNodes } from './nodes.js';

let shoukaku: Shoukaku | null = null;

export function initShoukaku(client: Client): Shoukaku {
  if (shoukaku) return shoukaku;

  shoukaku = new Shoukaku(new Connectors.DiscordJS(client), lavalinkNodes, {
    moveOnDisconnect: false,
    resume: true,
    resumeTimeout: 30,
    reconnectTries: 3,
    restTimeout: 10_000,
  });

  shoukaku.on('ready', (name) => {
    console.log(`[Shoukaku] Node "${name}" connected`);
  });

  shoukaku.on('error', (name, error) => {
    console.error(`[Shoukaku] Node "${name}" error:`, error);
  });

  shoukaku.on('close', (name, code, reason) => {
    console.warn(`[Shoukaku] Node "${name}" closed [${code}]: ${reason}`);
  });

  shoukaku.on('disconnect', (name, count) => {
    console.warn(`[Shoukaku] Node "${name}" disconnected; players=${count}`);
  });

  return shoukaku;
}

export function getShoukaku(): Shoukaku {
  if (!shoukaku) {
    throw new Error('[Shoukaku] Not initialized — call initShoukaku first');
  }
  return shoukaku;
}
