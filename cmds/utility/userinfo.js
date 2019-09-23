const Discord = module.require("discord.js");

module.exports.run = async (bot, message, args) => {
    if(args[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}userinfo | to check your info\n${bot.prefix}userinfo @name | to check someone else's info`);
    }
    if(args.length >= 1){
        if(!message.mentions.users.first()){
            message.channel.send("Can't find user");
        }else{
            let embed = new Discord.RichEmbed()
                .setAuthor(message.mentions.users.first().username)
                .setThumbnail(`${message.mentions.users.first().displayAvatarURL}`)
                .setDescription("This is the user's info!")
                .setColor("#72a4f4")
                .addField("Full Username", `${message.mentions.users.first().username}#${message.mentions.users.first().discriminator}`)
                .addField("ID", message.mentions.users.first().id)
                .addField("Created At", message.mentions.users.first().createdAt);
            message.channel.send(embed);
        }
            
    }else{
        let embed = new Discord.RichEmbed()
            .setAuthor(message.author.username)
            .setThumbnail(`${message.author.displayAvatarURL}`)
            .setDescription("This is the user's info!")
            .setColor("#42a4f4")
            .addField("Full Username", `${message.author.username}#${message.author.discriminator}`)
            .addField("ID", message.author.id)
            .addField("Created At", message.author.createdAt);
        message.channel.send(embed);
        return;
    }
    
}

module.exports.config = {
    name: "userinfo",
    aliases: ["ui", "uinfo", "usrinf"]
}