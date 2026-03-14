import { REST, Routes, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { config } from '../src/server/config.js';

const commands = [
  new SlashCommandBuilder()
    .setName('setup-registration')
    .setDescription('ส่งข้อความลงทะเบียนนักศึกษาพร้อมปุ่มกรอกข้อมูล')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder().setName('join').setDescription('ให้บอทเข้ามาในห้องเสียงปัจจุบัน'),
  new SlashCommandBuilder().setName('leave').setDescription('ออกจากห้องเสียงและล้างคิวเพลงทั้งหมด'),
  new SlashCommandBuilder()
    .setName('play')
    .setDescription('เล่นเพลงจาก URL หรือคำค้นหา')
    .addStringOption((option) =>
      option.setName('query').setDescription('URL หรือคำค้นหาเพลง').setRequired(true)
    ),
  new SlashCommandBuilder().setName('skip').setDescription('ข้ามเพลงปัจจุบัน'),
  new SlashCommandBuilder().setName('stop').setDescription('หยุดเพลงและล้างคิว'),
  new SlashCommandBuilder().setName('queue').setDescription('แสดงรายการคิวเพลง')
].map((command) => command.toJSON());

const rest = new REST({ version: '10' }).setToken(config.discordBotToken);

await rest.put(Routes.applicationGuildCommands(config.discordClientId, config.discordGuildId), {
  body: commands
});

console.log('Slash commands registered successfully');
