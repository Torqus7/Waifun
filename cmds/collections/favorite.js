const Discord = require("discord.js");
const stringSimilarity = require('string-similarity');

module.exports.run = async (bot, message, args) => {

    // return message.channel.send("This command is disabled until there are enough characters");

    if(args[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}favorite <character> | to mark a character as your favorite, appearing as the thumbnail in your collection.\nTo set favorite to None use: ${bot.prefix}fav none`);
    }
    if(args.length > 0 && args[0].toLowerCase() == "none"){
        // Change favorite to none
        await bot.userinventories.updateOne({ userID: message.author.id }, 
            { $set: 
                { 
                    favorite: "None",
                }
            })
        message.reply(`You don't have a favorite character anymore.`);
    }
    else if(args.length < 1){
        // Check which character is in favorite
        let user = await bot.userinventories.findOne({ userID: message.author.id });
        if(!user.get('favorite') || user.get('favorite') == "None") return message.reply(`You don't have a favorite character, use ${bot.prefix}fav <name> to favorite a character.`)
        return message.reply(`Your favorite character is **${user.get('favorite')}**`);
    }else{
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
        check = charactersUser.filter(chara => chara.name === char.get('name'));
        if(check.length < 1) return message.reply(`You don't have **${char.get('name')}**.`)
    
        // Set favorite character
        await bot.userinventories.updateOne({ userID: message.author.id }, 
            { $set: 
                { 
                    favorite: check[0].name,
                }
            })
        message.reply(`Your favorite character is now **${check[0].name}**`);
    }
}

module.exports.config = {
    name: "favorite",
    aliases: ["fav"]
}