import { EmbedBuilder, Events, Interaction, GuildMember } from 'discord.js';
import { botClient } from '../../services/bot.service.js';
import { playYouTube, skipYouTube, stopYouTube, leaveYouTube, getYouTubeQueue, togglePauseYouTube, previousYouTube, changeVolumeYouTube } from '../../services/distube.service.js';

export function registerMusicInteractions() {

  botClient.on(Events.InteractionCreate, async (interaction: Interaction) => {

    if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

    try {

      if (!interaction.guildId) {
        return;
      }

      const member = interaction.member as GuildMember;

      if (interaction.isButton() && interaction.customId.startsWith('music_')) {
        await interaction.deferReply({ ephemeral: true });

        const queue = getYouTubeQueue(interaction.guildId);
        if (!queue || !queue.current) {
          await interaction.editReply('❌ ไม่มีเพลงเล่นอยู่ขณะนี้ หรือบอทได้รีสตาร์ทไปแล้วครับ');
          return;
        }

        // Permissions check
        const isRequester = member.user.tag === queue.current.requestedBy;
        const allowedRoles = ['933202691281289236']; // Add allowed role IDs here in the future
        const hasRole = member.roles.cache.some(r => allowedRoles.includes(r.id));
        const isAdmin = member.permissions.has('Administrator');

        if (!isRequester && !hasRole && !isAdmin) {
          await interaction.editReply('❌ คุณไม่มีสิทธิ์ใช้งานปุ่มนี้ \n*(สิทธิ์เฉพาะ: ผู้ที่ขอเพลงนี้, แอดมิน หรือผู้ที่มีบทบาทที่กำหนด)*');
          return;
        }

        const customId = interaction.customId;
        if (customId === 'music_pause') {
          const paused = togglePauseYouTube(interaction.guildId);
          if (paused === true) {
            await interaction.editReply('⏸️ **หยุดเล่นเพลงชั่วคราว**');
          } else if (paused === false) {
            await interaction.editReply('▶️ **เล่นเพลงต่อแล้ว**');
          } else {
            await interaction.editReply('❌ ไม่สามารถหยุดหรือเล่นต่อได้ (อาจไม่มีเพลงกำลังเล่น)');
          }
        } else if (customId === 'music_prev') {
          const success = previousYouTube(interaction.guildId);
          if (success) {
            await interaction.editReply('⏮️ **กลับไปเพลงก่อนหน้า**');
          } else {
            await interaction.editReply('❌ ไม่มีเพลงก่อนหน้าในประวัติการเล่นหลงเหลืออยู่');
          }
        } else if (customId === 'music_next') {
          const success = skipYouTube(interaction.guildId);
          if (success) {
            await interaction.editReply('⏭️ **ข้ามเพลงเรียบร้อย**');
          } else {
            await interaction.editReply('❌ ไม่สามารถข้ามเพลงได้ (อาจเป็นเพลงสุดท้ายในคิว)');
          }
        } else if (customId === 'music_voldown') {
          const vol = changeVolumeYouTube(interaction.guildId, -0.1);
          await interaction.editReply(`🔉 **ลดเสียงเหลือ ${Math.round(vol * 100)}%**`);
        } else if (customId === 'music_volup') {
          const vol = changeVolumeYouTube(interaction.guildId, +0.1);
          await interaction.editReply(`🔊 **เพิ่มเสียงเป็น ${Math.round(vol * 100)}%**`);
        } else if (customId === 'music_queue') {
          // Elegant Pastel Queue Embed (Button interaction)
          const embed = new EmbedBuilder()
            .setColor('#D8B4E2') // Pastel Purple
            .setAuthor({ name: '✨ รายการคิวเพลงทั้งหมด ✨', iconURL: interaction.client.user.displayAvatarURL() });

          embed.addFields({
            name: '🎶 กำลังเล่น',
            value: `**[${queue.current.title}](${queue.current.pageUrl})**\n👤 ขอโดย: ${queue.current.requestedBy}`
          });
          
          if (queue.current.thumbnail) {
            embed.setThumbnail(queue.current.thumbnail);
          }

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
              value: '*ไม่มีเพลงในคิวเพิ่มเติม*'
            });
          }
          
          embed.setFooter({ text: `🎵 จำนวนเพลงทั้งหมด: ${queue.tracks.length + 1} เพลง` });
          await interaction.editReply({ embeds: [embed] });
          setTimeout(() => interaction.deleteReply().catch(() => {}), 15000); // 15s timeout
          return;
        }

        setTimeout(() => interaction.deleteReply().catch(() => {}), 3000);
        return;
      }

      if (interaction.isChatInputCommand()) {
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
            .setColor('#D4F0F0') // Pastel Cyan/Mint
            .setAuthor({ name: `✨ เพิ่มเข้าคิวแล้ว (อันดับที่ ${result.position}) ✨` })
            .setTitle(result.track.title)
            .setURL(result.track.pageUrl)
            .addFields(
              { name: '⏱️ ความยาว', value: result.track.duration, inline: true },
              { name: '👤 ขอโดย', value: result.track.requestedBy, inline: true }
            );

          if (result.track.thumbnail) {
            embed.setImage(result.track.thumbnail);
          }

          const replyMsg = await interaction.editReply({ embeds: [embed] });
          setTimeout(() => replyMsg.delete().catch(() => {}), 15000);
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

        if (!queue || !queue.current) {
          const emptyEmbed = new EmbedBuilder()
            .setColor('#FFB3BA') // Pastel Pink
            .setAuthor({ name: '✨ รายการคิวเพลงทั้งหมด ✨', iconURL: interaction.client.user.displayAvatarURL() })
            .setDescription('📭 *ตอนนี้ยังไม่มีเพลงในคิวเลยครับ*');
          await interaction.reply({ embeds: [emptyEmbed] });
          return;
        }

        const embed = new EmbedBuilder()
          .setColor('#D8B4E2') // Pastel Purple
          .setAuthor({ name: '✨ รายการคิวเพลงทั้งหมด ✨', iconURL: interaction.client.user.displayAvatarURL() });

        embed.addFields({
          name: '🎶 กำลังเล่น',
          value: `**[${queue.current.title}](${queue.current.pageUrl})**\n👤 ขอโดย: ${queue.current.requestedBy}`
        });
        
        if (queue.current.thumbnail) {
            embed.setThumbnail(queue.current.thumbnail);
        }

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
            value: '*ไม่มีเพลงในคิวเพิ่มเติม*'
          });
        }
        
        embed.setFooter({ text: `🎵 จำนวนเพลงทั้งหมด: ${queue.tracks.length + 1} เพลง` });

        await interaction.reply({ embeds: [embed] });
      }

    } // end isChatInputCommand
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