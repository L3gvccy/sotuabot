const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const cfg = require('../../config.json')
const tool = require('../../tools')
const activeWarns = require('../../Models/activeWarns')
const totalWarns = require('../../Models/totalWarns')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn member')
    .addSubcommand(sub =>
        sub.setName('add')
        .setDescription('Warn user')
        .addUserOption(option =>
            option.setName('target')
            .setDescription('Target user')
            .setRequired(true)
            )
        .addStringOption(option =>
            option.setName('reason')
            .setDescription('Warn reason')
            .setRequired(false)
            )
        )
    .addSubcommand(sub =>
        sub.setName('remove')
        .setDescription('Remove warn')
        .addUserOption(option =>
            option.setName('target')
            .setDescription('Target user')
            .setRequired(true)
            )
        )
    .addSubcommand(sub =>
        sub.setName('info')
        .setDescription('Warn info')
        .addUserOption(option =>
            option.setName('target')
            .setDescription('Target user')
            .setRequired(true)
            )
        ),

    async execute(interaction, client) {
        if(!tool.isadmin(interaction.member)) {
            return interaction.reply({content: cfg.phrases.missingperms, ephemeral: true})
        }
        
        const {options, guild} = interaction
        const logChannel = guild.channels.cache.get(cfg.channels.warn_log)
        const adminlog = guild.channels.cache.get(cfg.channels.admin_log)
        const sub = options.getSubcommand()

            if (sub === 'add') {
                const target = options.getUser('target') || 'невідомий'
                const reason = options.getString('reason') || 'причина не вказана'

                let t_warns, a_warns;
                await interaction.deferReply({ephemeral: true})

                await totalWarns.findOne({Userid: target.id}).then(async (data) => {
                    if(!data) {
                        await totalWarns.create({
                            Userid: target.id,
                            Usertag: target.tag,
                            Warns: 1
                        }).then(d => t_warns = d.Warns)

                    } else {
                        t_warns = data.Warns + 1;
                        await totalWarns.deleteMany({Userid: target.id})
                        await totalWarns.create({
                            Userid: target.id,
                            Usertag: target.tag,
                            Warns: t_warns
                        })
                    }
                })

                await activeWarns.collection.createIndex({"Expire": 1}, {expireAfterSeconds: 28*cfg.daysinsec})
                await activeWarns.collection.insertOne({
                    Userid: target.id,
                    Usertag: target.tag,
                    Expire: new Date(Date.now() + 28000*cfg.daysinsec)
                })
                a_warns = await activeWarns.find({Userid: target.id}).countDocuments()

                const embed = new EmbedBuilder()
                .setColor(cfg.color.gold)
                .setTitle('Документація Доган')
                .setDescription(`${target} (_${target.username}_) отримав попередження
                **Причина:** ${reason}
                **By:** ${interaction.user}`)
                .setFields([
                    {name: `Кількість варнів:`, value: `${t_warns}`, inline: true},
                    {name: `Активні варни:`, value: `${a_warns}/3`, inline: true},
                ])
                .setTimestamp()

                await logChannel.send({embeds: [embed]})

                if (a_warns >= 3) {
                    const _embed = new EmbedBuilder()
                    .setColor(cfg.color.blue)
                    .setTitle('Документація Доган')
                    .setDescription(`Кількість активність попереджень користувача ${target} (_${target.username}_) досягла _**3** варнів_
                    Використайте один з запобіжніх заходів нижче, щоб покарати учасника.`)
                    .setFields([
                        {name: `Кількість варнів:`, value: `${t_warns}`, inline: true},
                        {name: `Активні варни:`, value: `${a_warns}/3`, inline: true},
                    ])
                    .setTimestamp()

                    const punish_btns = new ActionRowBuilder().setComponents(
                        new ButtonBuilder().setCustomId(`punish-ban-${target.id}`).setEmoji('🚫').setLabel('Серверний блок').setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId(`punish-timeout-${target.id}`).setEmoji('🕒').setLabel('Тимчасовий блок').setStyle(ButtonStyle.Primary),
                    )

                    await adminlog.send({embeds: [_embed], components: [punish_btns]})
                }

                const dm_embed = new EmbedBuilder()
                .setColor(cfg.color.red)
                .setTitle('Догана')
                .setDescription(`Ви отримали Warn на сервері **Sea of Thieves UA**!
                Час дії вашої догани до **[<t:${Math.ceil(new Date().getTime()/1000)+86400*28}>]**
                **Причина: ${reason}**`)
                .setFields([
                    {name: `Кількість варнів:`, value: `${t_warns}`, inline: true},
                    {name: `Активні варни:`, value: `${a_warns}/3`, inline: true},
                ])
                .setTimestamp()

                await interaction.guild.members.cache.get(target.id).send({embeds: [dm_embed]})

                await interaction.editReply({content: `> Дія виконана успішно`});
                return;
            }

            if (sub ==='remove') {
                const target = options.getUser('target') || 'невідомий'

                await interaction.deferReply({ephemeral: true})
                let t_warns, a_warns;

                await totalWarns.findOne({Userid: target.id}).then(async (data) => {
                    if(!data) {
                        t_warns = 'none'
                    } else {
                        if(data.Warns <= 0) {
                            t_warns = 'none'
                        } else {
                            t_warns = data.Warns - 1;
                            await totalWarns.deleteMany({Userid: target.id})
                            if(t_warns !== 0) {
                                await totalWarns.create({
                                    Userid: target.id,
                                    Usertag: target.tag,
                                    Warns: t_warns
                                })
                            }
                            
                        }
                    }
                })

                if (t_warns === 'none') {
                    await interaction.editReply({content: `> Доган не знайдено`})
                    return;
                }

                await activeWarns.deleteOne({Userid: target.id}).catch(e => null)
                a_warns = await activeWarns.find({Userid: target.id}).countDocuments()

                const embed = new EmbedBuilder()
                .setColor(cfg.color.gold)
                .setTitle('Документація Доган')
                .setDescription(`Догана знята з ${target} (_${target.username}_)
                **By:** ${interaction.user}`)
                .setFields([
                    {name: `Кількість варнів:`, value: `${t_warns}`, inline: true},
                    {name: `Активні варни:`, value: `${a_warns}/3`, inline: true},
                ])
                .setTimestamp()

                await logChannel.send({embeds: [embed]})

                await interaction.editReply({content: `> Варн видалено`})
                return;
            }


            if(sub === 'info') {
                const target = options.getUser('target') || 'невідомий'
                let t_warns, a_warns;

                await totalWarns.findOne({Userid: target.id}).then(async (data) => {
                    if(!data) {
                        t_warns = 0
                    } else {
                        t_warns = data.Warns
                    }
                })

                a_warns = await activeWarns.find({Userid: target.id}).countDocuments()

                if(t_warns === 0) {
                    return interaction.reply({content: `> Доган не знайдено`, ephemeral: true})
                }

                const embed = new EmbedBuilder()
                .setColor(cfg.color.gold)
                .setTitle('Документація Доган')
                .setDescription(`Догани користувача ${target} (_${target.username}_)`)
                .setFields([
                    {name: `Кількість варнів:`, value: `${t_warns}`, inline: true},
                    {name: `Активні варни:`, value: `${a_warns}/3`, inline: true},
                ])
                .setTimestamp()

                interaction.reply({embeds: [embed], ephemeral: true})
                return;
            }

        }
    }
