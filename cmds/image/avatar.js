module.exports.run = async (bot, message, args) => {

    if(args[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}avatar | to get your avatar pic\n${bot.prefix}avatar @name to get someone's avatar pic`);
    }
    if(args.length >= 1){
        if(!message.mentions.users.first()){
            message.channel.send("Can't find user. Use @ to find it.");
        }else{
            message.channel.send({files:[
            {
                attachment: message.mentions.users.first().displayAvatarURL,
                name: "avatar.png"
            }
            ]})
        }
    }else{
        message.channel.send({files:[
            {
                attachment: message.author.displayAvatarURL,
                name: "avatar.png"
            }
            ]})
    }
}

module.exports.config = {
    name: "avatar",
    aliases: ["av", "pic", "prof"]
}