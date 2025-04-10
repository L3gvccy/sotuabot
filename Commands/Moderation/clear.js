const {SlashCommandBuilder, CommandInteraction, PermissionFlagsBits, EmbedBuilder, embedLength} = require('discord.js');
const cfg = require('../../config.json')
const tool = require('../../tools')

module.exports = {
    data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription('Clear messages')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(option => 
        option.setName('amount')
        .setDescription('Messages to clear')
        .setRequired(true)
        ),

    async execute(interaction) {
        const {channel, options} = interaction;
        if(!tool.isadmin(interaction.member)) {
            return interaction.reply({content: cfg.phrases.missingperms, ephemeral: true})
        }

        const amount = options.getInteger('amount');

        const messages = await channel.messages.fetch({
            limit: amount + 1,
        });

        const res = new EmbedBuilder()
        .setColor(1752220)
        .setTimestamp();

        await channel.bulkDelete(amount).then(messages => {
            res.setDescription(`**Успішно видалено ${messages.size} повідомлень з каналу**`);
            interaction.reply({embeds: [res], ephemeral: true});
            return;
        })
        
    }
}