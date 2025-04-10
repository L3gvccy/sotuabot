const client = require('../../main');
const cfg = require('../../config.json')
const { ChannelType, GuildVoice, Collection, EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'voicestate'
}

client.on('voiceStateUpdate', async (oS, nS) => {
    const {member, guild} = oS;
    const chnllog = client.channels.cache.get(cfg.channels.channels_log)
    const newChannel = nS.channel;
    const oldChannel = oS.channel;
    const jtc = '1101264442878066768';
    const tempParent = cfg.cat.jtc;

    if (oldChannel !== newChannel && newChannel && newChannel.id === jtc) {
        const voiceChannel = await guild.channels.create({
            name: `Легасі щось тестить`,
            type: ChannelType.GuildVoice,
            parent: tempParent,
            userLimit: 1,
            permissionOverwrites: [
                {
                    id: member.id,
                    allow: ["Connect", "ManageChannels"],
                },
                {
                    id: guild.id,
                    allow: ["Connect"],
                },
            ]
        })

        client.chats.set(`${voiceChannel.id}_owner`, member.id)

        const embed = new EmbedBuilder()
        .setTitle('Документація подій')
        .setColor(cfg.color.green)
        .setDescription(`${nS.member.user} підключився до екіпажу ${voiceChannel} (${voiceChannel.name})`)
        .setTimestamp()
        chnllog.send({embeds: [embed]})

        return setTimeout(() => {
            member.voice.setChannel(voiceChannel)
        }, 250);
    }
})