const { EmbedBuilder, Events } = require('discord.js')
const cfg = require('../../config.json')

module.exports = {
    name: 'messageDelete',
    once: false,
    async execute(message, client) {

        try {
            if (message.author.bot)  
            return;
        } catch (error) {
            return;
        }
        

        const logChannel = client.channels.cache.get(cfg.channels.message_log);

        const embed = new EmbedBuilder()
        .setColor(1752220)
        .setTitle('Документація подій')
        .setDescription(`**Повідомлення видалено!**
        _**Автор:**_ ${message.member}
        _**Чат:**_ ${message.channel}
        _**Текст повідомлення:**_
        ${message.content}`)
        .setTimestamp();

        logChannel.send({embeds: [embed]})
    }
}