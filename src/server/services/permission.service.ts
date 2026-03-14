import { config } from '../config.js';
import { botClient } from './bot.service.js';

export async function getGuildMemberOrThrow(userId: string) {
  const guild = await botClient.guilds.fetch(config.discordGuildId);
  return guild.members.fetch(userId);
}

export async function getDashboardAuthorization(userId: string) {
  const member = await getGuildMemberOrThrow(userId);
  const matchedRoles = member.roles.cache
    .filter((role) => config.allowedRoleIds.includes(role.id))
    .map((role) => role.id);

  const allowedByRole = matchedRoles.length > 0;
  const allowedByUser = config.allowedUserIds.includes(userId);

  return {
    authorized: allowedByRole || allowedByUser,
    matchedRoles,
    member
  };
}
