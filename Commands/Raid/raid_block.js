const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const cfg = require('../../config.json')
const tool = require('../../tools')
const raidblockperm = require('../../Models/raidBlockPerm')
const raidblocktemp = require('../../Models/raidBlockTemp')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('raid_block')
    .setDescription('Заборони рейду')
    .addSubcommandGroup(group =>
        group.setName('options')
        .setDescription('options')
        .addSubcommand(sub =>
            sub.setName('add')
            .setDescription('Punish')
            .addUserOption(option =>
                option.setName('target')
                .setDescription('Target User')
                .setRequired(true)
                )
            .addStringOption(option =>
                option.setName('time')
                .setDescription('Time for raid block')
                .setRequired(true)
                .setChoices(
                    {name: `Назавжди`, value: `perm`},
                    {name: `Тимчасово`, value: `temp`},
                )
                )
            .addStringOption(option =>
                option.setName('xbox')
                .setDescription('Xbox')
                .setRequired(false)
                )
            )
        .addSubcommand(sub =>
            sub.setName('remove')
            .setDescription('Remove')
            .addUserOption(option =>
                option.setName('target')
                .setDescription('Target User')
                .setRequired(true)
                )
            )
        )
    .addSubcommandGroup(group =>
        group.setName('info')
        .setDescription('info')
        .addSubcommand(sub =>
            sub.setName('discord')
            .setDescription('discord')
            .addUserOption(option =>
                option.setName('target')
                .setDescription('Target User')
                .setRequired(true)
                )
            )
        .addSubcommand(sub =>
            sub.setName('xbox')
            .setDescription('xbox')
            .addStringOption(option =>
                option.setName('target')
                .setDescription('Target User')
                .setRequired(true)
                )
            )
        ),

    async execute(interaction) {
        const {options, guild} = interaction
        const subgr = options.getSubcommandGroup()
        const sub = options.getSubcommand()
        const raidblockrole = guild.roles.cache.get(cfg.roles.raid_block)
        const raiderrole = guild.roles.cache.get(cfg.roles.raider)
        const raidlog = guild.channels.cache.get(cfg.channels.raid_log)

        if (!tool.isadmin(interaction.member) && !tool.israidleader(interaction.member)) {
            return interaction.reply({content: cfg.phrases.missingperms, ephemeral: true})
        }

        if(subgr === 'options') {
            if (sub === 'add') {
                const target = options.getUser('target')
                const time = options.getString('time')
                const xbox = options.getString('xbox') || 'none'

                const pb = await raidblockperm.findOne({Userid: target.id})
                const tb = await raidblocktemp.findOne({Userid: target.id})

                if(pb || tb) {
                    return interaction.reply({content: `> Користувач вже має блокування`, ephemeral: true})
                }

                const embed = new EmbedBuilder()
                .setColor(cfg.color.red)
                .setTitle('Документація рейдерів 🏴‍☠️')
                .setImage(cfg.image.embedbar)
                .setTimestamp()

                if(time === 'temp') {
                    await raidblocktemp.collection.createIndex({"Expire": 1}, {expireAfterSeconds: 14*cfg.daysinsec})
                    await raidblocktemp.collection.insertOne({
                        Userid: target.id,
                        Xbox: xbox,
                        Till: new Date(Date.now() + 14000*cfg.daysinsec),
                        Expire: new Date(Date.now() + 14000*cfg.daysinsec)
                    })

                    embed.setDescription(`${target} (_${target.username}_) отримав заборону рейду
                    **Duration:** 14 діб
                    **By:** ${interaction.user}`)

                    raidlog.send({embeds: [embed]})
                } else {
                    await raidblockperm.create({
                        Userid: target.id,
                        Xbox: xbox,
                    })

                    embed.setDescription(`${target} (_${target.username}_) отримав заборону рейду
                    **Duration:** Назавжди
                    **By:** ${interaction.user}`)

                    raidlog.send({embeds: [embed]})
                }

                await guild.members.cache.get(target.id).roles.add(raidblockrole)
                await guild.members.cache.get(target.id).roles.remove(raiderrole)
                await interaction.reply({content: `> Блокування було видано успішно`, ephemeral: true})
                return;
            } else if (sub === 'remove') {
                const target = options.getUser('target')
                const pb = await raidblockperm.findOne({Userid: target.id})
                const tb = await raidblocktemp.findOne({Userid: target.id})

                if(!pb && !tb) {
                    return interaction.reply({content: `> Блокувань не знайдено`, ephemeral: true})
                }

                await raidblockperm.deleteMany({Userid: target.id})
                await raidblocktemp.deleteMany({Userid: target.id})

                const embed = new EmbedBuilder()
                .setColor(cfg.color.green)
                .setTitle('Документація рейдерів 🏴‍☠️')
                .setImage(cfg.image.embedbar)
                .setDescription(`Заборона рейдів була знята з ${target} (_${target.username}_)
                **By:** ${interaction.user}`)
                .setTimestamp()

                raidlog.send({embeds: [embed]})
                await guild.members.cache.get(target.id).roles.remove(raidblockrole)
                return interaction.reply({content: `> Блокування було знято`, ephemeral: true})
            }
        } else if (subgr === 'info') {
            if (sub === 'discord') {
                const target = options.getUser('target')
                const pb = await raidblockperm.findOne({Userid: target.id})
                const tb = await raidblocktemp.findOne({Userid: target.id})

                if(!pb && !tb) {
                    return interaction.reply({content: `> Блокувань не знайдено`, ephemeral: true})
                }
                const embed = new EmbedBuilder()
                .setColor(cfg.color.blue)
                .setTitle('Документація рейдерів 🏴‍☠️')
                .setTimestamp()
                if(pb) {
                    embed.setDescription(`Користувач має перманентну заборону рейдів
                    _**Discord:**_ <@${pb.Userid}>
                    _**XBox:**_ ${pb.Xbox}`)
                    interaction.reply({embeds: [embed], ephemeral: true})
                    return;
                }
                if(tb) {
                    const till = new Date(tb.Till).toLocaleString().split(',')[0].split('.')
                    const dt = Date.parse(`${till[2]}-${till[1]}-${till[0]}T12:00:00`)

                    embed.setDescription(`Користувач має тимчасову заборону рейдів
                    _**Discord:**_ <@${tb.Userid}>
                    _**XBox:**_ ${tb.Xbox}
                    Дійсна до: <t:${Math.floor(new Date(dt)/1000)}>`)
                    interaction.reply({embeds: [embed], ephemeral: true})
                    return;
                }

            } else if (sub === 'xbox') {
                const target = options.getString('target')
                const pb = await raidblockperm.findOne({Xbox: target})
                const tb = await raidblocktemp.findOne({Xbox: target})

                if(!pb && !tb) {
                    return interaction.reply({content: `> Блокувань не знайдено`, ephemeral: true})
                }
                const embed = new EmbedBuilder()
                .setColor(cfg.color.blue)
                .setTitle('Документація рейдерів 🏴‍☠️')
                .setTimestamp()
                if(pb) {
                    embed.setDescription(`Користувач має перманентну заборону рейдів
                    _**Discord:**_ <@${pb.Userid}>
                    _**XBox:**_ ${pb.Xbox}`)
                    interaction.reply({embeds: [embed], ephemeral: true})
                    return;
                }
                if(tb) {
                    const till = new Date(tb.Till).toLocaleString().split(',')[0].split('.')
                    const dt = Date.parse(`${till[2]}-${till[1]}-${till[0]}T12:00:00`)

                    embed.setDescription(`Користувач має тимчасову заборону рейдів
                    _**Discord:**_ <@${tb.Userid}>
                    _**XBox:**_ ${tb.Xbox}
                    Дійсна до: <t:${Math.floor(new Date(dt)/1000)}>`)
                    interaction.reply({embeds: [embed], ephemeral: true})
                    return;
                }

            }
        }
    }
}