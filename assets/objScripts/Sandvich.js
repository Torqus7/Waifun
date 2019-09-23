const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    await bot.userinventories.updateOne({ userID: message.author.id }, 
        { $set: 
            { 
                spawnUses: 6
            }
        })
    message.reply("Your 'spawn' uses were reset!")
}