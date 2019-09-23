const Discord = require("discord.js");
const stringSimilarity = require('string-similarity');

module.exports.run = async (bot, message, args) => {

    // return message.channel.send("This command is disabled until there are enough characters");

    if(args.length < 1 || args[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}burn <character> | to remove a character from your collection.`);
    }

    // Get character name
    let charName = args.join(" ");

    // Find best math and check if character exists
    let names = [];
    // Escape all characters inside the variable
    charName = charName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    let regexp = new RegExp(charName, "i");
    // Find all characters matching regexp
    let char = await bot.characters.find({ name: regexp });
    if (char.length < 1) return message.reply(`Couldn't find character: **${charName}**.`);
    await char.forEach(chara => names.push(chara.name));
    // Compare user input and gotten characters to get best match
    let match = await stringSimilarity.findBestMatch(charName, names);
    char = await bot.characters.findOne({name: match.bestMatch.target});

    // Check if the user has the character
    let user = await bot.userinventories.findOne({ userID: message.author.id });
    charactersUser = user.get('characters');
    checkUser = charactersUser.filter(chara => chara.name === char.get('name'));
    if(checkUser.length < 1) return message.reply(`You don't have **${char.get('name')}**.`)

    // Confirm if the character will be deleted
    let msg = await message.reply(`You are about to remove **${char.get('name')}** from your collection. Are you sure?`);
    await msg.react('✅');
    await msg.react('✖');
    
    const send = (reaction, user) => { return reaction.emoji.name === '✅' && user.id === message.author.id;};
    const close = (reaction, user) => { return reaction.emoji.name === '✖' && user.id === message.author.id;};
    
    const collectorSend = msg.createReactionCollector(send, {max: 1, maxEmojis: 1, time: 20000});
    const collectorClose = msg.createReactionCollector(close, {max: 1, maxEmojis: 1, time: 20000});
    
    collectorSend.on('collect', async (reaction, reactionCollector) => {
        await bot.userinventories.updateOne({ userID: message.author.id }, 
            { $pull: 
                { 
                characters: { name: char.get('name') }
                }
            })
        // If character was being leveled, change stuff in userinventory
        if(user.leveling == char.get('name')){
            await bot.userinventories.updateOne({ userID: message.author.id }, 
                { $set: 
                    { 
                        leveling: "None",
                    }
                })
        }
        // If character was favorited, change stuff in userinventory
        if(user.favorite == char.get('name')){
            await bot.userinventories.updateOne({ userID: message.author.id }, 
                { $set: 
                    { 
                        favorite: "None"
                    }
                })
        }
        msg.delete();
        message.reply(`You no longer have **${char.get('name')}** in your collection.`)
    });    

    collectorClose.on('collect', async (reaction, reactionCollector) => {
        msg.delete();
    });
}

module.exports.config = {
    name: "burn",
    aliases: []
}