const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js')
const cfg = require('../../config.json')
const tool = require('../../tools')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('start_raid')
    .setDescription('Розпочати рейд')
    .addStringOption(option =>
        option.setName('name')
        .setDescription('Назва рейду')
        .setRequired(true)
        )
    .addIntegerOption(option =>
        option.setName('channels')
        .setDescription('Кількість голосових каналів')
        .setRequired(true)
        )
    .addIntegerOption(option =>
        option.setName('userlimit')
        .setDescription('Ліміт користувачів каналу')
        .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply({content: `> Створюю канали`,ephemeral: true});
        if (!tool.isadmin(interaction.member) && !tool.israidleader(interaction.member)) {
            return interaction.editReply({content: cfg.phrases.missingperms})
        }
        const {options, guild, user} = interaction

        const r_name = options.getString('name')
        const r_userlimit = options.getInteger('userlimit')
        const r_count = options.getInteger('channels')
        const chnls = []
        
        const raidlog = guild.channels.cache.get(cfg.channels.raid_log)
        const raidsessions = guild.channels.cache.get(cfg.channels.raid_sessions)

        const embed = new EmbedBuilder()
        .setColor(cfg.color.aqua)
        .setTitle("Інформація про рейд")
        .setDescription(`Це автоматично створене повідомлення, яким ви можете користуватися під час рейду.
        Для обміну інформацією ви можете використовувати тред нижче.`)
        .setTimestamp()
        const btns = new ActionRowBuilder().setComponents(
            new ButtonBuilder().setCustomId(`newraid-end`).setEmoji('🏁').setLabel(`Завершити`).setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`newraid-add`).setEmoji('➕').setLabel(`Додати голосовий`).setStyle(ButtonStyle.Success),
        )

        for (let c = 1; c <= r_count; ++c) {
            chnls[c-1] = await guild.channels.create({
                name: `${r_name} №${c}`,
                type: ChannelType.GuildVoice,
                userLimit: r_userlimit,
                parent: cfg.cat.raid,
            }).then(c => c.lockPermissions().catch(console.error))
        }

        await embed.addFields({name: `Канали рейду:`, value: `${chnls}`})
        raidsessions.send({embeds: [embed], components: [btns]}).then(async (msg) => {
            const thr = await msg.startThread({
                name: `Рейд №${msg.id}`,
                autoArchiveDuration: 1440
            })
            thr.members.add(user.id);
        })

        const logembed = new EmbedBuilder()
        .setColor(cfg.color.aqua)
        .setTitle(`Документація рейдів 🏴‍☠️`)
        .setDescription(`**${user} (_${user.username}_) розпочав рейд**`)
        .setImage(cfg.image.embedbar)
        .setTimestamp()

        raidlog.send({embeds: [logembed]})

        return await interaction.editReply({content: `> Рейд було розпочато!`, ephemeral: true})
    }
}