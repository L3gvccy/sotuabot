const { EmbedBuilder } = require('discord.js')
const cfg = require('../../config.json')
const tool = require('../../tools')

module.exports = {
    name: 'interactionCreate',

    async execute(interaction, client) {
        if(interaction.isButton()) {
            
            const char = interaction.customId.split('-')
            if(char[0] && char[0] !== 'punish') return;
            if(!tool.isadmin(interaction.member)) {
                return interaction.reply({content: cfg.phrases.missingperms, ephemeral: true})
            }
            const adminlog = interaction.guild.channels.cache.get(cfg.channels.admin_log)
            const target = interaction.guild.members.cache.get(char[2])
            if(char[1] === 'ban') {
                interaction.guild.members.ban(target)
                return interaction.reply({content: '> Учасник був заблокований на сервері', ephemeral: true})
            } else
            if(char[1] === 'timeout') {
                target.timeout(2419100000)
                return interaction.reply({content: '> Учасник був тимчасово заблокований на 28 діб', ephemeral: true})
            } else
            if(char[1] === 'unban') {
                const embed = new EmbedBuilder()
                .setColor(cfg.color.green)
                .setTitle('Документація банів')
                .setDescription(`${interaction.user} Зняв блокування з _**<@${char[2]}>**_`)
                .setTimestamp()

                let banned
                try {
                    banned = await interaction.guild.bans.fetch(char[2])
                } catch (error) {
                    return interaction.reply({content: `> Бана не існує`})
                }
                
                interaction.guild.members.unban(banned.user)
                adminlog.send({embeds: [embed]})
                return interaction.reply({content: `> Блокування успішно знято`, ephemeral: true})

            } else return;
        } else return;
    }
}