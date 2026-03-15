import { ChannelType, EmbedBuilder, TextChannel } from 'discord.js';
import { config } from '../config.js';
import { botClient } from './bot.service.js';
import { parseColor } from '../utils/parseColor.js';

export type AnnouncementPayload = {
  channelId: string;
  title: string;
  description: string;
  content?: string;
  color?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  footer?: string;
};

export async function sendAnnouncement(payload: AnnouncementPayload) {
  console.log('[EmbedService] Sending announcement:', JSON.stringify(payload, null, 2));

  const guild = await botClient.guilds.fetch(config.discordGuildId);
  const channel = await guild.channels.fetch(payload.channelId);

  if (!channel || (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement)) {
    throw new Error('Selected channel is not a text or announcement channel');
  }

  const embed = new EmbedBuilder()
    .setTitle(payload.title.trim())
    .setDescription(payload.description.trim())
    .setTimestamp();

  const color = parseColor(payload.color);
  if (color !== undefined) embed.setColor(color);
  if (payload.imageUrl) embed.setImage(payload.imageUrl.trim());
  if (payload.thumbnailUrl) embed.setThumbnail(payload.thumbnailUrl.trim());
  if (payload.footer) embed.setFooter({ text: payload.footer.trim() });

  const messageOptions: { content?: string; embeds: EmbedBuilder[] } = { embeds: [embed] };
  if (payload.content?.trim()) {
    messageOptions.content = payload.content.trim();
  }

  await (channel as TextChannel).send(messageOptions);
  console.log('[EmbedService] Announcement sent successfully to channel:', channel.name);
}
