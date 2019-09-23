const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {

    // return message.channel.send("This command is disabled until there are enough characters");

    if(args.length > 0 || args[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}delete | to delete your inventory\nThis command will not be available later on as it is only here to be used in case there is a bug in your inventory and you can't contact an admin on the official server.`);
    }
    // Confirm if the character will be deleted
    let msg = await message.reply(`You are about to completely delete your inventory, removing all characters from your collection, sleeves, objects, stats, and everything else. Are you sure?`);
    await msg.react('✅');
    await msg.react('✖');
    
    const send = (reaction, user) => { return reaction.emoji.name === '✅' && user.id === message.author.id;};
    const close = (reaction, user) => { return reaction.emoji.name === '✖' && user.id === message.author.id;};
    
    const collectorSend = msg.createReactionCollector(send, {max: 1, maxEmojis: 1, time: 20000});
    const collectorClose = msg.createReactionCollector(close, {max: 1, maxEmojis: 1, time: 20000});
    
    collectorSend.on('collect', async (reaction, reactionCollector) => {
        await bot.userinventories.findOneAndDelete({ userID: message.author.id });
        message.reply(`You have deleted your inventory.`)
    });    

    collectorClose.on('collect', async (reaction, reactionCollector) => {
        msg.delete();
    });
}

module.exports.config = {
    name: "delete",
    aliases: []
}