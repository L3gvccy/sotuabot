const { SlashCommandBuilder } = require('discord.js')
const tool = require('../../tools')
const cfg = require('../../config.json')
const prv = require('../../Models/prvoiceModel')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('private_add')
    .setDescription('Add member to private voice')
    .addUserOption(option =>
        option.setName('user')
        .setDescription('Target User')
        .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ephemeral: true})
        const {options, guild} = interaction
        const user = options.getUser('user')
        const logChannel = guild.channels.cache.get(cfg.channels.prvoice_log)

        if(user.bot) {
            return await interaction.editReply({content: `> Ви не можете додати бота до каналу`})
        }

        const db = await prv.findOne({User: interaction.user.id})
                if (!db) {
                    return await interaction.editReply({content: '> У вас немає голосового каналу'})
                } 

                const vc = guild.channels.cache.get(db.Voice)
                const userid = user.id
                const m = guild.members.cache.get(userid)
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
}