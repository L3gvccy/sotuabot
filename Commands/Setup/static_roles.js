const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const cfg = require('../../config.json')
const tool = require('../../tools')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('static_roles')
    .setDescription('Setup static roles'),

    async execute(interaction) {
        if(!tool.isadmin(interaction.member)) {
            return interaction.reply({content: cfg.phrases.missingperms, ephemeral: true})
        }

        const hrs_embed = new EmbedBuilder()
        .setColor(cfg.color.aqua)
        .setTitle(`**Розподільча дільниця!**`)
        .setDescription(`**Вітаємо вас на нашому Discord Сервері!**
        Ми хочемо створити якомога зручнішу атмосферу для гри, тому пропонуємо вам обрати певні ролі, які допоможуть вам зорієнтуватися на сервері.
        
        Для початку, пропонуємо Вам визначити, який Ви пірат та на якій системі Ви граєте.
        Інформацію про усі інші ролі, Ви можете знайти тут: <#986950920862597171>.`)
        .addFields( 
            { name: 'Опис початкових ролей\n ', value: `Салага \nДослідник Морів \nМорський Пройдисвіт \nВолодар Морів`, inline: true},
            { name: '឵\n ', value: `[**0+ годин**] \n[**75+ годин**] \n[**250+ годин**] \n[**500+ годин**] `, inline: true},
        )
        .setTimestamp();
        const notif_embed = new EmbedBuilder()
        .setColor(cfg.color.aqua)
        .setTitle(`**Розподільча дільниця!**`)
        .setDescription(`Вітаємо вас ще раз!
        У зв'язку того, що на нашому сервері досить часто відправляють оповіщення про певні події пов'язані з цією спільнотою, ми пропонуємо вам додатково обрати собі ролі, щоб дізнаватися про них першими.`)
        .setTimestamp()

        const hrs_btns = new ActionRowBuilder().setComponents(
            new ButtonBuilder().setCustomId(`hrs_btn-${cfg.roles.pirate_1}`).setEmoji('988073930503901204').setLabel('Салага').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`hrs_btn-${cfg.roles.pirate_2}`).setEmoji('988073986829213737').setLabel('Дослідник морів').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`hrs_btn-${cfg.roles.pirate_3}`).setEmoji('988070460153548861').setLabel('Морський пройдисвіт').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`hrs_btn-${cfg.roles.pirate_4}`).setEmoji('988073109192048730').setLabel('Володар морів').setStyle(ButtonStyle.Primary),
        )
        const plat_btns = new ActionRowBuilder().setComponents(
            new ButtonBuilder().setCustomId(`plat_btn-${cfg.roles.xbox}`).setEmoji('989107862389272596').setLabel('XBOX').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`plat_btn-${cfg.roles.pc}`).setEmoji('🖥️').setLabel('PC').setStyle(ButtonStyle.Secondary),
        )
        const notif_btns = new ActionRowBuilder().setComponents(
            new ButtonBuilder().setCustomId(`notif_btn-${cfg.roles.kino}`).setEmoji('989107957797093396').setLabel('Кіноман').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`notif_btn-${cfg.roles.streamviewer}`).setEmoji('989108395971846166').setLabel('Глядач стрімів').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`notif_btn-${cfg.roles.twitchdrops}`).setEmoji('899963355316494356').setLabel('Твіч Дропс').setStyle(ButtonStyle.Primary),
        )

        await interaction.channel.send({
            embeds: [hrs_embed],
            components: [hrs_btns, plat_btns]
        })
        await interaction.channel.send({
            embeds: [notif_embed],
            components: [notif_btns]
        })
        return interaction.reply({content: `> Статичні ролі встановлено`, ephemeral:true})
    }
}