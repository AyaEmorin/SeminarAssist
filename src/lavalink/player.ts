import { getShoukaku } from './connection.js';
import type { Node, Player } from 'shoukaku';

/**
 * Get an ideal Shoukaku node (least-loaded).
 */
export function getIdealNode(): Node {
  const shoukaku = getShoukaku();
  const node = shoukaku.getIdealNode();
  if (!node) throw new Error('[Player] No available Lavalink nodes');
  return node;
}

/**
 * Get or create a Shoukaku Player for a guild.
 * Uses Shoukaku.joinVoiceChannel (not Node).
 */
export async function getOrCreatePlayer(
  guildId: string,
  channelId: string,
): Promise<Player> {
  const shoukaku = getShoukaku();

  const existing = shoukaku.players.get(guildId);
  if (existing) return existing;

  const player = await shoukaku.joinVoiceChannel({
    guildId,
    channelId,
    shardId: 0,
    deaf: true,
  });

  return player;
}

/**
 * Destroy a player and leave the voice channel.
 */
export async function destroyPlayer(guildId: string): Promise<void> {
  const shoukaku = getShoukaku();
  await shoukaku.leaveVoiceChannel(guildId);
}

export async function resolveTracks(query: string) {
  const node = getIdealNode();

  const isUrl = /^https?:\/\//.test(query);
  const searchQuery = isUrl ? query : `ytsearch:${query}`;

  console.log(`[Lavalink] Resolving: "${searchQuery}" on node "${node.name}"`);

  try {
    const result = await node.rest.resolve(searchQuery);

    if (!result || result.loadType === 'empty') {
      console.warn(`[Lavalink] No results found for: "${searchQuery}"`);
      return null;
    }

    if (result.loadType === 'error') {
      console.error(`[Lavalink] Resolution error for "${searchQuery}":`, result.data);
      return null;
    }

    console.log(`[Lavalink] Resolved successfully: "${result.loadType}" with ${result.loadType === 'track' ? '1' : (result.data as any).tracks?.length ?? (result.data as any).length ?? '0'} tracks`);
    return result;
  } catch (err) {
    console.error(`[Lavalink] Exception during resolution:`, err);
    return null;
  }
}
