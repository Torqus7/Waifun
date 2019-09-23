const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    let user = await bot.userinventories.findOne({ userID: message.author.id });
    newSpawns = user.get('spawnUses') + 4;
    await bot.userinventories.updateOne({ userID: message.author.id }, 
        { $set: 
            { 
                spawnUses: newSpawns
            }
        })
    message.reply("You got +4 'spawn' uses!")
}