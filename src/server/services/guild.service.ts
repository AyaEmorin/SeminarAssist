import { ChannelType } from 'discord.js';
import { config } from '../config.js';
import { botClient } from './bot.service.js';

export async function getAllowedAnnouncementChannels() {
  const guild = await botClient.guilds.fetch(config.discordGuildId);
  const channels = await guild.channels.fetch();

  return [...channels.values()]
    .filter((channel): channel is NonNullable<typeof channel> => Boolean(channel))
    .filter(
      (channel) =>
        channel.type === ChannelType.GuildText ||
        channel.type === ChannelType.GuildAnnouncement
    )
    .map((channel) => ({
      id: channel.id,
      name: channel.name,
      type: ChannelType[channel.type] ?? String(channel.type)
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
