const Discord = require("discord.js");
const snekfetch = require('snekfetch');
module.exports.run = async (bot, message, args) => {
    const res = await snekfetch.get('https://nekos.life/api/lizard');
    const image = res.body.url
    // Send result
    let embed = new Discord.RichEmbed()        
        .setColor(bot.colors.Green)
        .setTitle(`**${message.author.username}**'s Random Lizard`)
        .setImage(image);
    let msg = await message.channel.send(embed);
}

module.exports.config = {
    name: "lizard",
    aliases: ["lizzie", "liz"]
}