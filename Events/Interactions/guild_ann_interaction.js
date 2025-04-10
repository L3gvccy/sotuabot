const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, Client, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js')
const cfg = require('../../config.json')
const tool = require('../../tools')
const guildanns = require('../../Models/guildAnns')

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isButton()) {
            const char = interaction.customId.split('-');
            if (char[0] !== 'announce') return;

            if (char[1] == 'btn') {
                const db = await guildanns.findOne({Author: interaction.user.id})

                const modal = new ModalBuilder()
                .setCustomId('announce')
                
                if(db) {
                    modal.setTitle('Редагування оголошення')
                } else {
                    modal.setTitle('Створення оголошення')
                }

                const name = new TextInputBuilder()
                .setCustomId(`announce-name`)
                .setLabel(`Назва гільдії`)
                .setPlaceholder('Введіть назву гільдії')
                .setRequired(true)
                .setMaxLength(32)
                .setStyle(TextInputStyle.Short);

                const act = new TextInputBuilder()
                .setCustomId(`announce-act`)
                .setLabel(`Активність гільдії`)
                .setPlaceholder('PVP, PVE або PVP/PVE')
                .setRequired(true)
                .setMaxLength(7)
                .setStyle(TextInputStyle.Short);

                const desc = new TextInputBuilder()
                .setCustomId(`announce-desc`)
                .setLabel(`Опис гільдії`)
                .setPlaceholder('Опишіть гільдію')
                .setRequired(true)
                .setMinLength(60)
                .setMaxLength(600)
                .setStyle(TextInputStyle.Paragraph);

                const req = new TextInputBuilder()
                .setCustomId(`announce-req`)
                .setLabel(`Вимоги до кандидатів`)
                .setPlaceholder('Напишіть свої вимоги для майбутніх учасників гільдії')
                .setRequired(true)
                .setMinLength(40)
                .setMaxLength(400)
                .setStyle(TextInputStyle.Paragraph);

                const mname = new ActionRowBuilder().addComponents(name);
                const mact = new ActionRowBuilder().addComponents(act);
                const mdesc = new ActionRowBuilder().addComponents(desc);
                const mreq = new ActionRowBuilder().addComponents(req);

                modal.addComponents(mname, mact, mdesc, mreq);

                return interaction.showModal(modal)
            } else {
                const db = await guildanns.findOne({Author: interaction.user.id})
                await guildanns.deleteMany({Author: interaction.user.id})

                if (!db) {
                    return interaction.reply({content: `> У вас немає оголошення`, ephemeral: true})
                }

                try {
                    const forum = interaction.guild.channels.cache.get(cfg.channels.guildforum);
                    const thr_id = db.Thread
                    const thr = forum.threads.cache.get(`${thr_id}`)
                    thr.delete()
                } catch (error) {
                    console.log(error)
                    return interaction.reply({content: `> Сталась помилка`, ephemeral: true})
                }
                
                return interaction.reply({content: `> Оголошення було успішно видалено`, ephemeral: true})
            }
        } else if (interaction.isModalSubmit()) {
            const char = interaction.customId.split('-');
            if (char[0] !== 'announce') return;
            const forum = interaction.guild.channels.cache.get(cfg.channels.guildforum);

            await interaction.deferReply({ephemeral: true});

            const name = interaction.fields.getTextInputValue("announce-name").toUpperCase();
            const act = interaction.fields.getTextInputValue("announce-act").toUpperCase();
            const desc = interaction.fields.getTextInputValue("announce-desc");
            const req = interaction.fields.getTextInputValue("announce-req");

            const embed = new EmbedBuilder()
            .setColor('#fb8445')
            .setTitle(name)
            .setDescription(`Шановні пірати та піратесси!\nЗапрошуємо вас до гільдії **${name}!**\n**Власник:** ${interaction.user}\n**Активність:** ${act}\n\n**Опис гільдії:**\n${desc}\n\n**Вимоги до учасників:**\n${req}`)
            .setImage(cfg.image.embedbar)
            .setFooter({iconURL: `${interaction.user.displayAvatarURL()}`, text: `${interaction.user.username}`})
            .setTimestamp()

            const db = await guildanns.findOne({Author: interaction.user.id})

            if (db) {
                let msgs
                const thr_id = db.Thread
                const thr = forum.threads.cache.get(`${thr_id}`)

                if (thr) {
                    const msg = await thr.messages.fetch(db.Message)
                    await msg.edit({embeds: [embed]})

                    const startmsg = await thr.fetchStarterMessage()
                    await startmsg.edit({content: `👇${name}👇`})
                    await thr.setName(`${name}`)
    
                    await interaction.editReply({content: `Оголошення було успішно змінене`}); 
                    return;
                }
            } 

            await guildanns.deleteMany({Author: interaction.user.id})

            let msg_id
            const thr = await forum.threads.create({
                name: name,
                autoArchiveDuration: 60,
                message: {content: `👇${name}👇`}
            }).then(async t => msg_id = await t.send({embeds: [embed]}))

            

            await guildanns.create({
                Author: interaction.user.id,
                Thread: thr.channel.id,
                Message: msg_id.id
            })

            await interaction.editReply({content: `Оголошення ${thr} було створене успішно`});
            
            return;
        } else return;
    }
}