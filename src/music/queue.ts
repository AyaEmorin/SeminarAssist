import type { Player } from 'shoukaku';
import type { Track } from './track.js';

export interface GuildQueue {
  guildId: string;
  channelId: string;
  player: Player;
  tracks: Track[];
  current: Track | null;
  volume: number;
}

const queues = new Map<string, GuildQueue>();

export function getQueue(guildId: string): GuildQueue | undefined {
  return queues.get(guildId);
}

export function getOrCreateQueue(
  guildId: string,
  channelId: string,
  player: Player,
  volume: number = 0.4,
): GuildQueue {
  const existing = queues.get(guildId);
  if (existing) return existing;

  const queue: GuildQueue = {
    guildId,
    channelId,
    player,
    tracks: [],
    current: null,
    volume,
  };

  queues.set(guildId, queue);
  return queue;
}

export function destroyQueue(guildId: string): void {
  queues.delete(guildId);
}

export function addTrack(guildId: string, track: Track): void {
  const queue = queues.get(guildId);
  if (!queue) throw new Error('No queue for this guild');
  queue.tracks.push(track);
}

export function nextTrack(guildId: string): Track | null {
  const queue = queues.get(guildId);
  if (!queue) return null;

  const track = queue.tracks.shift() ?? null;
  queue.current = track;
  return track;
}

export function clearQueue(guildId: string): void {
  const queue = queues.get(guildId);
  if (!queue) return;
  queue.tracks = [];
  queue.current = null;
}
