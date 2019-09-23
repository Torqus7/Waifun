const Discord = require("discord.js");
const fs = require("fs");

module.exports.run = async (bot, message, args) => {

    // NEED TO IMPLEMENT PER SERVER PREFIX IN INDEX

    if(!message.member.hasPermission("MANAGE_SERVER")) return message.reply("You don't have the required permission to change the prefix.");
    if(args[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}prefix <desired prefix> | to change the current prefix of the server`);
    }

    if(args.length > 1){
        return message.reply("Only 1 word or character can be used as a prefix (Can't use spaces).");
    }else if(args.length > 0){
        let newPrefix = args.join(" ").toLowerCase();
        // Update this guild prefix
        await bot.guildsettings.updateOne({ guildID: message.guild.id }, 
        { $set: 
            {
                prefix: newPrefix
            }
        })
    
        let guilds = await bot.guildsettings.find();
        guilds.forEach(guild => {
            bot.guildPrefix[guild.guildID] = guild.get('prefix');
        });

        let embed = new Discord.RichEmbed()
            .setColor(bot.colors.Green)
            .setTitle("Prefix Set!")
            .setDescription(`Set to ${newPrefix}`)
        message.channel.send(embed);
        return;
    }else{
        // Get this guild prefix
        prefix = bot.guildPrefix[message.guild.id];
        let embed = new Discord.RichEmbed()
        .setColor(bot.colors.Green)
        .setTitle("Prefix")
        .setDescription(`Current prefix is ${prefix}`)
        message.channel.send(embed);
    }
}

module.exports.config = {
    name: "prefix",
    aliases: []
}