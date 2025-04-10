const {} = require('discord.js')
const cfg = require('../../config.json')

module.exports = {
    name: 'interactionCreate',

    async execute(interaction) {
        if(interaction.isButton()) {
            if(interaction.customId === 'annonce-confirm') {
                const embed = interaction.message.embeds[0]
                const emojis = embed.fields[1].value.split(',')
                embed.fields[1] = {name: ``, value: ``}
                interaction.channel.send({
                    content: `||<@&${cfg.roles.raider}>||`,
                    embeds: [embed]
                }).then(async msg => {
                    await msg.react('✅')
                    for (let i = 0; i < emojis.length; i++) {
                        const emoji = interaction.guild.emojis.cache.find(emoji => emoji.name === `${emojis[i]}`)
                        msg.react(emoji.id).catch((e) => null)
                    }
                })
                await interaction.reply({content: `> Повідомлення має з'явитись в каналі`, ephemeral: true})
                return;
            } else return;
        } else return;
    }
}