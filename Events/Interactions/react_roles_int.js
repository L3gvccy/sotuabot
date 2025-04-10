const {} = require('discord.js')
const cfg = require('../../config.json')

module.exports = {
    name: 'interactionCreate',

    async execute(interaction, client) {
        const {guild, member} = interaction;

        if (interaction.isButton()) {
            const char = interaction.customId.split('-')
            if(!char[0]) return

            if(char[0] === 'hrs_btn') {
                if (member.roles.cache.has(cfg.roles.newbie)) {
                    await member.roles.remove(guild.roles.cache.get(cfg.roles.newbie))
                }
                if (member.roles.cache.has(cfg.roles.pirate_1)) {
                    await member.roles.remove(guild.roles.cache.get(cfg.roles.pirate_1))
                }
                if (member.roles.cache.has(cfg.roles.pirate_2)) {
                    await member.roles.remove(guild.roles.cache.get(cfg.roles.pirate_2))
                }
                if (member.roles.cache.has(cfg.roles.pirate_3)) {
                    await member.roles.remove(guild.roles.cache.get(cfg.roles.pirate_3))
                }
                if (member.roles.cache.has(cfg.roles.pirate_4)) {
                    await member.roles.remove(guild.roles.cache.get(cfg.roles.pirate_4))
                }
                await member.roles.add(guild.roles.cache.get(char[1]))
                return interaction.reply({content: `> Ролі було успішно оновлено`, ephemeral: true})
            } else if (char[0] === 'plat_btn') {
                if (member.roles.cache.has(cfg.roles.xbox)) {
                    member.roles.remove(guild.roles.cache.get(cfg.roles.xbox))
                }
                if (member.roles.cache.has(cfg.roles.pc)) {
                    member.roles.remove(guild.roles.cache.get(cfg.roles.pc))
                }
                await member.roles.add(guild.roles.cache.get(char[1]))
                return interaction.reply({content: `> Ролі було успішно оновлено`, ephemeral: true})
            } else if (char[0] === 'notif_btn') {
                if (member.roles.cache.has(char[1])) {
                    await member.roles.remove(guild.roles.cache.get(char[1]))
                } else {
                    await member.roles.add(guild.roles.cache.get(char[1]))
                }
                return interaction.reply({content: `> Ролі було успішно оновлено`, ephemeral: true})
            } else return
        } else return
    }
}