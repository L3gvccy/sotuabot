const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const cfg = require('../../config.json')
const tool = require('../../tools')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('give_raider')
    .setDescription('Give raider role')
    .addUserOption(option =>
        option.setName('target')
        .setDescription('Target user')
        .setRequired(true)
        ),

    async execute(interaction, client) {
        if (!tool.isadmin(interaction.member) && !tool.israidleader(interaction.member)) {
            return interaction.reply({content: cfg.phrases.missingperms, ephemeral: true})
        }

        const raidlog = client.channels.cache.get(cfg.channels.raid_log);
        const raider = interaction.guild.roles.cache.get(cfg.roles.raider);
        const {options} = interaction;
        const t_user = options.getUser('target')
        const target = await interaction.guild.members.fetch(t_user.id)
        if (target.roles.cache.has(cfg.roles.raid_block)) {
            return interaction.reply({content: `> Неможливо видати роль у зв'язку з забороною цього користувача`, ephemeral: true})
        }
        if (target.roles.cache.has(cfg.roles.raider)) {
            return interaction.reply({content: `> Цей користувач вже має каперство`, ephemeral: true})
        }

        const embed = new EmbedBuilder()
        .setColor(cfg.color.blue)
        .setTitle('Документація рейдерів 🏴‍☠️')
        .setDescription(`${t_user} _(${t_user.username})_ отримав роль рейдера!
        **By:** ${interaction.user}`)
        .setImage(cfg.image.embedbar)
        .setTimestamp()
        
        await target.roles.add(raider)

        await raidlog.send({embeds: [embed]})
        return interaction.reply({content: `> Дія виконана успішно!`, ephemeral: true})
    }
}