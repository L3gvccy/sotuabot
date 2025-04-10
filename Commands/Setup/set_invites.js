const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const cfg = require('../../config.json')
const tool = require('../../tools')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('set_invites')
    .setDescription('Setup invites'),

    async execute(interaction) {
        if(!tool.isadmin(interaction.member)) {
            return interaction.reply({content: cfg.phrases.missingperms, ephemeral: true})
        }

        const embed = new EmbedBuilder()
        .setColor('#17E79B')
        .setTitle('Пошук Екіпажа')
        .setDescription(`Вітаємо всіх у нашій системі для пошуку команд!
        Ми вирішили зробити систему простішою та водночас цікавішою.
        
        Все що потрібно тепер:
        **1.** Створити голосовий канал у Флоті.
        **2.** Натиснути на одну з кнопочок емісарства.
        **3.** Придумати текст, який зацікавить усіх!
        
        **І все!** Тепер ваше круте повідомлення бачать усі,
        тож вам потрібно просто почекати і до вас обов'язково хтось зайде.
        
        _PS: Якщо є пропозиції чи зауваження - то у вас є для цього_ ⁠<#1040414668436541581> <3`)

        const btn_row_1 = new ActionRowBuilder().setComponents(
            new ButtonBuilder().setCustomId(`invite-merch`).setEmoji('988171340488015892').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`invite-order`).setEmoji('988170896395079680').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`invite-gold`).setEmoji('988170346995802152').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`invite-athena`).setEmoji('988172249595015220').setStyle(ButtonStyle.Primary),
        )
        const btn_row_2 = new ActionRowBuilder().setComponents(
            new ButtonBuilder().setCustomId(`invite-reaper`).setEmoji('988171775370227742').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`invite-hunter`).setEmoji('989108171886964756').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`invite-tale`).setEmoji('989106216598929428').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`invite-oth`).setEmoji('989104698936135700').setStyle(ButtonStyle.Primary),
        )
        const btn_row_3 = new ActionRowBuilder().setComponents(
            new ButtonBuilder().setCustomId(`invite-del`).setEmoji('❌').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`invite-athenapvp`).setEmoji('1078792097471148152').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`invite-reaperpvp`).setEmoji('1079014702811729981').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`invite-voiceedit`).setEmoji('👥').setStyle(ButtonStyle.Secondary),
        )

        await interaction.channel.send({
            embeds: [embed],
            components: [btn_row_1, btn_row_2, btn_row_3]
        })

        return interaction.reply({content: `> Дія виконана успішно`, ephemeral: true})
    }
}