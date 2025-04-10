const { EmbedBuilder } = require('discord.js')
const cfg = require('../../config.json')
const tool = require('../../tools')

module.exports = {
    name: 'voiceStateUpdate',

    async execute(oS, nS, client) {
        const chnllog = client.channels.cache.get(cfg.channels.channels_log)
        const embed = new EmbedBuilder()
        .setTitle('Документація подій')
        .setTimestamp()
        if(nS.channel && !oS.channel) {
            embed.setColor(cfg.color.green)
            .setDescription(`${nS.member.user} підключився до екіпажу ${nS.channel} (${nS.channel.name})`)
            chnllog.send({embeds: [embed]})
        }
        if(!nS.channel && oS.channel) {
            embed.setColor(cfg.color.red)
            .setDescription(`${oS.member.user} покинув екіпаж ${oS.channel} (${oS.channel.name})`)
            chnllog.send({embeds: [embed]})
        }
    }
}