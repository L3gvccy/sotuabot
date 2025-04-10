const { Events } = require('discord.js');
const savedRoles = require("../../Models/saveRoleModel");
const cfg = require('../../config.json');
const tool = require('../../tools')
const { model, Schema } = require("mongoose");

module.exports = {
    name: Events.GuildMemberAdd,

    async execute(member) {
        await setTimeout(() => {
            member.roles.add(member.guild.roles.cache.get(cfg.roles.newbie))
        }, 5000);
        savedRoles.findOne({Member: member.id}).then(async (data) => {
            if (!data) return;

            const roles = data.Roles;
            const rolesArray = roles.split(',')

            await rolesArray.forEach(async roleid => {
                if (roleid === '1074377830852481024'
                || roleid === cfg.roles.owner
                || roleid === cfg.roles.head_admin
                || roleid === cfg.roles.admin
                || roleid === '1070779802828673096'
                || roleid === cfg.roles.instructor
                || roleid === cfg.roles.raid_leader
                || roleid === cfg.roles.raider
                || roleid === cfg.guildid) return;

                const role = member.guild.roles.cache.get(roleid);

                member.roles.add(role).catch((e) => null)

            });

            await savedRoles.deleteMany({Member: member.id});

            await setTimeout(() => {
                if(member.roles.cache.has(cfg.roles.pirate_1)
                || member.roles.cache.has(cfg.roles.pirate_2)
                || member.roles.cache.has(cfg.roles.pirate_3)
                || member.roles.cache.has(cfg.roles.pirate_4)) {
                const newbieRole = member.guild.roles.cache.get(cfg.roles.newbie)
                member.roles.remove(newbieRole)
            }
            }, 10000);
            
        })

        // const chnl = await member.guild.channels.cache.get(cfg.channels.test)
        // const file = await tool.serverBoost(member.user)
        // await chnl.send({files: [file]})
    }

}