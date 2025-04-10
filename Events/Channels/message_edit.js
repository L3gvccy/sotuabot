const { EmbedBuilder } = require('discord.js')
const cfg = require('../../config.json')

module.exports = {
    name: 'messageUpdate',

    async execute(oldMessage, newMessage, client) {

        try {
            if (oldMessage.author.bot)  
            return;
        } catch (error) {
            return;
        }

        
        if (newMessage.content === oldMessage.content) return;
        const logChannel = client.channels.cache.get(cfg.channels.message_log);

        const embed = new EmbedBuilder()
        .setColor(1752220)
        .setTitle('Повідомлення')
        .setDescription(`**Повідомлення відредаговано!**
        _**Автор:**_ ${oldMessage.member}
        _**Чат:**_ ${oldMessage.channel}
        _**Старе повідомлення:**_
        ${oldMessage.content}
        _**Нове повідомлення:**_
        ${newMessage.content}`)
        .setTimestamp();

        logChannel.send({embeds: [embed]})
    }
}