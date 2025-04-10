const client = require('../../main');
const cfg = require('../../config.json')
const { ChannelType, GuildVoice, Collection, EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'jointocreate'
}

client.on('voiceStateUpdate', async (oS, nS) => {
    const {member, guild} = oS;
    const chnllog = client.channels.cache.get(cfg.channels.channels_log)
    const newChannel = nS.channel;
    const oldChannel = oS.channel;
    const jtc = '991839820533997698';
    const tempParent = cfg.cat.jtc;

    // if (oldChannel) {
    //     const members = oldChannel?.members
    //     .filter((m) => !m.user.bot)
    //     .map((m) => m.id)
    // if (oldChannel && oldChannel.parentId === tempParent && !members[0]) {
    //     if(client.chats.get(`${oldChannel.id}_owner`)) {
    //         client.chats.delete(`${oldChannel.id}_owner`)
    //     }
    //     if(client.chats.get(`${oldChannel.id}_inv`)) {
    //         await client.channels.cache.get(cfg.channels.test).messages.cache.get(client.chats.get(`${oldChannel.id}_inv`)).delete().catch(console.error)
    //         client.chats.delete(`${oldChannel.id}_inv`)
    //     }
    //     // await oldChannel.delete().catch((e) => null)
    // }
    // }

    if (oldChannel !== newChannel && newChannel && newChannel.id === jtc) {
        const voiceChannel = await guild.channels.create({
            name: `Шлюп`,
            type: ChannelType.GuildVoice,
            parent: tempParent,
            userLimit: 2,
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