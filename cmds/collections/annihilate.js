const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {

    // return message.channel.send("This command is disabled until there are enough characters");

    if(args.length > 1 || args[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}annihilate | to remove all of the characters from your collection.\n${bot.prefix}annihilate <amount> | to remove random characters up to the selected amount from your collection.`);
    }

    // Get all characters from user
    let user = await bot.userinventories.findOne({ userID: message.author.id });
    characters = user.get('characters');
    // If amount was selected, act upon that
    if(args.length > 0) return;

    // else

    // Confirm if the character will be deleted
    let msg = await message.reply(`You are about to remove **${characters.length}** characters from your collection, leaving you with none. Are you sure?`);
    await msg.react('✅');
    await msg.react('✖');
    
    const send = (reaction, user) => { return reaction.emoji.name === '✅' && user.id === message.author.id;};
    const close = (reaction, user) => { return reaction.emoji.name === '✖' && user.id === message.author.id;};
    
    const collectorSend = msg.createReactionCollector(send, {max: 1, maxEmojis: 1, time: 20000});
    const collectorClose = msg.createReactionCollector(close, {max: 1, maxEmojis: 1, time: 20000});
    
    collectorSend.on('collect', async (reaction, reactionCollector) => {
        await bot.userinventories.updateOne({ userID: message.author.id }, 
            { $set: 
                { 
                    characters: [],
                    leveling: "None",
                    favorite: "None"
                }
            })
        msg.delete();
        message.reply(`You have commited genocide upon your collection. Congratulations!`)
    });    

    collectorClose.on('collect', async (reaction, reactionCollector) => {
        msg.delete();
    });
}

module.exports.config = {
    name: "annihilate",
    aliases: []
}