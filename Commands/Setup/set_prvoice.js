const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const cfg = require('../../config.json')
const tool = require('../../tools')
const prv = require('../../Models/prvoiceModel')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('set_prvoice')
    .setDescription('Set Private Voice'),

    async execute(interaction, client) {
        if(!tool.isadmin(interaction.member)) {
            return interaction.reply({content: cfg.phrases.missingperms, ephemeral: true})
        }

        const embed = new EmbedBuilder()
        .setColor('#11F390')
        .setTitle('Приватний Флот')
        .setDescription(`**Ахой, капітани!**\nРаді вітати вас в системі приватних голосових каналів. За допомогою кнопок нижче, ви можете керувати власним каналом:`)
        .setFields(
            {name: `Налаштування кімнати`, value: `>>> [<:plus:1111402117530394654>]  –  _Створити приватну кімнату_ \n [<:memberadd:1111402113050869841>]  –  _Додати пірата_ \n [<:memberremove:1111402114720215150>]  –  _Вилучити пірата_ \n [<:cross:1111402109926117496>]  –  _Видалити приватну кімнату_`},
            {name: ` `, value: 'Для додавання пірата до власної кімнати він має знаходитись у <#1105134293837168701>. Після цього натисніть необхідну кнопку знизу.\nАбо можете скористатись командою `/private_add` (користувач не обов`язково має знаходитись в кімнаті очікування для її виконання).'},
            {name: ' ', value: `_P.S. Якщо ви маєте питання або пропозиції стосовно приватного флоту - у вас для цього є _<#1040414668436541581> <3`})

        .setTimestamp()
        
        const btns = new ActionRowBuilder().setComponents(
            new ButtonBuilder().setCustomId('prvoice-create').setEmoji('1111402117530394654').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('prvoice-add').setEmoji('1111402113050869841').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('prvoice-remove').setEmoji('1111402114720215150').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('prvoice-delete').setEmoji('1111402109926117496').setStyle(ButtonStyle.Primary),
        )

        await interaction.channel.send({embeds: [embed], components: [btns]})
        return await interaction.reply({content: `> Дія виконана успішно`, ephemeral: true})
    }
}