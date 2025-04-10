const { AttachmentBuilder } = require('discord.js')
const cfg = require('./config.json')
const Canvas = require('canvas')


const hasrole = (user, role) => {
    if(!user.guild.roles.cache.get(role)) return false;
    return user.roles.cache.has(role)
}

function isadmin(member) {
    if(hasrole(member, cfg.roles.owner) || hasrole(member, cfg.roles.admin) || hasrole(member, cfg.roles.head_admin)) {
        return true
    } else return false;
}

function israidleader(member) {
    if(hasrole(member, cfg.roles.raid_leader) || hasrole(member, cfg.roles.instructor)) {
        return true
    } else return false; 
}

function ishexclr (hex) {
    if(/^#[0-9A-F]{6}$/i.test(hex))
        return true;
    return false;
}

async function serverBoost(user) {
    const canvas = Canvas.createCanvas(500, 280)
    const ctx = canvas.getContext('2d')

    const avatar = await Canvas.loadImage(user.displayAvatarURL({extension: "png"}))

    const bg = await Canvas.loadImage('https://i.postimg.cc/BbQpQsxR/gif2.gif')

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

    ctx.beginPath();
    ctx.arc(253, 140, 71, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.save();
    ctx.clip();
    ctx.drawImage(avatar, 182, 69, 142, 142)
    ctx.restore;

    return new AttachmentBuilder(canvas.toBuffer(), 'img.gif')
}

async function drawRep(user, rep, desc, ttl) {
    const canvas = Canvas.createCanvas(1600, 2200)
    const ctx = canvas.getContext('2d')

    const avatar = await Canvas.loadImage(user.displayAvatarURL({extension: "png"}))

    const bg = await Canvas.loadImage(cfg.rep.bg[desc])
    const add = await Canvas.loadImage(cfg.rep.add[desc])

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

    ctx.beginPath();
    ctx.arc(810, 1000, 250, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.save();
    ctx.clip(); 
    ctx.drawImage(avatar, 550, 750, 500, 500);
    ctx.restore();

    ctx.drawImage(add, 0, 0, canvas.width, canvas.height)

    ctx.font = '145px Book Antiqua'
    ctx.textAlign = "center"; 
    ctx.fillStyle = "#E9E3D0";
    ctx.fillText(`${user.username.length > 16 ? user.username.slice(0,16) : user.username}`, 800, 1660)

    ctx.font = '75px Book Antiqua'
    ctx.textAlign = "center"; 
    ctx.fillStyle = "#000000";
    ctx.fillText(rep, 800, 1250)

    cfg.rep.title[ttl].length > 14 ? ctx.font = '60px Book Antiqua' : ctx.font = '70px Book Antiqua'
    ctx.textAlign = "center"; 
    ctx.fillStyle = "#E9E3D0";
    ctx.fillText(cfg.rep.title[ttl], 800, 1780)

    return new AttachmentBuilder(canvas.toBuffer());
} 

async function editinv(client, state) {
    if(!client.chats.get(`${state.channelId}_inv`) || !state.channel){
        return;
    }
    const message = await state.guild.channels.cache.get(cfg.channels.invite).messages.cache.get(client.chats.get(`${state.channelId}_inv`));
    if(!message)
        return;
    const n_mbed = message.embeds[0];
    n_mbed.fields[2] = {
        name: `Екіпаж:`,
        value: `${state.channel.members.size}/${state.channel.userLimit}`,
        inline:true
    }
    try {
        await message.edit({embeds: [n_mbed]});
    } catch (error) {
        if (error) return;
    }
}

module.exports = {
    hasrole, isadmin, israidleader, ishexclr, editinv, drawRep, serverBoost
}