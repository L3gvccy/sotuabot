const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const cfg = require('../../config.json')
const tool = require('../../tools')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('annonce_raid')
    .setDescription('Annonce raid')
    .addStringOption(option =>
        option.setName('type')
        .setDescription('Оберіть тип рейду')
        .setRequired(true)
        .setChoices(
            {name: `Емісарський`, value: `emissary`},
            {name: `Мега-рейд`, value: `meg`},
            {name: `Ком'юніті дей`, value: `communityday`},
            {name: `Афіна або ріпери`, value: `aor`},
        )
        )
    .addStringOption(option =>
        option.setName('day')
        .setDescription('Введіть дату в форматі dd.mm.yyyy')
        .setRequired(true)
        )
    .addStringOption(option =>
        option.setName('time')
        .setDescription('Введіть час в форматі hh:ss')
        .setRequired(true)
        )
    .addStringOption(option =>
        option.setName('color')
        .setDescription('Введіть колір в hex форматі')
        .setRequired(false)
        ),

    async execute(interaction) {
        if (!tool.isadmin(interaction.member) && !tool.israidleader(interaction.member)) {
            return interaction.reply({content: cfg.phrases.missingperms, ephemeral: true})
        }
        const {options} = interaction
        const day = options.getString('day').split('.')
        const time = options.getString('time')
        const date = Date.parse(`${day[2]}-${day[1]}-${day[0]}T${time}:00`)

        const embed = new EmbedBuilder()
        .setTitle('Оголошення Рейду!')
        .setDescription(`**Вітаємо вас!**
        _Ми пропонуємо вам долучитися до рейду, який відбудеться <t:${Math.floor(new Date(date)/1000)}>._
        _Трошки нижче ви можете почитати більше про цей рейд, а зараз, будь ласка, поставте реакцію під цим повідомленням, якщо ви маєте намір прийти на цей рейд._
        👇`)
        .setFooter({text: `${interaction.user.username}`, iconURL: `${interaction.user.displayAvatarURL()}`})
        .setTimestamp()

        const btn = new ActionRowBuilder().setComponents(
            new ButtonBuilder().setCustomId('annonce-confirm').setLabel('Відправити').setEmoji('✔️').setStyle(ButtonStyle.Success)
        )

        switch (options.getString('type')) {
            case 'aor':
                embed.setImage(cfg.image.raid.aor)
                .setFields(
                    {name: `Афіна або Ріпери`, value: `Ми пропонуємо вам обрати між цими двома рейдами. Зауважте, що ці рейди доволі різні за своїм сенсом.
                    __**Рейд Ріперів**__ потрібен для заробітку великої кількості золота та частково для підняття максимального рівня у цій фракції.
                    __**Рейд Афіни**__ цікавить більше людей для підвищення рівня фракції Скарби Афіни та для здобуття усіх досягнень у цій фракції.`},
                    {name: `Emoji`, value: `emissary_legends,emissary_reaper`}
                )
                break;
            case 'communityday':
                embed.setImage(cfg.image.raid.community)
                .setFields(
                    {name: `Ріпери`, value: `__**Рейд Ріперів**__ потрібен для заробітку великої кількості золота та частково для підняття максимального рівня у цій фракції.`},
                    {name: `Emoji`, value: `emissary_reaper`}
                )
                break;
            case 'meg':
                embed.setImage(cfg.image.raid.meg)
                .setFields(
                    {name: `Прихована душа`, value: `_Попереджаємо вас відразу, цей рейд не підходить для більшості новачків!_
                    Під час рейду, гравці повинні будуть виплести у відкрите море та стати один біля одного сформував коло, після чого починається найцікавіша частина - очікування...
                    Поки не заспалась рибка, ви можете відпочити та закинути вудочку...`},
                    {name: `Emoji`, value: `shark1`}
                )
                break;
            case 'emissary':
                embed.setImage(cfg.image.raid.emissary)
                .setFields(
                    {name: `Емісарство`, value: `Ми не будемо обмежувати вас у виборі конкретної емісарської компанії, бо саме цей рейд пропонує вам плавати під будь-яким прапором та виконувати фактично будь-яку активність.
                    Мета рейду - підняття репутації різних фракцій та набиття рахунку емісарства.`},
                    {name: `Emoji`, value: `flag_union`}
                )
                break;
        }

        if (options.getString('color') && tool.ishexclr(options.getString('color'))) {
            embed.setColor(`${options.getString('color')}`)
        } else {
            embed.setColor(cfg.color.aqua)
        }

        return interaction.reply({embeds: [embed],components: [btn], ephemeral: true})
    }
}