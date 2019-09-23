const Discord = require("discord.js");
const stringSimilarity = require('string-similarity');

module.exports.run = async (bot, message, args) => {

    // return message.channel.send("This command is disabled until there are enough characters");

    if(args.length < 1 || args[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}trade @<name> | to begin trade with another user.`);
    }
    
    // Check if user mentioned another user
    let traded = message.mentions.users.first();
    if(!traded) return message.reply (`You have to mention the user you want to give the character to.\nUsage: ${bot.prefix}give @user <character> | to make someone very happy.`);
    
    // Check if user mentioned itself :|
    if(traded.id === message.author.id) return message.reply('Come one you silly, what are you trying to do with yourself?')

    let trader = message.mentions.users.first();

    // Get users inventories
    let authorInv = await bot.userinventories.findOne({ userID: message.author.id });
    if(!authorInv) return message.reply("You don't have an inventory, use 'spawn' or 'claim' to automatically create one and use this command.")
    let traderInv = await bot.userinventories.findOne({ userID: trader.id });
    if(!traderInv) return message.reply(`${trader} doesn't have an inventory, encourage them to start playing by using 'claim' and 'spawn'.`)

    // Send message alerting trade
    startTradeMsg = await message.channel.send(`**${trader}**, **${message.author.username}** wants to trade with you. Do you accept?`);
    await startTradeMsg.react('✅');
    await startTradeMsg.react('✖');
    
    const accept = (reaction, user) => { return reaction.emoji.name === '✅' && user.id === trader.id};
    const close = (reaction, user) => { return reaction.emoji.name === '✖' && user.id === message.author.id || user.id === trader.id};
    
    const collectorAccept = startTradeMsg.createReactionCollector(accept, {max: 1, maxEmojis: 1, time: 60000});
    const collectorClose = startTradeMsg.createReactionCollector(close, {max: 4, maxEmojis: 4, time: 60000});
    const authorFilter = m => m.author.id === message.author.id;
    const traderFilter = m => m.author.id === trader.id;

    collectorAccept.on('collect', async (reaction, reactionCollector) => {

        let authorOffer = "";
        let traderOffer = "";
        let confirms = 0;

        let embed = new Discord.RichEmbed()
        .setColor(bot.colors.Yellow)
        .setTitle(`${message.author.username} and ${trader.username} are trading.`)
        .setDescription("Type in chat the name of the character you wish to offer")
        .addField(message.author.username, `\`\`\` \`\`\``, false)
        .addField(trader.username, `\`\`\` \`\`\``, false)
        .setFooter(`Trade can't continue until both parties offer a character.\nOffer characters and click the tick to accept.`);
        let msg = await message.channel.send(embed);

        await msg.react('✅');

        let tradeEnded = false;
        let authorChar;
        let traderChar;

        message.channel.awaitMessages(authorFilter, {max: 1, time: 20000})
        .then(async collected => {
            if(tradeEnded) return;
            if(!collected.first()){
                tradeEnded = true;
                return message.channel.send("Trade cancelled. Time expired.")
            }
            // Find best math and check if character exists
            let names = [];
            // Escape all characters inside the variable
            charName = collected.first().content.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
            let regexp = new RegExp(charName, "i");
            // Find all characters matching regexp
            let char = await bot.characters.find({ name: regexp });
            if (char.length < 1){
                tradeEnded = true;
                return message.reply(`Couldn't find character: **${charName}**.\nTrade cancelled.`);
            }
            await char.forEach(chara => names.push(chara.name));
            // Compare user input and gotten characters to get best match
            let match = await stringSimilarity.findBestMatch(charName, names);
            char = await bot.characters.findOne({name: match.bestMatch.target});
            
            // Check if the Author has the character
            charactersAuthor = authorInv.get('characters');
            checkAuthor = charactersAuthor.filter(chara => chara.name === char.get('name'));
            if(checkAuthor.length < 1){
                tradeEnded = true;
                return message.reply(`You don't have **${char.get('name')}**.\nTrade cancelled.`)
            } 
            authorChar = checkAuthor[0];
            
            // Check if the TRADER has the character
            charactersTrader = traderInv.get('characters');
            checkTrader = await charactersTrader.filter(chara => chara.name === char.get('name'));
            if(checkTrader.length > 0){
                tradeEnded = true;
                return message.reply(`**${trader}** already has **${char.get('name')}**.\nTrade cancelled.`)
            }
            embed.fields[0].value =  `\`\`\`CSS\n${char.get('name')}\`\`\``;
            if(traderOffer !== "") embed.setFooter(`Trade Ready! Both users click the tick to confirm trade!`);
            else embed.setFooter(`${message.author.username} added ${char.get('name')}, waiting for ${trader.username} to select a character.`);
            await msg.edit(embed);
            authorOffer = char.get('name');
        })
        .catch(err => {
            console.log(err);
        });
        message.channel.awaitMessages(traderFilter, {max: 1, time: 20000})
        .then(async collected => {
            if(tradeEnded) return;
            if(!collected.first()){
                tradeEnded = true;
                return message.channel.send("Trade cancelled. Time expired.")
            }
            // Find best math and check if character exists
            let names = [];
            // Escape all characters inside the variable
            charName = collected.first().content.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
            let regexp = new RegExp(charName, "i");
            // Find all characters matching regexp
            let char = await bot.characters.find({ name: regexp });
            if (char.length < 1){
                tradeEnded = true;
                return message.reply(`Couldn't find character: **${charName}**.\nTrade cancelled.`);
            }
            await char.forEach(chara => names.push(chara.name));
            // Compare user input and gotten characters to get best match
            let match = await stringSimilarity.findBestMatch(charName, names);
            char = await bot.characters.findOne({name: match.bestMatch.target});
            
            // Check if the TRADER has the character
            charactersTrader = traderInv.get('characters');
            checkTrader = charactersTrader.filter(chara => chara.name === char.get('name'));
            if(checkTrader.length < 1){
                tradeEnded = true;
                return message.channel.send(`${trader}, You don't have **${char.get('name')}**.\nTrade cancelled.`)
            }
            traderChar = checkTrader[0];
            // Check if the author has an inventory and has the character
            charactersAuthor = authorInv.get('characters');
            checkAuthor = await charactersAuthor.filter(chara => chara.name === char.get('name'));
            if(checkAuthor.length > 0){
                tradeEnded = true;
                return message.channel.send(`${trader}, **${message.author}** already has **${char.get('name')}**.\nTrade cancelled.`)
            }
            embed.fields[1].value = `\`\`\`CSS\n${char.get('name')}\`\`\``;
            if(authorOffer !== "") embed.setFooter(`Trade Ready! Both users click the tick to confirm trade!`);
            else embed.setFooter(`${trader.username} added ${char.get('name')}, waiting for ${message.author.username} to select a character.`);
            await msg.edit(embed);
            traderOffer = char.get('name');
        })
        .catch(err => {
            console.log(err);
        });

        const accept = (reaction, user) => { userClick = user; return reaction.emoji.name === '✅' && user.id === message.author.id || user.id === trader.id};
        
        const collectorAccept = msg.createReactionCollector(accept, { time: 60000});

        let usersConfirmed = [];

        collectorAccept.on('collect', async (reaction, reactionCollector) => {
            if(!usersConfirmed.includes(userClick.id)) usersConfirmed.push(userClick.id);
            if(authorOffer !== ""){
                if(traderOffer !== ""){
                    if(usersConfirmed.length > 1){
                        await bot.userinventories.updateOne({ userID: trader.id }, 
                            { $pull: 
                                { 
                                characters: { name: traderOffer }
                                }
                            })
                        // If character was being leveled, change stuff in userinventory
                        if(traderInv.leveling && traderInv.leveling == traderOffer){
                            await bot.userinventories.updateOne({ userID: trader.id }, 
                                { $set: 
                                    { 
                                        leveling: "None"
                                    }
                                })
                        }
                        // If character was favorited, change stuff in userinventory
                        if(traderInv.favorite && traderInv.favorite == traderOffer){
                            await bot.userinventories.updateOne({ userID: trader.id }, 
                                { $set: 
                                    { 
                                        favorite: "None"
                                    }
                                })
                        }
                        await bot.userinventories.updateOne({ userID: trader.id }, 
                            { $push: 
                                { 
                                characters: authorChar
                                }
                            })
                        await bot.userinventories.updateOne({ userID: message.author.id }, 
                            { $pull: 
                                { 
                                characters: { name: authorOffer }
                                }
                            })
                        // If character was being leveled, change stuff in userinventory
                        if(authorInv.leveling && authorInv.leveling == authorOffer){
                            await bot.userinventories.updateOne({ userID: message.author.id }, 
                                { $set: 
                                    { 
                                        leveling: "None"
                                    }
                                })
                        }
                        // If character was favorited, change stuff in userinventory
                        if(authorInv.favorite && authorInv.favorite == authorOffer){
                            await bot.userinventories.updateOne({ userID: message.author.id }, 
                                { $set: 
                                    { 
                                        favorite: "None"
                                    }
                                })
                        }
                        await bot.userinventories.updateOne({ userID: message.author.id }, 
                            { $push: 
                                { 
                                characters: traderChar
                                }
                            })
                        return message.reply(`Trade Successful!`);
                    }
                    confirms++;
                }
                else message.channel.send("Both users need to offer a character before confirming the trade.")
            }
            else message.channel.send("Both users need to offer a character before confirming the trade.")
        });
    });    
    collectorClose.on('collect', async (reaction, reactionCollector) => {
        startTradeMsg.delete();
    });
}

module.exports.config = {
    name: "trade",
    aliases: []
}