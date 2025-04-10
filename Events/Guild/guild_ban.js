const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const cfg = require('../../config.json')
const tool = require('../../tools')

module.exports = {
    name: 'guildBanAdd',

    async execute(ban, client) {
        const adminlog = ban.guild.channels.cache.get(cfg.channels.admin_log)
        const embed = new EmbedBuilder()
        .setColor(cfg.color.red)
        .setTitle('Документація банів')
        .setDescription(`Блокування користувача ${ban.user} _**(${ban.user.tag})**_ :saluting_face: `)
        .setTimestamp()
        const btn = new ActionRowBuilder().setComponents(
            new ButtonBuilder().setCustomId(`punish-unban-${ban.user.id}`).setEmoji('✔️').setLabel('Зняти Блок').setStyle(ButtonStyle.Success)
        )
        adminlog.send({embeds: [embed], components: [btn]})
    }
}