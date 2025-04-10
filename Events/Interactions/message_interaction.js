const {} = require('discord.js')

module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {
        const {guild} = interaction
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                interaction.reply({ content: "outdated command" });
            }

          command.execute(interaction, client);
        } else return;
    }
}