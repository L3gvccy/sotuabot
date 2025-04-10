const { ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType, EmbedBuilder} = require('discord.js')
const cfg = require('../../config.json')
const tool = require('../../tools')

module.exports = {
    name: 'interactionCreate',

    async execute(interaction, client) {
        if(interaction.isStringSelectMenu()) {
            if(interaction.customId !== 'create_ticket') return

            let _name;
            await interaction.deferReply({
                ephemeral: true
            })
            const embed = new EmbedBuilder()
                .setTitle('Ticket!')
                .setColor(cfg.color.orange)
                .setTimestamp()
                .setDescription('**Ви відкрили Тікет!**\n Будь ласка, опишіть все, що вам необхідно нижче, та зачекайте, поки вам відповість Адміністрація!')  
            const buttons = new ActionRowBuilder(); 
                buttons.addComponents(
                    new ButtonBuilder().setLabel('Видалити').setCustomId(`inticked-delete`).setEmoji('🗑️').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setLabel('Закрити').setCustomId(`inticked-close`).setEmoji('📑').setStyle(ButtonStyle.Secondary),
                )
            const perms = [
                {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                },
                {
                    id: interaction.guild.roles.cache.get(cfg.roles.admin),
                    allow: [PermissionFlagsBits.ViewChannel, [PermissionFlagsBits.SendMessages]]
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                }
            ];
            switch (interaction.values[0])
            {
                case "ticket_propos":
                    _name = `💡ticket-№${interaction.user.id}`;
                break;
                case "ticket_pen":
                    _name = `🙋ticket-№${interaction.user.id}`;
                break;
                case "ticket_role":
                    _name = `🎭ticket-№${interaction.user.id}`;             
                break;
                case "ticket_prvoice":
                    _name = `🔊ticket-№${interaction.user.id}`;
                break;
                case "ticket_raid":
                    _name = `🏴ticket-№${interaction.user.id}`;
                    perms[3] = {
                        id: interaction.guild.roles.cache.get(cfg.roles.raid_leader),
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                    }
                    buttons.addComponents(
                        new ButtonBuilder().setLabel('Підтвердити').setCustomId(`inticked-conf-${interaction.user.id}`).setEmoji('1054099604393705512').setStyle(ButtonStyle.Primary),
                    )
                break;
            }
            const _chnl = client.channels.cache.find(chnl => chnl.name === _name);
            if(_chnl)
            {
                if(_chnl.permissionsFor(interaction.user.id).has(PermissionFlagsBits.ViewChannel) && _chnl.permissionsFor(interaction.user.id).has(PermissionFlagsBits.SendMessages))
                {
                    interaction.editReply({
                        content: `Ви вже маєте відкритий тікет ${_chnl}!`,
                    });
                    return;
                }
                embed.setDescription('**Ви відкрили ваш минулий Тікет!**\n Будь ласка, просто продовжуйте цей тікет, навіть якщо у вас зовсім інша тема.')  
                interaction.editReply({
                    content: `Тікет ${_chnl} успішно відкрито! \nПеревірте ваші канали!`,
                });
                await _chnl.permissionOverwrites.set(perms);
                _chnl.send({
                    content: `${interaction.user}`,
                    embeds: [embed],
                    components: [buttons] 
                })
                return;
            }
            
            interaction.guild.channels.create({
                name: _name,
                type: ChannelType.GuildText,
                parent: cfg.cat.ticket,
                permissionOverwrites: perms
            }).then(async channel => {
                if (interaction.values[0] === 'ticket_role') {
                    embed.setDescription(`**Для отримання ігрової ролі ви маєте:**\n- Прив'язати XBox акаунт до діскорду\n- Написати назву ролі, яку хочете отримати.\n- Надіслати скріншоти, де видно нікнейм і виконані умови задля отримання відповідної ролі\n\n_Повний перелік ролей ви можете побачити в_ <#986950920862597171>`)
                }

                channel.send({
                    content: `${interaction.user}`,
                    embeds: [embed],
                    components: [buttons] 
                })
                
                

                await interaction.editReply({
                    content: `Тікет ${channel} успішно створено! \nПеревірте ваші канали!`
                });
                return;
            })
            
        } else if(interaction.isButton()) {
            const char = interaction.customId.split('-')
            if (char[0] && char[0] !== 'inticked') return;
            await interaction.deferReply({ephemeral: true})
            switch (char[1]) {
                case 'delete':
                    if(!tool.isadmin(interaction.member)) return interaction.editReply({content: `> Лише адміністратор може видалити тікет`})
                    await interaction.channel.delete()
                    break;
                case 'close':
                    const embed = new EmbedBuilder()
                .setTitle("Ticket!")
                .setDescription(`_Тікет був закритий by **${interaction.user.username}**!_`)
                .setColor(`#ffae00`)
                .setTimestamp();
                interaction.channel.permissionOverwrites.set([
                {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                },
                {
                    id: interaction.guild.roles.cache.get(cfg.roles.admin),
                    allow: [PermissionFlagsBits.ViewChannel],
                    deny: [PermissionFlagsBits.SendMessages]
                }])
                interaction.channel.send({
                    embeds: [embed]
                })
                await interaction.editReply({content: `> Тікет було закрито`});
                break;
                case 'conf':
                    
                    if (!tool.isadmin(interaction.member) && !tool.israidleader(interaction.member)) {
                        return interaction.editReply({content: cfg.phrases.missingperms})
                    }

                    const raidlog = client.channels.cache.get(cfg.channels.raid_log);
                    const raider = interaction.guild.roles.cache.get(cfg.roles.raider);

                    
                    const target = await interaction.guild.members.fetch(char[2])
                    const t_user = target.user
                    if (target.roles.cache.has(cfg.roles.raid_block)) {
                        return interaction.editReply({content: `> Неможливо видати роль у зв'язку з забороною цього користувача`})
                    }
                    if (target.roles.cache.has(cfg.roles.raider)) {
                        return interaction.editReply({content: `> Цей користувач вже має каперство`})
                    }

                    const embedraid = new EmbedBuilder()
                    .setColor(cfg.color.blue)
                    .setTitle('Документація рейдерів 🏴‍☠️')
                    .setDescription(`${t_user} _(${t_user.username})_ отримав роль рейдера!
                    **By:** ${interaction.user}`)
                    .setImage(cfg.image.embedbar)
                    .setTimestamp()
                    
                    await target.roles.add(raider)

                    const finalembed = new EmbedBuilder()
                    .setColor('#990099')
                    .setTitle('Вітаємо з отриманням каперства!')
                    .setDescription(`Не забудь ознайомитись з правилами <#986961953614364712>!`)
                    .setFooter({iconURL: `${interaction.user.displayAvatarURL()}`, text: `${interaction.user.username}`})
                    .setTimestamp()
                    await interaction.channel.send({embeds: [finalembed]})
                    await raidlog.send({embeds: [embedraid]})
                    await interaction.editReply({content: `> Дія виконана успішно!`})
                break;
            
            }
        } else return
    }
}