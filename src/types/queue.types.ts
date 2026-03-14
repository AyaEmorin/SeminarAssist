import type { Player } from 'shoukaku';

export interface QueueTrack {
  encoded: string;
  title: string;
  uri: string;
  duration: number;
  requestedBy: string;
}

export interface GuildQueue {
  guildId: string;
  channelId: string;
  player: Player;
  tracks: QueueTrack[];
  current: QueueTrack | null;
  volume: number;
}
