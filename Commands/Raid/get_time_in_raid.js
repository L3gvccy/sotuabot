const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const cfg = require('../../config.json')
const tool = require('../../tools')
const timeInRaid = require('../../Models/timeInRaid')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('time_in_raid')
    .setDescription('Get time spent in raid')
    .addUserOption(option =>
        option.setName('user')
        .setDescription('Target user')
        .setRequired(true)
        ),
    
    async execute(interaction, client) {
        const {options} = interaction;
        const user = options.getUser('user')
        const member = interaction.guild.members.cache.get(user.id)
        await interaction.deferReply({ephemeral: true})

        if(!tool.israidleader(interaction.member)) {
            return await interaction.editReply({content: cfg.phrases.missingperms})
        }

        const db = await timeInRaid.findOne({Userid: user.id})
        if(db) {
            const time_in_sec = db.Time / 1000
            const hrs = Math.trunc(time_in_sec / 3600)
            const mins = Math.trunc(time_in_sec / 60) - hrs * 60
            const secs = Math.trunc(time_in_sec) - hrs * 3600 - mins * 60

            const embed = new EmbedBuilder()
            .setColor('#2CF0F0')
            .setTitle(`Час проведений на рейді`)
            .setFields(
                {name: `Користувач:`, value: '```' + `${member.nickname || user.username}` + '```', inline: true},
                {name: `Час:`, value: '```' + `${hrs}h ${mins}m ${secs}s` + '```', inline: true},
            )
            .setTimestamp()

            return await interaction.editReply({embeds: [embed]})
        } else {
            return await interaction.editReply({content: '> Інформації не знайдено'})
        }
    }
}