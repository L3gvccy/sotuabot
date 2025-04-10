const client = require('../../main');
const cfg = require('../../config.json');
const timeInRaid = require('../../Models/timeInRaid');
const { ChannelType, GuildVoice, Collection, EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'timeinraid'
}

client.on('voiceStateUpdate', async (oS, nS) => {
    if(nS.channel && nS.channel.parentId === cfg.cat.raid) {
        const db = await timeInRaid.findOne({Userid: nS.member.user.id})
        if(db) {
            const date = new Date()
            await timeInRaid.deleteMany({Userid: nS.member.user.id})
            await timeInRaid.create({
                Userid: nS.member.user.id,
                Time: db.Time,
                Join: date.getTime()
            })
        } else {
            const date = new Date()
            await timeInRaid.create({
                Userid: nS.member.user.id,
                Time: 0,
                Join: date.getTime()
            })
        }
    } else if(oS.channel && oS.channel.parentId === cfg.cat.raid) {
        const db = await timeInRaid.findOne({Userid: nS.member.user.id})
        if(db) {
            const date = new Date()
            const time = Number(db.Time) + date.getTime() - db.Join
            await timeInRaid.deleteMany({Userid: nS.member.user.id})
            await timeInRaid.create({
                Userid: nS.member.user.id,
                Time: time,
                Join: 0
            })
        } else {
            const date = new Date()
            const time = date.getTime() - db.Join
            await timeInRaid.create({
                Userid: nS.member.user.id,
                Time: time,
                Join: 0
            })
        }
    }
})