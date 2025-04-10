const { PermissionsBitField } = require('discord.js')
const cfg = require('../../config.json')
const tool = require('../../tools')

module.exports = {
    name: 'interactionCreate',

    async execute(interaction, client) {
        if (interaction.isButton()) {
            const char = interaction.customId.split('-')
            if(char[0] !== 'voice_edit') return;
            
            const chnl = interaction.member.voice.channel;
            if (!client.chats.get(`${chnl.id}_sel`)) {
                return interaction.reply({content: `> Спочатку оберіть користувача`, ephemeral: true})
            }
            const target = interaction.guild.members.cache.get(client.chats.get(`${chnl.id}_sel`))
            if (!target || !target.voice.channel || target.voice.channel.id !== interaction.member.voice.channel.id) {
                return interaction.reply({content: `> Сталася помилка`, ephemeral: true})
            }
            
            switch (char[1]) {
                case 'kick':
                    if(tool.isadmin(target)) {
                        return interaction.reply({content: `> Ви не можете виконати цю дію`, ephemeral: true})
                    }
                    await target.voice.disconnect().catch(e => null)
                    interaction.reply({content: `> Пірат покинув голосовий канал`, ephemeral: true})
                    break;
                case 'ban':
                    if(tool.isadmin(target)) {
                        return interaction.reply({content: `> Ви не можете виконати цю дію`, ephemeral: true})
                    }
                    chnl.permissionOverwrites.edit(target, {Connect: false})
                    await target.voice.disconnect().catch(e => null)
                    interaction.reply({content: `> Пірат покинув голосовий канал`, ephemeral: true})
                    break;
                case 'own':
                    await client.chats.set(`${chnl.id}_owner`, target.user.id)
                    chnl.permissionOverwrites.edit(target, {ManageChannels: true})
                    chnl.permissionOverwrites.delete(interaction.member)

                    await interaction.reply({content: `> Права капітана були успішно передані`, ephemeral: true})
                    break;
            } return
        } else return
    }
}