const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, StringSelectMenuBuilder } = require('discord.js')
const tool = require('../../tools')
const cfg = require('../../config.json')
const repSchema = require('../../Models/repModel')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('rep')
    .setDescription('Reputation')
    .addUserOption(option => 
        option.setName('user')
        .setDescription('Get user')
        .setRequired(true)
        ),
    
    async execute(interaction) {
        const {options} = interaction;
        const repUser = options.getUser('user')
        await interaction.deferReply({ephemeral: true})

        if (repUser.bot) {
            return await interaction.editReply({content: `> Цьому користувачу не можна змінити репутацію`})
        }

        const repbtns = new ActionRowBuilder().setComponents(
            new ButtonBuilder().setCustomId(`rep-plus-${repUser.id}`).setEmoji('1054099604393705512').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`rep-minus-${repUser.id}`).setEmoji('1054099626707402774').setStyle(ButtonStyle.Primary),
        )
        const stylebtns = new ActionRowBuilder().setComponents(
            new ButtonBuilder().setCustomId(`rep-changebg`).setEmoji('989105762703904778').setLabel('Мої фони').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`rep-changetitle`).setEmoji('989105733071147108').setLabel('Мої титули').setStyle(ButtonStyle.Primary),
        )

        const rep = await repSchema.findOne({User: repUser.id})
        let repval = '0', descr = 'default', title = 'default';
        if (!rep) {
            await repSchema.create({
                User: repUser.id,
                Username: repUser.username,
                Desc: 'default',
                Title: 'default',
                Plus: [],
                Minus: []
            })
        } else {
            descr = await rep.Desc
            repval = rep.Plus.length - rep.Minus.length
            title = await rep.Title
        }

        const repimg = await tool.drawRep(repUser, repval, descr, title)
        if (repUser.id === interaction.user.id) {
            return await interaction.editReply({files: [repimg], components: [stylebtns]})
        } else {
            return await interaction.editReply({files: [repimg], components: [repbtns]})
        } 
    }
}