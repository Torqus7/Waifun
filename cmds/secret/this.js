module.exports.run = async (bot, message, args) => {
    if(args[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}this | to say something epic`);
    }
        await message.delete();
        message.channel.send("this is epic");
}

module.exports.config = {
    name: "this",
    aliases: []
}