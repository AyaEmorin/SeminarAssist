import { EmbedBuilder, Events, Interaction, GuildMember } from 'discord.js';
import { botClient } from '../../services/bot.service.js';
import { getQueue, handlePlay, handleSkip, handleStop, handleJoin, handleLeave } from '../../services/music.service.js';
import { playYouTube } from '../../services/distube.service.js';

export function registerMusicInteractions() {

  botClient.on(Events.InteractionCreate, async (interaction: Interaction) => {

    if (!interaction.isChatInputCommand()) return;

    try {

      if (!interaction.guildId) {
        return;
      }

      const member = interaction.member as GuildMember;

      if (interaction.commandName === 'join') {

        await interaction.deferReply();

        await handleJoin(member);

        await interaction.editReply('เข้ามาในห้องเสียงแล้วพร้อมลุย!');

        return;

      }

      if (interaction.commandName === 'leave') {

        await handleLeave(interaction.guildId);

        await interaction.reply('ออกจากห้องเสียงและล้างคิวเรียบร้อยแล้ว 👋');

        return;

      }

      if (interaction.commandName === 'play') {

        const query = interaction.options.getString('query', true);

        await interaction.deferReply();

        const result = await handlePlay(member, query, interaction.user.tag);

        const statusTitle = result.isPlayingNow ? '🎶 กำลังเล่น' : `🎵 เพิ่มเข้าคิวแล้ว (อันดับที่ ${result.position})`;
        const embed = new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle(statusTitle)
          .addFields(
            { name: 'เพลง', value: `[${result.queued.title}](${result.queued.uri})`, inline: false },
            { name: 'ขอโดย', value: result.queued.requestedBy, inline: true }
          );

        await interaction.editReply({ embeds: [embed] });

        return;

      }

      if (interaction.commandName === 'playtube') {

        const query = interaction.options.getString('query', true);

        await interaction.deferReply();

        const result = await playYouTube(member, query, interaction.channel! as any);

        const statusTitle = result.isPlayingNow
          ? '🎶 กำลังเล่น (YouTube)'
          : `🎵 เพิ่มเข้าคิวแล้ว (อันดับที่ ${result.position})`;

        const embed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle(statusTitle)
          .setDescription(`[${result.track.title}](${result.track.url})`)
          .addFields(
            { name: 'ความยาว', value: result.track.duration, inline: true },
            { name: 'ขอโดย', value: result.track.requestedBy, inline: true }
          );

        if (result.track.thumbnail) embed.setThumbnail(result.track.thumbnail);

        await interaction.editReply({ embeds: [embed] });

        return;

      }

      if (interaction.commandName === 'skip') {

        await handleSkip(interaction.guildId);

        await interaction.reply('ข้ามเพลงแล้ว');

        return;

      }

      if (interaction.commandName === 'stop') {

        await handleStop(interaction.guildId);

        await interaction.reply('หยุดเพลงและล้างคิวแล้ว');

        return;

      }

      if (interaction.commandName === 'queue') {

        const queue = getQueue(interaction.guildId);

        const embed = new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle('🎵 คิวเพลง');

        if (!queue || !queue.current) {

          embed.setDescription('ตอนนี้ยังไม่มีเพลงที่กำลังเล่นอยู่');

        } else {

          embed.addFields({
            name: 'กำลังเล่น',
            value: `${queue.current.title} — ${queue.current.requestedBy}`
          });

          let queueText = 'ไม่มี';

          if (queue.tracks.length > 0) {

            const lines = queue.tracks
              .slice(0, 15)
              .map((track, index) => `${index + 1}. ${track.title}`);

            queueText = lines.join('\n');

            if (queueText.length > 1024) {
              queueText = queueText.slice(0, 1020) + '...';
            }

          }

          embed.addFields({
            name: 'เพลงถัดไป',
            value: queueText
          });

        }

        await interaction.reply({ embeds: [embed] });

      }

    } catch (error) {

      console.error('Music interaction error:', error);

      const message = error instanceof Error ? error.message : 'Music command failed';

      if (interaction.deferred) {
        await interaction.editReply(message).catch(() => undefined);
      } else {
        await interaction.reply({ content: message, ephemeral: true }).catch(() => undefined);
      }

    }

  });

}