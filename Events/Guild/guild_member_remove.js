const { EmbedBuilder, Events } = require('discord.js');
const savedRoles = require("../../Models/saveRoleModel");
const { model, Schema } = require("mongoose");


module.exports = {
    name: Events.GuildMemberRemove,

    async execute(member) {
        const roles = member.roles.cache.map(role => role.id);
        if(!roles[2]) return;
        await savedRoles.deleteMany({Member: member.id}).then((data, err) => {
            if (err) console.log(err)
        })
        await savedRoles.create({
            Member: member.id,
            Nickname: member.user.tag,
            Roles: roles.toString(),
        })
    }
}