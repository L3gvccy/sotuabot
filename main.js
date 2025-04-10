const { Client, ActivityType, Activity, GatewayIntentBits, Partials, Collection } = require('discord.js');

const {Guilds, GuildMembers, GuildMessages} = GatewayIntentBits;
const {User, Message, GuildMember, ThreadMember, Channel} = Partials;

const {loadEvents} = require('./Handlers/eventHandler');
const {loadCommands} = require('./Handlers/commandHandler');

const client = new Client({
    restRequestTimeout: 60000,
    intents: [Guilds, GuildMembers, GuildMessages, 'MessageContent', 'GuildVoiceStates', 32767],
    partials: [User, Message, GuildMember, ThreadMember]
});
client.setMaxListeners(20)

client.chats = new Collection();
client.commands = new Collection();
client.messageCommands = new Collection();
client.config = require('./config.json');

module.exports = client;

client.login(client.config.token).then(() => {
    loadEvents(client);
    loadCommands(client);
});