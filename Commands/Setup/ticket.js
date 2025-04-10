const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js')
const cfg = require('../../config.json')
const tool = require('../../tools')


module.exports = {
    data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Create ticket'),

    async execute(interaction, client) {
        if(!tool.isadmin(interaction.member)) {
            return interaction.reply({content: cfg.phrases.missingperms, ephemeral: true})
        }

        const embed = new EmbedBuilder()
        .setColor('#70EAD6')
        .setTitle('Створення Тікетів')
        .setDescription('**Вітаємо вас, та представляємо вашій увазі систему тікетів!**\nЗа допомогою цих самих тікетів, ви можете: запропонувати нові ідеї, подати скаргу чи надіслати запит на особливу роль. \nНижче ви можете побачити перелік всіх ролей, на які ви можете подати запит, та що для цього необхідно.')
        .addFields(  
            { 
                name: 'Перелік ролей\n ', 
                value: `${interaction.guild.roles.cache.get('1004142388039663718')} \n \n${interaction.guild.roles.cache.get('1004142674791632977')} \n${interaction.guild.roles.cache.get('1004142845311078420')} \n${interaction.guild.roles.cache.get('1132010448003268668')} \n${interaction.guild.roles.cache.get('1004142231600504912')}\n ${interaction.guild.roles.cache.get('980454406006906890')} \n${interaction.guild.roles.cache.get('1081350250574381096')} \n \n${interaction.guild.roles.cache.get('1081351522677440582')}`, 
                inline: true
            },
            {
                name: '឵Вимоги для отримання\n ', 
                value: `Володіти титулом "Славетний морський вовк" або "Капітан Срібних Морів" \nВиконати всі тейли на 100% \nПрокачати до максимума всі компанії \nМати всі досягнення братства мисливців \nМати титул "Легендарний пірат" \nБути дівчиною \nДосягнути позначку у 100 рівнів фракції "Вартові Афіни" \nДосягнути позначку у 100 рівнів фракції "Поплічники Полум'я"`, 
                inline: true
            }
        )
        .setTimestamp();

        const selector = new ActionRowBuilder().setComponents(
            new StringSelectMenuBuilder()
            .setCustomId('create_ticket')
            .setPlaceholder('Nothing selected')
            .addOptions(
                {
                    label: '🎫 Пропозиція',
                    description: 'Створення тікету-пропозиції.',
                    value: 'ticket_propos',
                },
                {
                    label: '🎫 Скарга',
                    description: 'Створення скарги на певних учасників діскород сервера.',
                    value: 'ticket_pen',
                },
                {
                    label: '🎫 Роль',
                    description: 'Створення запиту на особливу роль.',
                    value: 'ticket_role',
                },
                {
                    label: '🎫 Каперство',
                    description: 'Створення запиту на Каперство.',
                    value: 'ticket_raid',
                },
                {
                    label: '🎫 Приватний флот',
                    description: 'Створення запиту на створення приватного флоту.',
                    value: 'ticket_prvoice',
                },
            ),
        )

        await interaction.channel.send({
            embeds: [embed],
            components: [selector]
        })

        return interaction.reply({content: `> Тікети було встановлено`, ephemeral: true})
    }
}