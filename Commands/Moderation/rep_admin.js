const { SlashCommandBuilder } = require('discord.js')
const tool = require('../../tools')
const cfg = require('../../config.json')
const repSchema = require('../../Models/repModel')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('rep_admin')
    .setDescription('Change reputation for user')
    .addUserOption(option =>
        option.setName('user')
        .setDescription('Target User')
        .setRequired(true)
        )
    .addStringOption(option =>
        option.setName('value')
        .setDescription('Reputation Value')
        .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ephemeral: true})
        if(!tool.isadmin(interaction.member)) {
            return await interaction.editReply({content: cfg.phrases.missingperms})
        }

        const {options} = interaction
        const user = options.getUser('user')
        const value = options.getString('value')

        const db = await repSchema.findOne({User: user.id})
        if(!db) {
            return await interaction.editReply({content: `> Цей пірат не має репутації`})
        }
        if(isNaN(value)) {
            return await interaction.editReply({content: `> Ви ввели не числове значення`})
        }
        await repSchema.deleteOne({User: user.id})
        await repSchema.create({
            User: db.User,
            Username: db.Username,
            Desc: db.Desc,
            Title: db.Title,
            Rep: `${value}` 
        })

        return await interaction.editReply({content: `> Репутація користувача ${user} була змінена`})
    }
}