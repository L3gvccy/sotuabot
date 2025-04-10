const {} = require('discord.js')
const cfg = require('../../config.json')
const tool = require('../../tools')
const client = require('../../main')

module.exports = {
    name: 'change_inv'
}

client.on('voiceStateUpdate', async (oS, nS) => {
    if (nS.channel && nS.channel.parentId === cfg.cat.jtc) {
        tool.editinv(client, nS)
    }
    if (oS.channel && oS.channel.parentId === cfg.cat.jtc) {
        tool.editinv(client, oS)
    }
})