const Discord = require("discord.js");
const fs = require("fs");

module.exports.run = async (bot, message, args) => { 

////////\n///////////////////////////////////////////////////////////////////////////////////////////////////

    let link = "https://discordapp.com/oauth2/authorize?client_id=534015346483527691&scope=bot&permissions=519233";

    let embed = await new Discord.RichEmbed()
        .setColor(bot.colors.Green)
        .setTitle("Waifun Links")
        .setDescription(`Invite the bot to your server [here](${link})\nJoin our discord server [here](https://discord.gg/8VkZqsH)\nVote for Waifun [here](https://discordbots.org/bot/534015346483527691/vote)`)
    message.channel.send(embed);
}

module.exports.config = {
    name: "invite",
    aliases: []
}