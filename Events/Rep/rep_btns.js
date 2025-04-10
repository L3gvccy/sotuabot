const { ModalBuilder, TextInputStyle, TextInputBuilder, ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder } = require('discord.js')
const tool = require('../../tools')
const cfg = require('../../config.json')
const repSchema = require('../../Models/repModel')
const dayrep = require('../../Models/dayrep');

module.exports = {
    name: 'interactionCreate',

    async execute(interaction) {
        const repchnl = interaction.guild.channels.cache.get(cfg.channels.rep)
        if(interaction.isButton()) {
            const char = interaction.customId.split('-')
            if (char[0] && char[0] !== 'rep') return;
            
            const modal = new ModalBuilder()
            .setTitle('Репутація')

            const inp = new TextInputBuilder()
            .setCustomId('repinp')
            .setLabel("Примітка")
            .setPlaceholder('')
            .setMaxLength(250)
            .setStyle(TextInputStyle.Paragraph);
            const input = new ActionRowBuilder().addComponents(inp);
            modal.addComponents(input);

            if (char[1] === 'changebg') {
                await interaction.deferReply({ephemeral: true})
                let bgs = [
                    {
                        label: 'Стандартний',
                        value: 'default'
                    },
                ]
                
                if (interaction.member.roles.cache.has(cfg.roles.athenapvp)) {
                    bgs[bgs.length] = {
                        label: `Проклятий Афіною`,
                        value: 'athenapvp'
                    }
                }
                if (interaction.member.roles.cache.has(cfg.roles.reaperpvp)) {
                    bgs[bgs.length] = {
                        label: `Прославлений Полум'ям`,
                        value: 'reaperpvp'
                    }
                }
                if (interaction.member.roles.cache.has(cfg.roles.tester)) {
                    bgs[bgs.length] = {
                        label: 'Тестувальник',
                        value: 'test'
                    }
                }
                if (interaction.member.roles.cache.has(cfg.roles.parlamentar)) {
                    bgs[bgs.length] = {
                        label: 'Парламентар',
                        value: 'parlamentar'
                    }
                }
                if (interaction.member.roles.cache.has(cfg.roles.admin)) {
                    bgs[bgs.length] = {
                        label: `Техно`,
                        value: 'tech'
                    }
                }
                if (interaction.member.roles.cache.has(cfg.roles.haki)) {
                    bgs[bgs.length] = {
                        label: `Хакі`,
                        value: 'haki'
                    }
                }
                if (interaction.member.roles.cache.has(cfg.roles.frozen)) {
                    bgs[bgs.length] = {
                        label: `Сніжний`,
                        value: 'frozen'
                    }
                }
                if (interaction.member.roles.cache.has(cfg.roles.owner)) {
                    bgs[bgs.length] = {
                        label: 'Начальник Порту',
                        value: 'owner'
                    }
                }
                const sel = new ActionRowBuilder().setComponents(
                    new StringSelectMenuBuilder()
                    .setCustomId('rep-changebg')
                    .setPlaceholder('Nothing selected...')
                    .addOptions(bgs)
                )
                
                return await interaction.editReply({components: [sel]})
            }
            if (char[1] === 'changetitle') {
                await interaction.deferReply({ephemeral: true})
                let ttls = [
                    {
                        label: 'Пірат',
                        value: 'default'
                    },
                ]
                
                if (interaction.member.roles.cache.has(cfg.roles.athenapvp)) {
                    ttls[ttls.length] = {
                        label: `Вартовий Афін`,
                        value: 'athenapvp'
                    }
                }
                if (interaction.member.roles.cache.has(cfg.roles.reaperpvp)) {
                    ttls[ttls.length] = {
                        label: `Поплічник Полум'я`,
                        value: 'reaperpvp'
                    }
                }
                if (interaction.member.roles.cache.has(cfg.roles.tester)) {
                    ttls[ttls.length] = {
                        label: `Тестувальник`,
                        value: 'test'
                    }
                }
                if (interaction.member.roles.cache.has(cfg.roles.raid_leader) || interaction.member.roles.cache.has(cfg.roles.instructor)) {
                    ttls[ttls.length] = {
                        label: 'Офіцер Порту',
                        value: 'officer'
                    }
                }
                if (interaction.member.roles.cache.has(cfg.roles.admin)) {
                    ttls[ttls.length] = {
                        label: 'Наглядач Порту',
                        value: 'admin'
                    }
                }
                if (interaction.member.roles.cache.has(cfg.roles.head_admin)) {
                    ttls[ttls.length] = {
                        label: 'Розробник',
                        value: 'dev'
                    }
                }
                if (interaction.member.roles.cache.has(cfg.roles.owner)) {
                    ttls[ttls.length] = {
                        label: 'Начальник Порту',
                        value: 'owner'
                    }
                }
                
                const sel = new ActionRowBuilder().setComponents(
                    new StringSelectMenuBuilder()
                    .setCustomId('rep-changetitle')
                    .setPlaceholder('Nothing selected...')
                    .addOptions(ttls)
                )
                
                return await interaction.editReply({components: [sel]})
            }
            if (char[1] === 'plus' || char[1] === 'minus') {
                const dbdaily = await dayrep.findOne({User: interaction.user.id})
                    if (dbdaily) {
                        let arr = await dbdaily.Votes
                        if (arr.length >= 3) {
                            return interaction.reply({content: `> Ліміт репутацій вичерпано`, ephemeral: true})
                        }
                        if (arr.includes(char[2])) {
                            return interaction.reply({content: `> Ви вже змінювали репутацію цього користувача сьогодні`, ephemeral: true})
                        }
                    }
                

                const db = await repSchema.findOne({User: char[2]})
                if (char[1] === 'plus') {
                    if (db && db.Plus.includes(interaction.user.id)) {
                        return interaction.reply({content: `> Ви вже віддавали даний голос для цього користувача`, ephemeral: true})
                    }
                } else if(char[1] === 'minus') {
                    if (db && db.Minus.includes(interaction.user.id)) {
                        return interaction.reply({content: `> Ви вже віддавали даний голос для цього користувача`, ephemeral: true})
                    }
                }
                

                await modal.setCustomId(interaction.customId)
                return await interaction.showModal(modal)
            }
        } else if (interaction.isModalSubmit()) {
            const char = interaction.customId.split('-')
            if (char[0] && char[0] !== 'rep') return;

            const txt = interaction.fields.getTextInputValue("repinp")
            const n_txt = txt.replace(/(\r\n|\n|\r)/gm, " ");
            const m = interaction.guild.members.cache.get(char[2])

            await interaction.deferReply({ephemeral: true})
            const embed = new EmbedBuilder()
            .setTitle('Документація репутації')
            .setImage('https://i.postimg.cc/QCdt25qM/image-66.png')
            .setDescription(`${interaction.user} змінив(-ла) репутацію гравця <@${char[2]}> (_${m.user.tag}_)`)
            .setFields({name: `Коментарем:`, value: `_${n_txt}_`})

            const db = await repSchema.findOne({User: char[2]})
            let n_plus, n_minus;
            if (char[1] === 'plus') {
                if (db.Minus.includes(`${interaction.user.id}`)) {
                    n_minus = db.Minus
                    n_minus.splice(db.Minus.indexOf(interaction.user.id), 1)
                } else {
                    n_minus = db.Minus
                }
                
                n_plus = db.Plus
                n_plus.push(interaction.user.id)
                embed.setColor('#2CEE15')
            }
            if (char[1] === 'minus') {
                if (db.Plus.includes(`${interaction.user.id}`)) {
                    n_plus = db.Plus
                    n_plus.splice(db.Plus.indexOf(interaction.user.id), 1)
                } else {
                    n_plus = db.Plus
                }

                n_minus = db.Minus
                n_minus.push(interaction.user.id)
                embed.setColor('#EE1515')  
            }

            await repSchema.deleteMany({User: char[2]})
            await repSchema.create({
                User: char[2],
                Username: db.Username,
                Desc: db.Desc,
                Title: db.Title,
                Plus: n_plus,
                Minus: n_minus
            })

            const daily = await dayrep.findOne({User: interaction.user.id})
            if (daily) {
                let arr = await daily.Votes
                arr[arr.length] = char[2]
                await dayrep.deleteOne({User: interaction.user.id})
                await dayrep.create({
                    User: interaction.user.id,
                    Votes: arr
                })
            } else {
                let arr = []
                arr[arr.length] = char[2]
                await dayrep.create({
                    User: interaction.user.id,
                    Votes: arr
                })
            }

            await repchnl.send({embeds: [embed]})
            return await interaction.editReply({content: `> Репутація була змінена`})
        }
    }
}