const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const cfg = require('../../config.json')
const tool = require('../../tools')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('set_guild')
    .setDescription('Setup guild announcements'),

    async execute(interaction, client) {
        if(!tool.isadmin(interaction.member)) {
            return interaction.reply({content: cfg.phrases.missingperms, ephemeral: true})
        }

        const embed = new EmbedBuilder()
        .setTitle('Дошка оголошень гільдій')
        .setDescription(`Вітаємо, піратство!\nЗ виходом 10 сезону в морі крадіїв з'явились гільдії.\nТому ми пропонуємо вам скористатись дошкою оголошень для пошуку гільдій або реклами власної.\n\nДля створення оголошення вам всього лиш необхідно натиснути кнопку нижче та заповнити форму, вказавши всю необхідну інформацію про власну гільдію.`)
        .setColor('#fb8445')
        .setImage(cfg.image.embedbar)
        .setTimestamp()
        
        const btn = new ActionRowBuilder().setComponents(
            new ButtonBuilder().setCustomId(`announce-btn`).setEmoji('🧾').setLabel('Створити/редагувати оголошення').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`announce-del`).setEmoji('❌').setLabel('Видалити оголошення').setStyle(ButtonStyle.Secondary),
        )

        await interaction.channel.send({
            embeds: [embed],
            components: [btn]
        })

        return interaction.reply({content: `> Дія виконана успішно`, ephemeral: true})
    }
}