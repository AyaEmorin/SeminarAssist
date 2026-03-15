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

export async function getGuildMembers() {
  console.log('[GuildService] Fetching guild members...');
  const guild = await botClient.guilds.fetch(config.discordGuildId);
  const members = await guild.members.fetch();

  const result = [...members.values()].map((m) => ({
    id: m.id,
    displayName: m.displayName,
    username: m.user.username,
    avatarUrl: m.user.displayAvatarURL({ size: 32 }),
    bot: m.user.bot
  }));

  console.log(`[GuildService] Fetched ${result.length} members`);
  return result.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export async function getGuildRoles() {
  console.log('[GuildService] Fetching guild roles...');
  const guild = await botClient.guilds.fetch(config.discordGuildId);
  const roles = await guild.roles.fetch();

  const result = [...roles.values()]
    .filter((r) => r.name !== '@everyone')
    .map((r) => ({
      id: r.id,
      name: r.name,
      color: r.hexColor
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  console.log(`[GuildService] Fetched ${result.length} roles`);
  return result;
}
