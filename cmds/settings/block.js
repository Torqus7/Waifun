const Discord = require("discord.js");
const fs = require("fs");

module.exports.run = async (bot, message, args) => { 

////////\n///////////////////////////////////////////////////////////////////////////////////////////////////

if(!message.member.hasPermission("MANAGE_SERVER")) return message.reply("You don't have the required permission to change the default channel.");
if(args[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}block this | to block this channel from the bot\n${bot.prefix}block remove | to remove the block from this channel`);
    }

    if(args[0] === "this"){
        if(bot.guildBlocked[message.guild.id].includes(message.channel.id)) return message.reply("This channel is already blocked");
        await bot.guildsettings.updateOne({ guildID: message.guild.id }, 
        { $push: 
            { 
                blocked: message.channel.id
            }
        })
        
        let guilds = await bot.guildsettings.find();
        guilds.forEach(guild => {
            bot.guildBlocked[guild.guildID] = guild.get('blocked');
        });

        // Send notification of changed channel
        return message.reply(`${message.channel.name} is now blocked.`)
    }
    else if(args[0] === "remove"){
        await bot.guildsettings.updateOne({ guildID: message.guild.id }, 
        { $pull: 
            { 
                blocked: message.channel.id
            }
        })

        let guilds = await bot.guildsettings.find();
        guilds.forEach(guild => {
            bot.guildBlocked[guild.guildID] = guild.get('blocked');
        });
        
        // Send notification of changed channel
        return message.reply(`${message.channel.name} is not blocked anymore.`)
    }
    else return message.reply (`Usage: ${bot.prefix}block this | to block this channel from the bot\n${bot.prefix}block remove | to remove the block from this channel`);

    // // Get guild ID from db
    // let guild = await bot.guildsettings.findOne({ guildID: message.guild.id });
    // let currentChannel = "";
    // let currentChannelName = "";
    // // Get the info of the channel
    // currentChannel = guild.get('channel');
    // currentChannelName = message.guild.channels.get(currentChannel).name;
    // // Send name of default channel
    // message.reply(`Default channel is: ${currentChannelName}`)
}

module.exports.config = {
    name: "block",
    aliases: []
}