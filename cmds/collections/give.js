const Discord = require("discord.js");
const mongoose = require("mongoose");
const stringSimilarity = require('string-similarity');

module.exports.run = async (bot, message, args) => {

    if(args.length < 1 || args[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}give @user | to make someone very happy.`);
    }

    // Check if user mentioned another user
    let gifted = message.mentions.users.first();
    if(!gifted) return message.reply (`You have to mention the user you want to give the character to.\nUsage: ${bot.prefix}give @user <character> | to make someone very happy.`);
    
    // Check if user mentioned itself :|
    if(gifted.id === message.author.id) return message.reply('Come one you silly, what are you trying to do with yourself?')
    
    // Get name of char from args
    let arg = args.slice(1);
    let charName = "";
    await arg.forEach(argument => {
        if(charName) charName += " ";
        charName += argument;
    });
    
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
    
    // Check if the GIFTED has an inventory and has the character
    let giftedUser = await bot.userinventories.findOne({ userID: gifted.id });
    if(giftedUser){
        charactersGifted = giftedUser.get('characters');
        checkGifted = await charactersGifted.filter(chara => chara.name === char.get('name'));
        if(checkGifted.length > 0) return message.reply(`**${gifted}** already has **${char.get('name')}**.`)
    }
    
    // let isGolden = chara.get('golden')

    // Confirm if the character will be given
    let msg = await message.channel.send(`**${gifted}**, **${message.author}** wants to give you **${char.get('name')}**. Do you accept?`);
    await msg.react('✅');
    await msg.react('✖');
    
    const send = (reaction, user) => { return reaction.emoji.name === '✅' && user.id === gifted.id};
    const close = (reaction, user) => { return reaction.emoji.name === '✖' && user.id === gifted.id};
    
    const collectorSend = msg.createReactionCollector(send, {max: 1, maxEmojis: 1, time: 30000});
    const collectorClose = msg.createReactionCollector(close, {max: 1, maxEmojis: 1, time: 30000});
    
    collectorSend.on('collect', async (reaction, reactionCollector) => {
        // If gifted doesn't have an inventory, create it
        if(!giftedUser){
            date = new Date();
            date.setHours(date.getHours() - 13);
            newUser = new bot.userinventories({
                _id: mongoose.Types.ObjectId(),
                userID: message.author.id,
                getUses: 1,
                spawnUses: 10,
                sleeves: 1,
                goldSleeves: 0,
                voteTime: date,
                voteUses: false,
                patreon: false,
                patreonBonuses: 0,
                leveling: "None"
            });
            await newUser.save();
            message.channel.send(`**${gifted}**, Welcome to Waifun! You got a free extra **Sleeve**, use Sleeves to catch characters you want, you get Sleeves by either using 'claim' every 3 hours or grabbing them when they randomly drop. You can now start using 'claim' to get your Sleeves and 'spawn' to spawn a random character, object or event. Good Luck!`)
        }
        // Add character to gifted inventory
        let character = new Map();
        character.set('name', checkUser[0].name)
        character.set('mainPic', checkUser[0].mainPic)
        character.set('isGolden', checkUser[0].isGolden);
        character.set('exp', checkUser[0].exp);
        await bot.userinventories.updateOne({ userID: gifted.id }, 
            { $push: 
                { 
                characters: character
                }
            })
        // Remvoe character from user inventory
        await bot.userinventories.updateOne({ userID: message.author.id }, 
            { $pull: 
                { 
                characters: checkUser[0]
                }
            })
        // If character was being leveled, change stuff in userinventory
        if(user.leveling && user.leveling == char.get('name')){
            await bot.userinventories.updateOne({ userID: message.author.id }, 
                { $set: 
                    { 
                        leveling: "None"
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
        message.channel.send(`**${message.author}** gave **${char.get('name')}** to **${gifted}**`)
    });    

    collectorClose.on('collect', async (reaction, reactionCollector) => {
        msg.delete();
        message.reply(`**${gifted}** didn't accept your gift.`)
    });
}

module.exports.config = {
    name: "give",
    aliases: []
}