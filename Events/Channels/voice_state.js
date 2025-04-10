const client = require('../../main');
const cfg = require('../../config.json');
const prv = require('../../Models/prvoiceModel')
const { ChannelType, GuildVoice, Collection, EmbedBuilder } = require("discord.js");


module.exports = {
    name: 'jointocreate'
}

client.on('voiceStateUpdate', async (oS, nS) => {
    const {member, guild} = oS;
    const chnllog = client.channels.cache.get(cfg.channels.channels_log)
    const newChannel = nS.channel;
    const oldChannel = oS.channel;
    const logChannel = await client.channels.cache.get(cfg.channels.prvoice_log)
    const jtc = '1101264442878066768';
    const tempParent = cfg.cat.jtc;

    if (oldChannel) {
        const members = oldChannel?.members
        .filter((m) => !m.user.bot)
        .map((m) => m.id)
    if (oldChannel && oldChannel.parentId === tempParent && !members[0]) {
        if(client.chats.get(`${oldChannel.id}_owner`)) {
            client.chats.delete(`${oldChannel.id}_owner`)
        }
        if(client.chats.get(`${oldChannel.id}_inv`)) {
            if (client.channels.cache.get(cfg.channels.invite).messages.cache.get(client.chats.get(`${oldChannel.id}_inv`))) {
                await client.channels.cache.get(cfg.channels.invite).messages.cache.get(client.chats.get(`${oldChannel.id}_inv`)).delete().catch(console.error)
            }
            client.chats.delete(`${oldChannel.id}_inv`)
        }
        await oldChannel.delete().catch((e) => null)
    }
    if(!newChannel || newChannel.id !== oldChannel.id) {
        const vc = oS.channel
        const db = await prv.findOne({Voice: oldChannel.id})
        if(!db) return;
        try {
            const logmsg = await logChannel.messages.fetch(db.Logmsg)
            const embed = logmsg.embeds[0]
            const btn = logmsg.components[0]
            embed.fields[1] = {name: `Остання активність:`, value: `${new Date().toLocaleDateString()}`}
            await logmsg.edit({embeds: [embed], components: [btn]})
            if (vc.members.size <= 0) {
                vc.permissionOverwrites.edit(cfg.guildid, {ViewChannel: false})
            }
        } catch (error) {  
        }
        return;
    }
    }
    
        
    if(newChannel && !oldChannel) {
        const vc = newChannel
        const db = await prv.findOne({Voice: vc.id})
        if(!db) return;
        const logmsg = await logChannel.messages.fetch(db.Logmsg)
        const embed = logmsg.embeds[0]
        const btn = logmsg.components[0]
        embed.fields[1] = {name: `Остання активність:`, value: `${new Date().toLocaleDateString()}`}
        
        await logmsg.edit({embeds: [embed], components: [btn]})
        try {
            
            if (vc.members.size > 0) {
                vc.permissionOverwrites.edit(cfg.guildid, {ViewChannel: true})
            } 
        } catch (error) {}
        return;
    }
})