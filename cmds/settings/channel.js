const Discord = require("discord.js");
const fs = require("fs");

module.exports.run = async (bot, message, args) => { 

////////\n///////////////////////////////////////////////////////////////////////////////////////////////////

if(!message.member.hasPermission("MANAGE_SERVER")) return message.reply("You don't have the required permission to change the default channel.");
if(args[0] == "help") {
        return message.reply (`Usage: \n${bot.prefix}channel | to get the name of the default channel\n${bot.prefix}channel set | to change the default channel to the current one`);
    }

    if(args[0] === "set"){
        await bot.guildsettings.updateOne({ guildID: message.guild.id }, 
        { $set: 
            { 
                channel: message.channel.id
            }
        })
        // Send notification of changed channel
        return message.reply(`Default channel is now: ${message.channel.name}`)
    }

    // Get guild ID from db
    let guild = await bot.guildsettings.findOne({ guildID: message.guild.id });
    let currentChannel = "";
    let currentChannelName = "";
    // Get the info of the channel
    currentChannel = guild.get('channel');
    currentChannelName = message.guild.channels.get(currentChannel).name;
    // Send name of default channel
    message.reply(`Default channel is: ${currentChannelName}`)
}

module.exports.config = {
    name: "channel",
    aliases: []
}