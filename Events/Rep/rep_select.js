const {} = require('discord.js')
const repSchema = require('../../Models/repModel')

module.exports = {
    name: 'interactionCreate',

    async execute(interaction) {
        if (interaction.isStringSelectMenu()) {
            const char = interaction.customId.split('-')
            if (char[0] !== 'rep') return;

            if(char[1] === 'changebg')  {
                await interaction.deferReply({ephemeral: true})

                const desc = interaction.values[0]
                const db = await repSchema.findOne({User: interaction.user.id})
    
                await repSchema.deleteMany({User: interaction.user.id})
                await repSchema.create({
                    User: interaction.user.id,
                    Username: interaction.user.username,
                    Desc: desc,
                    Title: db.Title,
                    Plus: db.Plus,
                    Minus: db.Minus
                })
    
                return await interaction.editReply({content: `> Оформлення було змінено`})
            }
            if(char[1] === 'changetitle')  {
                await interaction.deferReply({ephemeral: true})

                const ttl = interaction.values[0]
                const db = await repSchema.findOne({User: interaction.user.id})
    
                await repSchema.deleteMany({User: interaction.user.id})
                await repSchema.create({
                    User: interaction.user.id,
                    Username: interaction.user.username,
                    Desc: db.Desc,
                    Title: ttl,
                    Plus: db.Plus,
                    Minus: db.Minus
                })
    
                return await interaction.editReply({content: `> Титул було змінено`})
            }
            
        } else return;
    }
}