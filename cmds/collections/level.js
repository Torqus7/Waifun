const Discord = require("discord.js");
const stringSimilarity = require('string-similarity');

module.exports.run = async (bot, message, args) => {
    if(args[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}level | to see the currently leveling character.\n${bot.prefix}level <name> | to start leveling up a character you own.\nYour characters gain Exp each time you use 'spawn' and they are selected with this command. They also gain Exp for completing events or duels.`);
    }

    try{

    let user = await bot.userinventories.findOne({ userID: message.author.id });

    if(args.length > 0 && args[0].toLowerCase() == "none"){
        // Set leveling up to None
        await bot.userinventories.updateOne({ userID: message.author.id }, 
            { $set: 
                { 
                    leveling: "None"
                }
            })
        message.reply(`You are not leveling a character anymore.`);
    }
    // Check currently leveling character
    else if(args.length < 1){
        if(!user.get('leveling') || user.get('leveling') == "None") return message.reply(`You are not leveling any character, use ${bot.prefix}level <name> | to start leveling up a character you own.\nYour characters gain Exp each time you use 'spawn' and they are selected with this command. They also gain Exp for completing events or duels.`);
        // Check character exp
        let check = user.get('characters').filter(char => char.name == user.get('leveling'));
        if(check.length < 1){
            await bot.userinventories.updateOne({ userID: message.author.id }, 
                { $set: 
                    { 
                        leveling: "None"
                    }
                })
            console.log("No leveling character found on level");
            return message.reply("The name of the character you were leveling didn't exist. You are now leveling 'None' and everything should work fine. This is a bug, if this keeps happening, contact an admin on the official server for help, it'll help everyone.")
        }
        let char = await bot.characters.findOne({ name: user.get('leveling') });

        // Get all data from char
        let name = char.get('name');
        let sex = char.get('sex');
        let franch = char.get('franch');
        let images = char.get('images');
        let category = char.get('category');
        let description = char.get('description');

        // Set icons for sex
        let male = "<:male:538223014727122944>";
        let female = "<:female:538223014710476810>";
        let both = "<:male:538223014727122944><:female:538223014710476810>";
        let unknown = "❔";
        let sexIcon = "";
        if(sex == 1) sexIcon = female;
        else if(sex == 2) sexIcon = male;
        else if(sex == 3) sexIcon = both;
        else if(sex == 4) sexIcon = unknown;

        // Get category name
        let categoryName = "";
        if(category === 1) categoryName = "Anime/Manga";
        else if(category === 2) categoryName = "Games";
        else if(category === 3) categoryName = "Cartoons/Comics";
        else if(category === 4) categoryName = "Internet/Youtube";
        
        let fixMainPic = false;
        let imgs = images.split(",");
        // FIX MAINPIC
        if(check[0].mainPic == undefined || check[0].mainPic >= imgs.length){
            check[0].mainPic = 0;
            fixMainPic = true
        }
        // Separate images into an array
        let imgNumber = check[0].mainPic;

        // Get character level
        let level = 1;
        let exp = check[0].exp;
        if(exp >= bot.levelCurve.ten) level = 10;
        else if(exp >= bot.levelCurve.nine) level = 9;
        else if(exp >= bot.levelCurve.eight) level = 8;
        else if(exp >= bot.levelCurve.seven) level = 7;
        else if(exp >= bot.levelCurve.six) level = 6;
        else if(exp >= bot.levelCurve.five) level = 5;
        else if(exp >= bot.levelCurve.four) level = 4;
        else if(exp >= bot.levelCurve.three) level = 3;
        else if(exp >= bot.levelCurve.two) level = 2;
        else if(exp >= bot.levelCurve.one) level = 1;

        // Show character
        let embed = new Discord.RichEmbed()        
            .setColor(bot.colors.Green)
            .setTitle(`${name} ${sexIcon}`)
            .setDescription(`${franch}\n${categoryName}\n${description}`)
            .addField(`Level:`, `${level}`, true)
            .setFooter(`You are currently leveling up this character - Picture ${imgNumber+1}/${imgs.length}`)
            .setImage(imgs[imgNumber])
        // Send embed
        if(check[0].isGolden === true){
            embed.setColor(bot.colors.Yellow);
            embed.setTitle(`${name} ${sexIcon} <:gsleeve:553299310280835073>`);
        }
        let msg = await message.channel.send(embed);
        // Add reactions
        if(imgs.length > 1){
            await msg.react('◀');
            await msg.react('▶');
        }
        await msg.react('✖');

        
        if(fixMainPic){
            await bot.userinventories.updateOne(
                { userID: message.author.id, "characters.name": check[0].name },
                { $set: { "characters.$.mainPic" : 0 } }
            )
        }

        const back = (reaction, user) => { return reaction.emoji.name === '◀';};
        const next = (reaction, user) => { return reaction.emoji.name === '▶';};
        const close = (reaction, user) => { return reaction.emoji.name === '✖' && user.id === message.author.id;};

        const collectorBack = msg.createReactionCollector(back, { time: 30000});
        const collectorNext = msg.createReactionCollector(next, { time: 30000});
        const collectorClose = msg.createReactionCollector(close, { time: 30000});

        collectorBack.on('collect', async (reaction, reactionCollector) => {
            imgNumber-=1
            if(imgNumber < 0) imgNumber = (imgs.length-1);
            embed.setImage(imgs[imgNumber]);
            embed.setFooter(`You are currently leveling up this character - Picture ${imgNumber+1}/${imgs.length}`)
            reaction.message.edit(embed);
            reaction.remove(reaction.users.keyArray()[1]);
        });
        collectorNext.on('collect', async (reaction, reactionCollector) => {
            imgNumber+=1
            if(imgNumber > (imgs.length-1)) imgNumber = 0;
            embed.setImage(imgs[imgNumber]);
            embed.setFooter(`You are currently leveling up this character - Picture ${imgNumber+1}/${imgs.length}`)
            reaction.message.edit(embed);
            reaction.remove(reaction.users.keyArray()[1]);
        });
        collectorClose.on('collect', async (reaction, reactionCollector) => {
            message.delete();
            msg.delete();
        });
    }

    // Set new character for leveling
    else{
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

        // Check if user has the character
        let characters = user.get('characters');
        check = characters.filter(chara => chara.name === char.get('name'));
        if(check.length < 1) return message.reply(`You don't have ${char.get('name')}`);
    
        // Get all data from char
        let name = char.get('name');
        let sex = char.get('sex');
        let franch = char.get('franch');
        let images = char.get('images');
        let category = char.get('category');
        let description = char.get('description');
    
        // Set icons for sex
        let male = "<:male:538223014727122944>";
        let female = "<:female:538223014710476810>";
        // NEED TO ADD ICONS FOR BOTH AND OTHER
        let both = "<:female:538223014710476810>";
        let unknown = "<:female:538223014710476810>";
        let sexIcon = "";
        if(sex == 1) sexIcon = female;
        else if(sex == 2) sexIcon = male;
        else if(sex == 3) sexIcon = both;
        else if(sex == 4) sexIcon = unknown;
    
        // Get category name
        let categoryName = "";
        if(category === 1) categoryName = "Anime/Manga";
        else if(category === 2) categoryName = "Games";
        else if(category === 3) categoryName = "Cartoons/Comics";
        else if(category === 4) categoryName = "Internet/Youtube";
        
        let fixMainPic = false;
        let imgs = images.split(",");
        // FIX MAINPIC
        if(check[0].mainPic == undefined || check[0].mainPic >= char.get('images').split(",").length){
            check[0].mainPic = 0;
            fixMainPic = true
        }
        // Separate images into an array
        let imgNumber = check[0].mainPic;
    
        // Get character level
        let level = 1;
        let exp = check[0].exp;
        if(exp >= bot.levelCurve.ten) level = 10;
        else if(exp >= bot.levelCurve.nine) level = 9;
        else if(exp >= bot.levelCurve.eight) level = 8;
        else if(exp >= bot.levelCurve.seven) level = 7;
        else if(exp >= bot.levelCurve.six) level = 6;
        else if(exp >= bot.levelCurve.five) level = 5;
        else if(exp >= bot.levelCurve.four) level = 4;
        else if(exp >= bot.levelCurve.three) level = 3;
        else if(exp >= bot.levelCurve.two) level = 2;
        else if(exp >= bot.levelCurve.one) level = 1;

        // Show character
        let embed = new Discord.RichEmbed()        
            .setColor(bot.colors.Green)
            .setTitle(`${name} ${sexIcon}`)
            .setDescription(`${franch}\n${categoryName}\n${description}`)
            .addField(`Level:`, `${level}`, true)
            .setFooter(`Do you want to start leveling up this character? - Picture ${imgNumber+1}/${imgs.length}`)
            .setImage(imgs[imgNumber])
        // Send embed
        if(check[0].isGolden === true){
            embed.setColor(bot.colors.Yellow);
            embed.setTitle(`${name} ${sexIcon} <:gsleeve:553299310280835073>`);
        }
        let msg = await message.channel.send(embed);
        // Add reactions
        if(imgs.length > 1){
            await msg.react('◀');
            await msg.react('▶');
        }
        await msg.react('✅');
        await msg.react('✖');
    
        if(fixMainPic){
            await bot.userinventories.updateOne(
                { userID: message.author.id, "characters.name": check[0].name },
                { $set: { "characters.$.mainPic" : 0 } }
            )
        }

        const back = (reaction, user) => { return reaction.emoji.name === '◀';};
        const next = (reaction, user) => { return reaction.emoji.name === '▶';};
        const send = (reaction, user) => { return reaction.emoji.name === '✅' && user.id === message.author.id;};
        const close = (reaction, user) => { return reaction.emoji.name === '✖' && user.id === message.author.id;};
    
        const collectorBack = msg.createReactionCollector(back, { time: 30000});
        const collectorNext = msg.createReactionCollector(next, { time: 30000});
        const collectorSend = msg.createReactionCollector(send, {max: 1, maxEmojis: 1, time: 30000});
        const collectorClose = msg.createReactionCollector(close, { time: 30000});
    
        collectorBack.on('collect', async (reaction, reactionCollector) => {
            imgNumber-=1
            if(imgNumber < 0) imgNumber = (imgs.length-1);
            embed.setImage(imgs[imgNumber]);
            embed.setFooter(`Do you want to start leveling up this character? - Picture ${imgNumber+1}/${imgs.length}`)
            reaction.message.edit(embed);
            reaction.remove(reaction.users.keyArray()[1]);
        });
        collectorNext.on('collect', async (reaction, reactionCollector) => {
            imgNumber+=1
            if(imgNumber > (imgs.length-1)) imgNumber = 0;
            embed.setImage(imgs[imgNumber]);
            embed.setFooter(`Do you want to start leveling up this character? - Picture ${imgNumber+1}/${imgs.length}`)
            reaction.message.edit(embed);
            reaction.remove(reaction.users.keyArray()[1]);
        });
        collectorSend.on('collect', async (reaction, reactionCollector) => {
            // Save character as current leveled one
            await bot.userinventories.updateOne({ userID: message.author.id }, 
                { $set: 
                    { 
                        leveling: name
                    }
                })
            message.reply(`You are now leveling up **${name}**.`);
        });
        collectorClose.on('collect', async (reaction, reactionCollector) => {
            message.delete();
            msg.delete();
        });
    }
    }catch(err){
        console.log(message.author.id);
        console.log(err);
    }
}

module.exports.config = {
    name: "level",
    aliases: ["lvl", "l"]
}