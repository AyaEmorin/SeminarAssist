import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Events,
  Interaction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  GuildMember
} from 'discord.js';
import { botClient } from '../../services/bot.service.js';
import { registerStudent } from '../../services/registration.service.js';

const REGISTRATION_COMMAND = 'setup-registration';
const OPEN_MODAL_BUTTON = 'open_student_register_modal';
const REGISTER_MODAL = 'student_register_modal';

export function registerRegistrationInteractions() {
  botClient.on(Events.InteractionCreate, async (interaction: Interaction) => {
    try {
      if (interaction.isChatInputCommand() && interaction.commandName === REGISTRATION_COMMAND) {
        const embed = new EmbedBuilder()
          .setColor(0x2b2d31)
          .setTitle('📘 ลงทะเบียนนักศึกษา')
          .setDescription(
            [
              'กดปุ่มด้านล่างเพื่อกรอกชื่อ - นามสกุล และเลขนักศึกษา',
              'เมื่อกรอกเสร็จ ระบบจะเปลี่ยนชื่อเล่นในเซิร์ฟเวอร์และมอบบทบาทให้อัตโนมัติ'
            ].join('\n\n')
          )
          .setTimestamp();

        const button = new ButtonBuilder()
          .setCustomId(OPEN_MODAL_BUTTON)
          .setLabel('กรอกข้อมูลนักศึกษา')
          .setStyle(ButtonStyle.Primary);

        await interaction.reply({
          embeds: [embed],
          components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button)]
        });
        return;
      }

      if (interaction.isButton() && interaction.customId === OPEN_MODAL_BUTTON) {
        const modal = new ModalBuilder().setCustomId(REGISTER_MODAL).setTitle('ลงทะเบียนนักศึกษา');

        const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId('student_name')
            .setLabel('ชื่อ - นามสกุล')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(60)
        );

        const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId('student_id')
            .setLabel('เลขนักศึกษา')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(20)
        );

        modal.addComponents(row1, row2);
        await interaction.showModal(modal);
        return;
      }

      if (interaction.isModalSubmit() && interaction.customId === REGISTER_MODAL) {
        const studentName = interaction.fields.getTextInputValue('student_name').trim();
        const studentId = interaction.fields.getTextInputValue('student_id').trim();

        const result = await registerStudent(interaction.member as GuildMember, studentName, studentId);

        const successEmbed = new EmbedBuilder()
          .setColor(0x57f287)
          .setTitle('✅ ลงทะเบียนสำเร็จ')
          .setDescription(`ชื่อเล่นใหม่: **${result.nickname}**\nได้รับบทบาท: **${result.roleName}**`)
          .setTimestamp();

        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      if (interaction.isRepliable()) {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: message, ephemeral: true }).catch(() => undefined);
        } else {
          await interaction.reply({ content: message, ephemeral: true }).catch(() => undefined);
        }
      }
    }
  });
}
