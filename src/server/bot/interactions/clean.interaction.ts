import { EmbedBuilder, Events, Interaction, GuildTextBasedChannel, PermissionFlagsBits } from 'discord.js';
import { botClient } from '../../services/bot.service.js';

export function registerCleanInteraction() {

  botClient.on(Events.InteractionCreate, async (interaction: Interaction) => {

    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'clean') {
      try {
        const password = interaction.options.getString('password', true);

        if (password !== 'moepii') {
          await interaction.reply({ 
            content: '❌ รหัสผ่านไม่ถูกต้อง ไม่สามารถล้างประวัติแชทได้', 
            ephemeral: true 
          });
          return;
        }

        const channel = interaction.channel as GuildTextBasedChannel;
        if (!channel) {
          await interaction.reply({ content: 'ไม่สามารถใช้งานคำสั่งนี้ในช่องแชทนี้ได้', ephemeral: true });
          return;
        }

        // Must have manage messages permission
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
          await interaction.reply({ content: '❌ คุณไม่มีสิทธิ์ลบข้อความ', ephemeral: true });
          return;
        }

        await interaction.deferReply({ ephemeral: true });

        // Delete messages in batches of 100
        let deletedCount = 0;
        let isFinished = false;

        while (!isFinished) {
          const fetchedMessages = await channel.messages.fetch({ limit: 100 });
          if (fetchedMessages.size === 0) {
            isFinished = true;
            break;
          }

          // Delete messages older than 14 days automatically filtered by bulkDelete(..., true)
          const deleted = await channel.bulkDelete(fetchedMessages, true);
          deletedCount += deleted.size;

          // If bulkDelete couldn't delete some messages (because they are >14 days old)
          if (deleted.size < fetchedMessages.size) {
            // Delete the rest one by one
            const remaining = fetchedMessages.filter(msg => !deleted.has(msg.id));
            for (const msg of remaining.values()) {
              try {
                await msg.delete();
                deletedCount++;
              } catch (e) {
                console.error('Failed to delete old message:', e);
              }
            }
          }

          // If we fetch less than 100, we're likely done
          if (fetchedMessages.size < 100) {
            isFinished = true;
          }
        }

        const embed = new EmbedBuilder()
          .setColor('#2ed573')
          .setDescription(`🧹 **ล้างประวัติแชทเรียบร้อยแล้ว!**\nลบข้อความไปทั้งหมด ${deletedCount} ข้อความ`);
          
        await interaction.editReply({ embeds: [embed] });

        // Optional: Send a visible message to the channel then delete it after 5s
        const msg = await channel.send({ embeds: [embed] });
        setTimeout(() => msg.delete().catch(() => {}), 5000);

      } catch (error) {
        console.error('Clean interaction error:', error);
        if (interaction.deferred) {
          await interaction.editReply('❌ เกิดข้อผิดพลาดในการล้างแชท โปรดตรวจสอบสิทธิ์ของบอท (Manage Messages)');
        } else {
          await interaction.reply({ content: '❌ เกิดข้อผิดพลาดในการล้างแชท', ephemeral: true });
        }
      }
    }

    if (interaction.commandName === 'cleanself') {
      try {
        const password = interaction.options.getString('password', true);

        if (password !== 'moepii') {
          await interaction.reply({ 
            content: '❌ รหัสผ่านไม่ถูกต้อง ไม่สามารถล้างประวัติแชทของบอทได้', 
            ephemeral: true 
          });
          return;
        }

        const channel = interaction.channel as GuildTextBasedChannel;
        if (!channel) {
          await interaction.reply({ content: 'ไม่สามารถใช้งานคำสั่งนี้ในช่องแชทนี้ได้', ephemeral: true });
          return;
        }

        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
          await interaction.reply({ content: '❌ คุณไม่มีสิทธิ์ลบข้อความ', ephemeral: true });
          return;
        }

        await interaction.deferReply({ ephemeral: true });

        let deletedCount = 0;
        let isFinished = false;

        while (!isFinished) {
          const fetchedMessages = await channel.messages.fetch({ limit: 100 });
          if (fetchedMessages.size === 0) {
            isFinished = true;
            break;
          }

          // Filter only messages authored by the bot itself
          const botMessages = fetchedMessages.filter(msg => msg.author.id === botClient.user?.id);

          if (botMessages.size > 0) {
            const deleted = await channel.bulkDelete(botMessages, true);
            deletedCount += deleted.size;

            if (deleted.size < botMessages.size) {
              const remaining = botMessages.filter(msg => !deleted.has(msg.id));
              for (const msg of remaining.values()) {
                try {
                  await msg.delete();
                  deletedCount++;
                } catch (e) {
                  console.error('Failed to delete old bot message:', e);
                }
              }
            }
          }

          if (fetchedMessages.size < 100) {
            isFinished = true;
          }
        }

        const embed = new EmbedBuilder()
          .setColor('#1e90ff')
          .setDescription(`🤖 **ล้างข้อความของบอทเรียบร้อยแล้ว!**\nลบไปทั้งหมด ${deletedCount} ข้อความ`);
          
        await interaction.editReply({ embeds: [embed] });

        const msg = await channel.send({ embeds: [embed] });
        setTimeout(() => msg.delete().catch(() => {}), 5000);

      } catch (error) {
        console.error('Cleanself interaction error:', error);
        if (interaction.deferred) {
          await interaction.editReply('❌ เกิดข้อผิดพลาดในการล้างแชท โปรดตรวจสอบสิทธิ์ของบอท (Manage Messages)');
        } else {
          await interaction.reply({ content: '❌ เกิดข้อผิดพลาดในการล้างแชท', ephemeral: true });
        }
      }
    }

  });
}
