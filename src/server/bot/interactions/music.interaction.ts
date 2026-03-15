import { EmbedBuilder, Events, Interaction, GuildMember } from 'discord.js';
import { botClient } from '../../services/bot.service.js';
import { playYouTube, skipYouTube, stopYouTube, leaveYouTube, getYouTubeQueue } from '../../services/distube.service.js';

export function registerMusicInteractions() {

  botClient.on(Events.InteractionCreate, async (interaction: Interaction) => {

    if (!interaction.isChatInputCommand()) return;

    try {

      if (!interaction.guildId) {
        return;
      }

      const member = interaction.member as GuildMember;

      if (interaction.commandName === 'join') {
        await interaction.reply('ใช้คำสั่ง /play เพื่อให้บอทเข้ามาเล่นเพลงในห้องเสียงได้เลยครับ!');
        return;
      }

      if (interaction.commandName === 'leave') {
        leaveYouTube(interaction.guildId);
        const embed = new EmbedBuilder()
          .setColor('#ff4757')
          .setDescription('🛑 **ออกจากห้องเสียงและล้างคิวเรียบร้อยแล้ว 👋**');
        await interaction.reply({ embeds: [embed] });
        return;
      }

      // /play — yt-dlp powered
      if (interaction.commandName === 'play') {

        const query = interaction.options.getString('query', true);

        await interaction.deferReply();

        const result = await playYouTube(member, query, interaction.channel! as any);

        if (result.isPlayingNow) {
          // If playing immediately, distube.service.ts will send the "Now Playing" embed.
          // We just delete our deferred reply to avoid duplicate messages.
          await interaction.deleteReply();
        } else {
          // If added to queue, we send the "Added to Queue" embed.
          const embed = new EmbedBuilder()
            .setColor('#2ed573')
            .setAuthor({ name: `📋 เพิ่มเข้าคิวแล้ว (อันดับที่ ${result.position})` })
            .setTitle(result.track.title)
            .setURL(result.track.pageUrl)
            .addFields(
              { name: '⏱️ ความยาว', value: result.track.duration, inline: true },
              { name: '👤 ขอโดย', value: result.track.requestedBy, inline: true }
            );

          if (result.track.thumbnail) embed.setThumbnail(result.track.thumbnail);

          await interaction.editReply({ embeds: [embed] });
        }

        return;

      }

      if (interaction.commandName === 'skip') {
        const skipped = skipYouTube(interaction.guildId);
        if (!skipped) {
          await interaction.reply({ content: '❌ ไม่มีเพลงที่กำลังเล่นอยู่ครับ', ephemeral: true });
        } else {
          const embed = new EmbedBuilder()
            .setColor('#ffa502')
            .setDescription('⏭️ **ข้ามเพลงเรียบร้อยแล้ว!**');
          await interaction.reply({ embeds: [embed] });
        }
        return;
      }

      if (interaction.commandName === 'stop') {
        stopYouTube(interaction.guildId);
        const embed = new EmbedBuilder()
          .setColor('#ff4757')
          .setDescription('🛑 **หยุดเพลงและล้างคิวเรียบร้อยแล้ว**');
        await interaction.reply({ embeds: [embed] });
        return;
      }

      if (interaction.commandName === 'queue') {

        const queue = getYouTubeQueue(interaction.guildId);

        const embed = new EmbedBuilder()
          .setColor('#1e90ff')
          .setAuthor({ name: '📋 รายการคิวเพลงทั้งหมด' });

        if (!queue || !queue.current) {

          embed.setDescription('📭 ตอนนี้ยังไม่มีเพลงในคิวเลยครับ');

        } else {

          embed.addFields({
            name: '🎶 กำลังเล่น',
            value: `**[${queue.current.title}](${queue.current.pageUrl})**\n👤 ขอโดย: ${queue.current.requestedBy}`
          });

          if (queue.tracks.length > 0) {

            const lines = queue.tracks
              .slice(0, 10)
              .map((track, index) => `**${index + 1}.** [${track.title}](${track.pageUrl}) | ⏱️ ${track.duration}`);

            let queueText = lines.join('\n');

            if (queue.tracks.length > 10) {
              queueText += `\n\n*...และอีก ${queue.tracks.length - 10} เพลงในคิว*`;
            }

            embed.addFields({
              name: `🎧 คิวถัดไป (${queue.tracks.length})`,
              value: queueText
            });

          } else {
            embed.addFields({
              name: '🎧 คิวถัดไป',
              value: 'ไม่มีเพลงในคิวเพิ่มเติม'
            });
          }
          
          embed.setFooter({ text: `จำนวนเพลงทั้งหมด: ${queue.tracks.length + 1} เพลง` });

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