const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, Client, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js')
const cfg = require('../../config.json')
const tool = require('../../tools')
const repSchema = require('../../Models/repModel')

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        
        if(interaction.isButton()) {
            const char = interaction.customId.split('-');
            if (char[0] !== 'invite') return;
            const state = interaction.member.voice
            if (!state.channel || state.channel.parent.id != cfg.cat.jtc) {
                return interaction.reply({content: `> Ви маєте знаходитись в голсовому каналі`, ephemeral: true})
            }
            const chnlid = state.channel.id
            
            if(!client.chats.get(`${state.channel.id}_owner`)) {
                await client.chats.set(`${state.channel.id}_owner`, interaction.user.id)
            }
            if (client.chats.get(`${state.channel.id}_owner`) !== `${interaction.user.id}`) {
                return interaction.reply({content: `> Ви маєте бути власником каналу`, ephemeral: true})
            } 
            if(client.chats.get(`${state.channel.id}_cd`)){
                return interaction.reply({content: `> Не так швидко, будь ласка`, ephemeral: true})
            }
            client.chats.set(`${chnlid}_cd`, true);
            setTimeout(() => {
                if(client.chats.get(`${chnlid}_cd`)){
                    client.chats.delete(`${chnlid}_cd`);
                }
            }, 5000);

            if(char[1] === 'del') {
                const msg = interaction.channel.messages.cache.get(client.chats.get(`${state.channel.id}_inv`));
                if(msg) {
                    await msg.delete().catch(console.error)
                    await client.chats.delete(`${state.channel.id}_inv`)
                } else {
                    return interaction.reply({content: `> Повідомлення не знайдено`, ephemeral: true})
                }

                if (client.chats.get(`${state.channel.id}_ie`)) {
                    try {
                        await state.channel.messages.cache.get(client.chats.get(`${state.channel.id}_ie`)).delete()
                    } catch (error) {}
                    await client.chats.delete(`${state.channel.id}_ie`)
                }

                if (client.chats.get(`${state.channel.id}_if`)) {
                    try {
                        await state.channel.messages.cache.get(client.chats.get(`${state.channel.id}_if`)).delete()
                    } catch (error) {}
                    await client.chats.delete(`${state.channel.id}_if`)
                }
                
                return interaction.reply({content: `> Повідомлення було видалено`, ephemeral: true})
            }
            if(char[1] === 'voiceedit') {
                const chnl = state.channel;

                const members = []
                let i = 0;

                for(let [userid, info] of chnl.members) {
                    if (userid !== interaction.user.id) {
                        members[i] = {
                            label: `${info.user.username}`,
                            description: ` `,
                            value: `${userid}`
                        }
                        ++i
                    } 
                }

                const e_embed = new EmbedBuilder()
                .setColor(cfg.color.blue)
                .setTitle('Пошук Екіпажу')
                .setDescription('Оберіть пірата, над яким ви хочете провести операцію')
                .setTimestamp()
                const e_btn = new ActionRowBuilder().setComponents(
                    new ButtonBuilder().setCustomId(`voice_edit-kick`).setLabel(`Вигнати пірата`).setEmoji('1082422430565408930').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId(`voice_edit-own`).setLabel(`Передати капітанство`).setEmoji('1082430694678069268').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId(`voice_edit-ban`).setLabel(`Заблокувати пірата`).setEmoji('❌').setStyle(ButtonStyle.Primary),
                )
                
                if(members.length > 0) {
                    const e_select = new ActionRowBuilder().setComponents(
                        new StringSelectMenuBuilder()
                        .setPlaceholder(`Noone selected`)
                        .setCustomId(`invite-select`)
                        .setOptions(members)
                    ) 

                    interaction.reply({embeds: [e_embed], components:  [e_select, e_btn], ephemeral: true})
                } else {
                    interaction.reply({content: `> Нікого не знайдено`, ephemeral: true})
                }
                return
            }

            if(interaction.channel.messages.cache.get(client.chats.get(`${state.channel.id}_inv`))) {
                return interaction.reply({content: `> Спочатку видаліть старе повідомлення, використовуючи кнопку [❌]`, ephemeral: true})
            }

            const modal = new ModalBuilder()
            .setCustomId(`invite-${char[1]}`)
            .setTitle(`Запрошення до гри [${cfg.invite[char[1]]}]`)

            const text = new TextInputBuilder()
            .setCustomId(`invite-text`)
            .setLabel(`Опис запрошення`)
            .setPlaceholder('Що ви хотіли б поробити? \nМоже, ви хочете кавуна?')
            .setRequired(true)
            .setMaxLength(250)
            .setStyle(TextInputStyle.Paragraph);
            const modaltxt = new ActionRowBuilder().setComponents(text)
            modal.addComponents(modaltxt)

            return interaction.showModal(modal)

        } else if (interaction.isModalSubmit()) {
            const char = interaction.customId.split('-');
            if (char[0] !== 'invite') return;
            const state = interaction.member.voice
            await interaction.deferReply({ephemeral: true})

            const embed = new EmbedBuilder()
            .setTitle('Пошук Екіпажу!')
            .setDescription(interaction.fields.getTextInputValue("invite-text"))
            .setColor(cfg.invclr[char[1]])
            .setThumbnail(cfg.invicon[char[1]])
            .setImage(cfg.image.embedbar)
            .setFooter({text: `${interaction.user.username}`, iconURL: `${interaction.user.displayAvatarURL()}`})
            .setFields(
                {name: `Канал:`, value: `${state.channel}`, inline: true},
                {name: `Активність:`, value: `${cfg.invite[char[1]]}`, inline: true},
                {name: `Екіпаж:`, value: `${state.channel.members.size}/${state.channel.userLimit}`, inline: true},
            )
            .setTimestamp()

            try {
                await interaction.channel.send({embeds: [embed]}).then(msg => client.chats.set(`${state.channel.id}_inv`, msg.id));
                const rep = await repSchema.findOne({User: interaction.user.id})
                let repval = '0', descr = 'default', title = 'default';
                if (!rep) {
                    await repSchema.create({
                        User: interaction.user.id,
                        Username: interaction.user.username,
                        Desc: 'default',
                        Title: 'default',
                        Plus: [],
                        Minus: []
                    })
                } else {
                    descr = await rep.Desc
                    repval = rep.Plus.length - rep.Minus.length
                    title = await rep.Title
                } 
                const repimg = await tool.drawRep(interaction.user, repval, descr, title);
                const repembed = new EmbedBuilder()
                .setColor(cfg.invclr[char[1]])
                .setTitle(`Це додаткова інформація про власника запрошення.`)
                .setDescription(`:point_down: ||${interaction.user}|| :point_down:`)
                await state.channel.send({
                    embeds: [repembed], 
                }).then((embed) => {
                    client.chats.set(`${state.channel.id}_ie`, embed.id)
                    state.channel.send({files: [repimg]}).then((file) => client.chats.set(`${state.channel.id}_if`, file.id))
                }) 
            } catch (error) {
                return await interaction.editReply({content: `> Сталась помилка`});
            }
            
            return await interaction.editReply({content: `> Повідомлення має з'явитись в каналі`})
        } else if (interaction.isStringSelectMenu()) {
            const char = interaction.customId.split('-')
            if(char[0] !== 'invite') return;
            const state = interaction.member.voice
            const chnl = state.channel;
            if(chnl && interaction.guild.members.cache.get(interaction.values[0])) {
                client.chats.set(`${chnl.id}_sel`, interaction.values[0])
                return interaction.reply({content: `> Пірат був успішно обраний`, ephemeral: true})
            } else return interaction.reply({content: `> Сталася помилка`, ephemeral: true})
        } else return;
    }
}