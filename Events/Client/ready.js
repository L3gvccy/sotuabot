const { ChannelType } = require('discord.js')
const mongoose = require('mongoose')
const cfg = require('../../config.json')
const {schedule} = require('node-cron')
const dayrep = require('../../Models/dayrep')

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        await mongoose.connect(cfg.mongodb || '', {
			keepAlive: true
		})
		if (mongoose.connect) {
			console.log('Mongoose ready')
		}

        console.log(`${client.user.username} ready to battle!`)

        const main_guild = client.guilds.cache.get(cfg.guildid);
		const voices = 
			[client.channels.cache.get(cfg.counters.all_counter), 
			client.channels.cache.get(cfg.counters.online_counter), 
			client.channels.cache.get(cfg.counters.voice_counter)]
		if(voices[0] || voices[1] || voices[2])
		{
			setInterval(() => {
				if(voices[0])
				{
					voices[0].setName(`👥 Пірати: ${main_guild.memberCount.toLocaleString()}`);
				}
				if(voices[1])
				{
					voices[1].setName(`🏃 Бадьорі: ${main_guild.members.cache.filter(user => user.presence?.status == 'dnd' || user.presence?.status == 'online' || user.presence?.status == 'idle').size.toLocaleString()}`);
				}
				if(voices[2])
				{
					voices[2].setName(`🌊 У морі: ${main_guild.members.cache.filter(m => m.voice.channel).size.toLocaleString()}`);	
				}
			}, 600000);
		} 

		const invitechannel = await client.channels.cache.get(cfg.channels.invite)
		const amount = await invitechannel.messages.fetch({limit:100});
		if (amount.size > 1) {
			try {
				invitechannel.bulkDelete(amount.size - 1)
			} catch (error) {
				console.error(error)
			}
		}

		schedule('0 3 * * *', async () => {
			await dayrep.deleteMany({}).then(console.log('Daily reps cleared'))
		})
    }
}