import { GuildMember, VoiceBasedChannel } from 'discord.js';
import * as musicService from '../../music/music.service.js';
import { getQueue as getQueueRaw } from '../../music/queue.js';
import { config } from '../config.js';

export async function handleJoin(member: GuildMember) {
  const channel = member.voice.channel as VoiceBasedChannel;
  if (!channel) throw new Error('คุณต้องอยู่ในห้องเสียงก่อน');

  await musicService.join(channel.guild.id, channel.id, config.musicDefaultVolume);
}

export async function handleLeave(guildId: string) {
  await musicService.leave(guildId);
}

export async function handlePlay(
  member: GuildMember,
  query: string,
  requestedBy: string,
) {
  const channel = member.voice.channel as VoiceBasedChannel;
  if (!channel) throw new Error('คุณต้องอยู่ในห้องเสียงก่อน');

  return musicService.play(
    channel.guild.id,
    channel.id,
    query,
    requestedBy,
    config.musicDefaultVolume,
  );
}

export function handleSkip(guildId: string) {
  return musicService.skip(guildId);
}

export function handleStop(guildId: string) {
  return musicService.stop(guildId);
}

export function getQueue(guildId: string) {
  return getQueueRaw(guildId);
}