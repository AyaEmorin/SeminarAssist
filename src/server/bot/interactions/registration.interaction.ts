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
    GuildMember,
    PermissionFlagsBits
} from 'discord.js';
import { botClient } from '../../services/bot.service.js';
import { config } from '../../config.js';

export function registerRegistrationInteractions() {
    botClient.on(Events.InteractionCreate, async (interaction: Interaction) => {
        try {
            // 1) Slash command: /setup-registration
            if (interaction.isChatInputCommand()) {
                if (interaction.commandName === 'setup-registration') {
                    const embed = new EmbedBuilder()
                        .setColor(0xFDFD96) // เทาเข้ม ใกล้เคียงในภาพ
                        .setTitle('📘 ลงทะเบียนเข้าร่วมสัมมนา')
                        .setDescription(
                            [
                                'กรุณาอ่านก่อนดำเนินการ',
                                '',
                                'สมาชิกทุกคนต้องกรอก **ชื่อ - นามสกุล** และ **เลขนักศึกษา** ให้ถูกต้อง',
                                'หลังจากส่งข้อมูลแล้ว ระบบจะทำการ:',
                                '1. เปลี่ยนชื่อเล่นของคุณในเซิร์ฟเวอร์',
                                '2. มอบบทบาทผู้เข้าร่วมสัมมนาให้อัตโนมัติ',
                                '',
                                'กดปุ่มด้านล่างเพื่อกรอกข้อมูลได้ทันที'
                            ].join('\n')
                        )
                        .addFields(
                            {
                                name: '📝 ข้อมูลที่ต้องกรอก',
                                value: '• ชื่อ - นามสกุล **(ไม่ต้องใส่คำนำหน้าชื่อ)**\n• เลขนักศึกษา (ถ้ามี)',
                                inline: false
                            },
                            {
                                name: '⚠️ หมายเหตุ',
                                value: 'กรุณากรอกข้อมูลให้ถูกต้อง เพราะระบบจะนำไปตั้งชื่อเล่นของคุณโดยอัตโนมัติ',
                                inline: false
                            }
                        )
                        .setThumbnail('https://i.ibb.co/mZXvCnF/image.png')
                        .setImage('https://i.ibb.co/7txsYgBp/Auto-Net-1.png')
                        .setFooter({ text: 'Seminar Registration System' })
                        .setTimestamp();

                    const button = new ButtonBuilder()
                        .setCustomId('open_student_register_modal')
                        .setLabel('กรอกข้อมูลนักศึกษาของท่าน')
                        .setStyle(ButtonStyle.Primary);

                    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

                    await interaction.reply({
                        embeds: [embed],
                        components: [row]
                    });
                }
                return;
            }

            // 2) Button click -> open modal
            if (interaction.isButton()) {
                if (interaction.customId === 'open_student_register_modal') {
                    const modal = new ModalBuilder()
                        .setCustomId('student_register_modal')
                        .setTitle('ลงทะเบียนนักศึกษา');

                    const nameInput = new TextInputBuilder()
                        .setCustomId('student_name')
                        .setLabel('ชื่อ - นามสกุล')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                        .setPlaceholder('เช่น เนริสสา ใจดี')
                        .setMaxLength(60);

                    const studentIdInput = new TextInputBuilder()
                        .setCustomId('student_id')
                        .setLabel('เลขนักศึกษา (ถ้าไม่ใช้นักศึกษาปล่อยว่างไว้ได้)')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                        .setPlaceholder('เช่น 6612345678')
                        .setMaxLength(20);

                    const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput);
                    const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(studentIdInput);

                    modal.addComponents(row1, row2);

                    await interaction.showModal(modal);
                }
                return;
            }

            // 3) Modal submit -> validate + change nickname + add role
            if (interaction.isModalSubmit()) {
                if (interaction.customId === 'student_register_modal') {
                    const studentName = interaction.fields.getTextInputValue('student_name').trim();
                    const studentId = interaction.fields.getTextInputValue('student_id').trim();

                    if (studentId && !/^\d+$/.test(studentId)) {
                        await interaction.reply({
                            content: 'เลขนักศึกษาต้องเป็นตัวเลขเท่านั้น (ถ้าไม่ใช้นักศึกษาปล่อยว่างไว้ได้)',
                            ephemeral: true
                        });
                        return;
                    }

                    const newNicknameRaw = studentId ? `${studentName} | ${studentId}` : studentName;
                    const newNickname = newNicknameRaw.slice(0, 32);

                    const member = interaction.member as GuildMember;
                    const guild = interaction.guild;

                    if (!member || !guild) {
                        await interaction.reply({
                            content: 'ไม่สามารถเข้าถึงข้อมูลสมาชิกในเซิร์ฟเวอร์ได้',
                            ephemeral: true
                        });
                        return;
                    }

                    const botMember = guild.members.me;

                    if (!botMember) {
                        await interaction.reply({
                            content: 'ไม่พบข้อมูลบอทในเซิร์ฟเวอร์',
                            ephemeral: true
                        });
                        return;
                    }

                    if (!botMember.permissions.has(PermissionFlagsBits.ManageNicknames)) {
                        await interaction.reply({
                            content: 'บอทยังไม่มีสิทธิ์ Manage Nicknames',
                            ephemeral: true
                        });
                        return;
                    }

                    if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
                        await interaction.reply({
                            content: 'บอทยังไม่มีสิทธิ์ Manage Roles',
                            ephemeral: true
                        });
                        return;
                    }

                    if (member.roles.highest.position >= botMember.roles.highest.position) {
                        await interaction.reply({
                            content: 'บอทไม่สามารถเปลี่ยนชื่อคุณได้ เพราะ role ของบอทอยู่ไม่สูงพอ',
                            ephemeral: true
                        });
                        return;
                    }

                    const autoRole = guild.roles.cache.get(config.autoRoleId);

                    if (!autoRole) {
                        await interaction.reply({
                            content: `ไม่พบ role ที่ต้องการแจก (ID: ${config.autoRoleId})`,
                            ephemeral: true
                        });
                        return;
                    }

                    if (autoRole.position >= botMember.roles.highest.position) {
                        await interaction.reply({
                            content: 'บอทไม่สามารถแจก role นี้ได้ เพราะ role นี้อยู่สูงกว่าหรือเท่ากับ role ของบอท',
                            ephemeral: true
                        });
                        return;
                    }

                    try {
                        await member.setNickname(newNickname, 'Student registration form submitted');

                        let roleMessage = '';
                        // Convert member.roles to a cache check. Since interaction.member is GuildMember, member.roles.cache exists
                        if (!member.roles.cache.has(config.autoRoleId)) {
                            await member.roles.add(autoRole, 'Auto role after student registration');
                            roleMessage = `ได้รับบทบาท: ${autoRole.name}`;
                        } else {
                            roleMessage = `คุณมีบทบาท ${autoRole.name} อยู่แล้ว`;
                        }

                        const successEmbed = new EmbedBuilder()
                            .setColor(0x57f287)
                            .setTitle('✅ ลงทะเบียนสำเร็จ')
                            .setDescription(
                                [
                                    `**ชื่อเล่นใหม่:** ${newNickname}`,
                                    `**สถานะบทบาท:** ${roleMessage}`
                                ].join('\n')
                            )
                            .setFooter({ text: 'Student Registration System' })
                            .setTimestamp();

                        await interaction.reply({
                            embeds: [successEmbed],
                            ephemeral: true
                        });
                    } catch (error) {
                        console.error('Failed to set nickname or add role:', error);

                        await interaction.reply({
                            content: 'ดำเนินการไม่สำเร็จ กรุณาตรวจสอบสิทธิ์ของบอทและลำดับ role hierarchy',
                            ephemeral: true
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Interaction error:', error);

            if (interaction.isRepliable()) {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: 'เกิดข้อผิดพลาดระหว่างทำงาน',
                        ephemeral: true
                    }).catch(() => { });
                } else {
                    await interaction.reply({
                        content: 'เกิดข้อผิดพลาดระหว่างทำงาน',
                        ephemeral: true
                    }).catch(() => { });
                }
            }
        }
    });
}
