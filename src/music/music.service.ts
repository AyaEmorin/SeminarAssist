import { getOrCreatePlayer, resolveTracks, destroyPlayer } from '../lavalink/player.js';
import {
  getOrCreateQueue,
  getQueue,
  destroyQueue,
  addTrack,
  nextTrack,
  clearQueue,
} from './queue.js';
import type { Track } from './track.js';

/**
 * Attach track-end / closed listeners to a player.
 * This is called once per player creation to auto-advance the queue.
 */
function attachPlayerEvents(guildId: string): void {
  const queue = getQueue(guildId);
  if (!queue) return;

  queue.player.on('start', (data) => {
    console.log(`[Music] Track started in ${guildId}:`, data.track?.info?.title ?? 'unknown');
  });

  queue.player.on('end', async (data) => {
    console.log(`[Music] Track ended in ${guildId}, reason: ${data.reason}`);
    if (data.reason !== 'replaced') {
      try {
        await playNext(guildId);
      } catch (err) {
        console.error(`[Music] Error playing next track in ${guildId}:`, err);
      }
    }
  });

  queue.player.on('exception', (data) => {
    console.error(`[Music] Track exception in ${guildId}:`, data);
  });

  queue.player.on('stuck', (data) => {
    console.warn(`[Music] Track stuck in ${guildId}, threshold: ${data.thresholdMs}ms`);
  });

  queue.player.on('closed', (data) => {
    console.warn(`[Music] Player closed for guild ${guildId}, code: ${data.code}, reason: ${data.reason}`);
    destroyQueue(guildId);
  });
}

/**
 * Play or enqueue a track in the given guild.
 *
 * 1. Resolve the query via Lavalink
 * 2. Join voice channel (or reuse existing player)
 * 3. Add track to queue
 * 4. If nothing is currently playing, start playback
 */
export async function play(
  guildId: string,
  channelId: string,
  query: string,
  requestedBy: string,
  volume: number = 0.4,
): Promise<{ queued: Track; position: number; isPlayingNow: boolean }> {
  // Resolve the query
  const result = await resolveTracks(query);

  if (!result) {
    throw new Error('ไม่พบเพลงจากคำค้นหาที่ระบุ');
  }

  let rawTrack: { encoded: string; info: { title: string; uri?: string; length: number } };

  if (result.loadType === 'track') {
    rawTrack = result.data;
  } else if (result.loadType === 'search') {
    if (result.data.length === 0) throw new Error('ไม่พบผลการค้นหา');
    rawTrack = result.data[0];
  } else if (result.loadType === 'playlist') {
    if (result.data.tracks.length === 0) throw new Error('Playlist ว่างเปล่า');
    rawTrack = result.data.tracks[0];
  } else {
    throw new Error('ไม่สามารถโหลดเพลงได้');
  }

  const track: Track = {
    encoded: rawTrack.encoded,
    title: rawTrack.info.title,
    uri: rawTrack.info.uri ?? '',
    duration: rawTrack.info.length,
    requestedBy,
  };

  // Get or create the player + queue
  const player = await getOrCreatePlayer(guildId, channelId);
  const isNewQueue = !getQueue(guildId);
  const queue = getOrCreateQueue(guildId, channelId, player, volume);

  // Attach auto-advance events if this is a new queue/player
  if (isNewQueue) {
    attachPlayerEvents(guildId);
  }

  // Set volume
  await player.setGlobalVolume(Math.round(volume * 100));

  // Add track to queue
  addTrack(guildId, track);
  const position = queue.tracks.length;

  // If nothing is playing, start now
  const isPlayingNow = !queue.current;
  if (isPlayingNow) {
    await playNext(guildId);
  }

  return { queued: track, position, isPlayingNow };
}

/**
 * Play the next track in the queue.
 */
export async function playNext(guildId: string): Promise<void> {
  const queue = getQueue(guildId);
  if (!queue) return;

  const track = nextTrack(guildId);

  if (!track) {
    // Queue finished
    queue.current = null;
    console.log(`[Music] Queue empty for ${guildId}`);
    return;
  }

  console.log(`[Music] Playing track: "${track.title}" (encoded length: ${track.encoded.length})`);
  await queue.player.playTrack({ track: { encoded: track.encoded } });
  console.log(`[Music] playTrack called successfully for ${guildId}`);
}

/**
 * Skip the current track.
 */
export async function skip(guildId: string): Promise<Track | null> {
  const queue = getQueue(guildId);
  if (!queue) return null;

  const skipped = queue.current;
  await playNext(guildId);
  return skipped;
}

/**
 * Stop playback and clear the queue.
 */
export async function stop(guildId: string): Promise<void> {
  const queue = getQueue(guildId);
  if (!queue) return;

  clearQueue(guildId);
  await queue.player.stopTrack();
  await destroyPlayer(guildId);
  destroyQueue(guildId);
}

/**
 * Join a voice channel without playing anything.
 */
export async function join(
  guildId: string,
  channelId: string,
  volume: number = 0.4,
): Promise<void> {
  const player = await getOrCreatePlayer(guildId, channelId);
  const isNewQueue = !getQueue(guildId);
  getOrCreateQueue(guildId, channelId, player, volume);

  if (isNewQueue) {
    attachPlayerEvents(guildId);
  }
}

/**
 * Leave the voice channel.
 */
export async function leave(guildId: string): Promise<void> {
  await destroyPlayer(guildId);
  destroyQueue(guildId);
}
