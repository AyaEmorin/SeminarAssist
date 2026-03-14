import { GuildMember, PermissionFlagsBits } from 'discord.js';
import { config } from '../config.js';

export async function registerStudent(member: GuildMember, name: string, studentId: string) {
  const guild = member.guild;
  const botMember = guild.members.me;

  if (!botMember) {
    throw new Error('Bot member not found in guild');
  }

  if (!botMember.permissions.has(PermissionFlagsBits.ManageNicknames)) {
    throw new Error('Bot is missing Manage Nicknames permission');
  }

  if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
    throw new Error('Bot is missing Manage Roles permission');
  }

  if (member.roles.highest.position >= botMember.roles.highest.position) {
    throw new Error('Bot role is not high enough to change this member nickname');
  }

  const role = await guild.roles.fetch(config.autoRoleId);
  if (!role) {
    throw new Error(`Auto role not found: ${config.autoRoleId}`);
  }

  if (role.position >= botMember.roles.highest.position) {
    throw new Error('Bot role must be above the auto role in role hierarchy');
  }

  if (!/^\d+$/.test(studentId)) {
    throw new Error('Student ID must be numeric');
  }

  const nickname = `${name} | ${studentId}`.slice(0, 32);

  await member.setNickname(nickname, 'Student registration submitted');
  if (!member.roles.cache.has(role.id)) {
    await member.roles.add(role, 'Auto role after student registration');
  }

  return { nickname, roleName: role.name };
}
