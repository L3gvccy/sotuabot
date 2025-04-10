const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js')
const cfg = require('../../config.json')
const tool = require('../../tools')
const prv = require('../../Models/prvoiceModel')

module.exports = {
    name: 'interactionCreate',

    async execute(interaction) {
        const {guild} = interaction
        if (interaction.isButton()) {
            
            const char = interaction.customId.split('-')
            if (char[0] !== 'prvoice') return;

            const logChannel = interaction.guild.channels.cache.get(cfg.channels.prvoice_log)

            if (char[1] === 'create') {
                const db = await prv.findOne({User: interaction.user.id})

                if (db) {
                    await interaction.deferReply({ephemeral: true})
                    return await interaction.editReply({content: '> Ви вже маєте власний голосовий канал'})
                }

                const modal = new ModalBuilder()
                .setCustomId(`prvcreate-${interaction.user.id}`)
                .setTitle(`Створення приватного флоту`)

                const modaltxt = new TextInputBuilder()
                .setCustomId('prvcreate-name')
                .setLabel('Назва флоту')
                .setPlaceholder(`Введіть назву каналу`)
                .setMinLength(3)
                .setMaxLength(20)
                .setRequired(true)
                .setStyle(TextInputStyle.Short)

                modal.addComponents(new ActionRowBuilder().setComponents(modaltxt))

                return interaction.showModal(modal); 
            }

            if(char[1] === 'delete') {
                const db = await prv.findOne({User: interaction.user.id})
                await interaction.deferReply({ephemeral: true})
                if (!db) {
                    
                    return await interaction.editReply({content: '> У вас немає голосового каналу'})
                } 
                const embed = new EmbedBuilder()
                .setColor('#DA2222')
                .setTitle('Увага!')
                .setDescription('Ця дія не зможе бути відміненою у разі підтвердження \nВи впевнені, що хочете видалити свій канал?')
                const btn = new ActionRowBuilder().setComponents(
                    new ButtonBuilder().setCustomId(`prvoice-confdelete-${db.User}`).setLabel('Підтвердити Видалення').setStyle(ButtonStyle.Danger)
                )
                return await interaction.editReply({embeds: [embed], components: [btn]})
            } else
            if(char[1] === 'admindel') {
                const db = await prv.findOne({User: char[2]})
                await interaction.deferReply({ephemeral: true})
                if (!db) {
                    return await interaction.editReply({content: '> Сталася помилка'})
                } 
                const embed = new EmbedBuilder()
                .setColor('#DA2222')
                .setTitle('Увага!')
                .setDescription('Ця дія не зможе бути відміненою у разі підтвердження \nВи впевнені, що хочете видалити цей канал?')
                const btn = new ActionRowBuilder().setComponents(
                    new ButtonBuilder().setCustomId(`prvoice-confdelete-${db.User}`).setLabel('Підтвердити Видалення').setStyle(ButtonStyle.Danger)
                )
                return await interaction.editReply({embeds: [embed], components: [btn]})
            } else
            if(char[1] === 'confdelete') {
                const db = await prv.findOne({User: char[2]})
                await interaction.deferReply({ephemeral: true})
                if (!db) {
                    return await interaction.editReply({content: '> Сталася помилка'})
                } 
                
                let vc, logmsg
                if(await interaction.guild.channels.cache.get(db.Voice)) {
                    vc = await interaction.guild.channels.cache.get(db.Voice)
                }
                if (await logChannel.messages.fetch(db.Logmsg)) {
                    logmsg = await logChannel.messages.fetch(db.Logmsg)
                }
                if(vc) {
                    try {
                        await vc.delete()
                    } catch (error) {null}
                }
                if(logmsg) {
                    try {
                        await logmsg.delete()
                    } catch (error) {}
                }

                const g_role = await guild.roles.cache.get(db.Role)
                g_role.delete('Channel deleted').catch(console.error)

                await prv.deleteMany({User: char[2]})
                return await interaction.editReply({content: `> Канал було успішно видалено`})
            } else
            if(char[1] === 'add') {
                const db = await prv.findOne({User: interaction.user.id})
                await interaction.deferReply({ephemeral: true})
                if (!db) {
                    return await interaction.editReply({content: '> У вас немає голосового каналу'})
                } 
                const vc = guild.channels.cache.get(db.Voice)
                const waiting = guild.channels.cache.get(cfg.channels.prvoice_waiting)

                const users = []
                let i=0;

                for(let [userid, info] of waiting.members) {
                    if (userid !== interaction.user.id) {
                        users[i] = {
                            label: `${info.user.username}`,
                            description: ` `,
                            value: `${userid}`
                        }
                        ++i
                    }
                }
                if(users.length <= 0) return interaction.editReply({content: `> Канал очікування порожній`})
                const prvoiceSel = new ActionRowBuilder().setComponents(
                    new StringSelectMenuBuilder()
                    .setCustomId(`prvoice-add`)
                    .setPlaceholder(`Noone Selected...`)
                    .addOptions(users)
                )
                return await interaction.editReply({components: [prvoiceSel]})
            } else if (char[1] === 'remove') {
                const db = await prv.findOne({User: interaction.user.id})
                await interaction.deferReply({ephemeral: true})
                if (!db) {
                    return await interaction.editReply({content: '> У вас немає голосового каналу'})
                } 
                let members = db.Members
                let options = []

                for (let i = 0; i < members.length; i++) {
                    let m = await interaction.guild.members.fetch(members[i])
                    options[i] = {
                        label: `${m.user.username}`,
                        description: ` `,
                        value: `${m.user.id}`
                    }
                }
                if (options.length <= 0) return interaction.editReply({content: `> У вас немає жодного учасника`})
                const prvoiceSel = new ActionRowBuilder().setComponents(
                    new StringSelectMenuBuilder()
                    .setCustomId(`prvoice-remove`)
                    .setPlaceholder(`Noone Selected...`)
                    .addOptions(options)
                )
                return await interaction.editReply({components: [prvoiceSel]})
            } return;
        } else 
        if (interaction.isStringSelectMenu()) {
            const char = interaction.customId.split('-')
            if (char[0] !== 'prvoice') return;

            await interaction.deferReply({ephemeral: true})
            const logChannel = interaction.guild.channels.cache.get(cfg.channels.prvoice_log)

            if(char[1] === 'add') {
                const db = await prv.findOne({User: interaction.user.id})
                if (!db) {
                    return await interaction.editReply({content: '> У вас немає голосового каналу'})
                } 

                const vc = guild.channels.cache.get(db.Voice)
                const userid = interaction.values[0]
                const m = interaction.guild.members.cache.get(userid)
                let members = db.Members
                if(members.includes(userid)) return await interaction.editReply({content: '> Цей користувач вже знаходиться в вашому каналі'})
                members[members.length] = userid
                let n_members = []
                for (let i = 0; i < members.length; i++) {
                    n_members[i] = `<@${members[i]}>`
                }

                const logmsg = await logChannel.messages.fetch(db.Logmsg)
                const embed = logmsg.embeds[0]
                const btn = logmsg.components[0]

                m.roles.add(db.Role)
                
                embed.fields[0] = {name: `Учасники:`, value: `${n_members}`}
                await logmsg.edit({embeds: [embed], components: [btn]})
                if(m.voice && m.voice.channel && m.voice.channel.id === cfg.channels.prvoice_waiting) {
                    await m.voice.setChannel(vc)
                }
                await prv.deleteMany({User: interaction.user.id})
                await prv.create({
                    User: db.User,
                    Username: db.Username,
                    Voice: db.Voice,
                    Logmsg: logmsg.id,
                    Role: db.Role,
                    Members: members
                })
                return await interaction.editReply({content: `> Ви додали <@${userid}> до свого каналу`})
            }
            if (char[1] === 'remove') {
                const db = await prv.findOne({User: interaction.user.id})
                if (!db) {
                    return await interaction.editReply({content: '> У вас немає голосового каналу'})
                } 
                let members = db.Members;
                const vc = interaction.guild.channels.cache.get(db.Voice)
                const uid = interaction.values[0]
                const m = interaction.guild.members.cache.get(uid)
                members = members.filter(v => v !== uid)

                if (m.voice && m.voice.channel && m.voice.channel.id === db.Voice) {
                    await m.voice.disconnect()
                }

                m.roles.remove(db.Role)
                
                let n_members = []
                for (let i = 0; i < members.length; i++) {
                    n_members[i] = `<@${members[i]}>`
                }

                const logmsg = await logChannel.messages.fetch(db.Logmsg)
                const embed = logmsg.embeds[0]
                const btn = logmsg.components[0]
                embed.fields[0] = {name: `Учасники:`, value: `${n_members}`}
                await logmsg.edit({embeds: [embed], components: [btn]})
                await prv.deleteMany({User: interaction.user.id})
                await prv.create({
                    User: db.User,
                    Username: db.Username,
                    Voice: db.Voice,
                    Logmsg: logmsg.id,
                    Role: db.Role,
                    Members: members
                })
                return await interaction.editReply({content: `> Ви вилучили <@${uid}> зі свого каналу`})
            }
        } else if (interaction && interaction.isModalSubmit()) {
            const char = interaction.customId.split('-');
            const logChannel = interaction.guild.channels.cache.get(cfg.channels.prvoice_log)
            if(char[0] === 'prvcreate') {
                const _name = interaction.fields.getTextInputValue('prvcreate-name')
                const logembed = new EmbedBuilder()
                .setColor('#43E0ED')
                .setTitle('Документація приватного флоту')
                .setTimestamp()
                const btn = new ActionRowBuilder().setComponents(
                    new ButtonBuilder().setCustomId(`prvoice-admindel-${interaction.user.id}`).setLabel('Видалити Канал').setStyle(ButtonStyle.Danger)
                )

                const g_role = await guild.roles.create({
                    name: `Гільдія:${_name}`,
                    color: '#FFFFFF'
                })
                interaction.member.roles.add(g_role.id)

                const n_chnl = await interaction.guild.channels.create({
                    name: _name,
                    parent: cfg.cat.prvoice,
                    type: ChannelType.GuildVoice,
                    permissionOverwrites: [
                        {
                            id: interaction.user.id,
                            allow: ['ViewChannel', 'Connect', 'ManageChannels']
                        },
                        {
                            id: cfg.guildid,
                            deny: ['ViewChannel', 'Connect']
                        },
                        {
                            id: cfg.roles.admin,
                            allow: ['ViewChannel', 'Connect', 'ManageChannels']
                        },
                        {
                            id: g_role.id,
                            allow: ['ViewChannel', 'Connect']
                        }
                    ]
                })
                await logembed.setDescription(`Власник: ${interaction.user}\nКанал: ${n_chnl}`)
                .setFields(
                    {name: `Учасники:`, value: ` `},
                    {name: `Остання активність:`, value: ` `},
                )
                const logmsg = await logChannel.send({embeds: [logembed], components: [btn]})

                await prv.create({
                    User: interaction.user.id,
                    Username: interaction.user.username,
                    Voice: n_chnl.id,
                    Logmsg: logmsg.id,
                    Role: g_role.id,
                    Members: []
                })
                return await interaction.reply({content: '> Канал успішно створено', ephemeral: true})
            } else return;
        }  else return;
    }
}