const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js')
const cfg = require('../../config.json')
const tool = require('../../tools')

module.exports = {
    name: 'interactionCreate',

    async execute(interaction) {
        if(interaction.isButton()) {
            const {guild, user} = interaction

            const char = interaction.customId.split('-');
            if (char[0] !== 'newraid') return;
            const raidlog = interaction.guild.channels.cache.get(cfg.channels.raid_log)
            
            await interaction.deferReply({ephemeral: true})
            if (!tool.isadmin(interaction.member) && !tool.israidleader(interaction.member)) {
                return interaction.reply({content: cfg.phrases.missingperms})
            }

            const msg = interaction.message
            if (char[1] === 'end') {
                const chnls = msg.embeds[0].fields[0].value.split(',')
                for (let i = 0; i < chnls.length; i++) {
                    const id = chnls[i].slice(2,-1)
                    if (interaction.guild.channels.cache.get(id)) {
                        await interaction.guild.channels.cache.get(id).delete().catch(e => null)
                    }
                }

                if(msg.channel.threads.cache.find(thr => thr.name === `Рейд №${msg.id}`)) {
                    await msg.channel.threads.cache.find(thr => thr.name === `Рейд №${msg.id}`).delete().catch(e => null);
                }
                await msg.delete().catch(e => null)

                const embed = new EmbedBuilder()
                .setColor(cfg.color.red)
                .setTitle(`Документація рейдів 🏴‍☠️`)
                .setDescription(`**${interaction.user} (_${interaction.user.username}_) завершив рейд**`)
                .setImage(cfg.image.embedbar)
                .setTimestamp()

                raidlog.send({embeds: [embed]})
                await interaction.editReply({content: `> Рейд завершено`})
                return;
            }
            if(char[1] === 'add') {
                const n_embed = msg.embeds[0]
                let chnls = n_embed.fields[0].value.split(',')
                chnls[chnls.length] = await guild.channels.create({
                    name: `Додатковий №${chnls.length}`,
                    type: ChannelType.GuildVoice,
                    userLimit: 4,
                    parent: cfg.cat.raid,
                }).then(c => c.lockPermissions().catch(console.error))
                n_embed.fields[0].value = `${chnls}`

                await msg.edit({embeds: [n_embed]})
                await interaction.editReply({content: `> Голосовий канал успішно створено`})
                return;
            }
        } else return;
    }
}