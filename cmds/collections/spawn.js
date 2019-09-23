const Discord = require("discord.js");
const parser = require('cron-parser');
const mongoose = require("mongoose");
const spawnedRecenlty = new Set();
let spawnObject = require(`./spawnTypes/object.js`);

module.exports.run = async (bot, message, args) => {

    if(args[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}spawn | to spawn a random character. 6 uses for every 1 hour.\nProper usage is ${bot.prefix}spawn (Optional: 'm' | 'f' to select sex), (Optional: 'no' to prevent objects from spawning`);
    }

    if (spawnedRecenlty.has(message.author.id)) {
        return message.reply("You are spawning too fast (1 second cooldown).");
    }
    else{
        spawnedRecenlty.add(message.author.id);
        setTimeout(() => {
        spawnedRecenlty.delete(message.author.id);
        }, 1000);
    }
    // If user doesn't exist, add them to the database
    let user = await bot.userinventories.findOne({ userID: message.author.id })
    if(!user){
        // Save user to userinventories
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
        return message.reply(`Welcome to Waifun! You got a free extra **Sleeve**, use Sleeves to catch characters you want, you get Sleeves by either using 'get' every 3 hours or grabbing them when they randomly drop. You can now start using 'get' to get your Sleeves and 'spawn' to spawn a random character, object or event. Good Luck!`)
    }

    // Check if the user has spawn uses
    if(user.get('spawnUses') < 1){
        let options = {
            tz: 'Etc/UTC'
          };
        let interval = parser.parseExpression('0 0 1-23 * * *', options);

        let nextInterval = interval.next().toDate();
        let date = new Date();
        let time = Math.abs(nextInterval.getTime() - date.getTime());
        let seconds = Math.ceil(time / 1000);
        let minutes = seconds/60;

        return message.reply(`You can't use 'spawn' anymore until next reset. Time remaining: **${minutes.toString().split(".")[0]} minutes**`)
    }
    
    // Check if object will spawn
    let objSpawn = false;
    let R = Math.floor(Math.random()*100);
    if(R < 4) objSpawn = true;

    // Program to get the random character, NOTE: Need to program category
    let chars = undefined;

    errorMessage = `Proper usage is ${bot.prefix}spawn (Optional: 'm' | 'f' to select sex), (Optional: 'no' to prevent objects from spawning)`;

    if(args.length > 2){
        return message.reply(errorMessage);
    }else if(args.length > 0){
        let selection = "";
        if(args[0] === "f" || args[0] === "female" || args[0] === "w" || args[0] === "waifu" ) selection = 1;
        else if(args[0] === "m" || args[0] === "male" || args[0] === "h" || args[0] === "husbando" ) selection = 2;
        else return message.reply(errorMessage);
        chars = await bot.characters.find({ sex: selection })
    }else{
        chars = await bot.characters.find();
    }

    // Remove 1 spawn use from the user
    let spawn = user.get('spawnUses')-1;
    await bot.userinventories.updateOne({ userID: message.author.id }, 
        { $set: 
            { 
                spawnUses: spawn
            }
        })

    // Add 1 exp to leveling character
    if(user.get('leveling') && user.get('leveling') !== "None"){
        let check = await user.get('characters').filter(char => char.name === user.get('leveling'));
        if(check.length < 1){
            await bot.userinventories.updateOne({ userID: message.author.id }, 
                { $set: 
                    { 
                        leveling: "None"
                    }
                })
            console.log("No leveling character found on spawn: "+user.leveling+" User characters where:\n"+user.get('characters'));
            return message.reply("The name of the character you were leveling didn't exist. You are now leveling 'None' and everything should work fine. This is a bug, if this keeps happening, contact an admin on the official server for help. It'll be fixed soon.");
        }
        let newExp = check[0].exp+1;
        // Update character in map
        await bot.userinventories.updateOne(
            { userID: message.author.id, "characters.name": check[0].name },
            { $set: { "characters.$.exp" : newExp } }
        )
        if (newExp == bot.levelCurve.two) message.reply(`Your **${user.get('leveling')}** has reached **level 2**!`)
        else if (newExp == bot.levelCurve.three) message.reply(`Your **${user.get('leveling')}** has reached **level 3**!`)
        else if (newExp == bot.levelCurve.four) message.reply(`Your **${user.get('leveling')}** has reached **level 4**!`)
        else if (newExp == bot.levelCurve.five) message.reply(`Your **${user.get('leveling')}** has reached **level 5**!`)
        else if (newExp == bot.levelCurve.six) message.reply(`Your **${user.get('leveling')}** has reached **level 6**!`)
        else if (newExp == bot.levelCurve.seven) message.reply(`Your **${user.get('leveling')}** has reached **level 7**!`)
        else if (newExp == bot.levelCurve.eight) message.reply(`Your **${user.get('leveling')}** has reached **level 8**!`)
        else if (newExp == bot.levelCurve.nine) message.reply(`Your **${user.get('leveling')}** has reached **level 9**!`)
        else if (newExp == bot.levelCurve.ten) message.reply(`Your **${user.get('leveling')}** has reached **level 10**!`)
    }

    let r = Math.floor(Math.random()*chars.length);
    let char = chars[r];

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

    // Separate images into an array
    let imgNumber = 0;
    let imgs = images.split(",");

    // Show character
    let embed = new Discord.RichEmbed()        
        .setColor(bot.colors.LightGray)
        .setTitle(`${name} ${sexIcon}`)
        .setDescription(`${franch}\n${categoryName}\n${description}`)
        .setFooter(`Picture ${imgNumber+1}/${imgs.length}`)
        .setImage(imgs[imgNumber]);
    let msg = await message.channel.send(embed);

    // Spawn object if chances were met
    if(objSpawn){
        spawnObject.run(bot, message, args)
    }

    // Add reactions
    await msg.react('🖐');
    await msg.react('🔶');


//////////////////////////REACTION COLLECTORS///////////////////////////////////////////////////////////////////////////////////

    let userClick = undefined;
    let ignoreList = [];
    let ignoreListGold = [];
    let winner = false;

    const collect = (reaction, user) => { 
        userClick = user;
        return reaction.emoji.name === '🖐' && user.id !== msg.author.id && !ignoreList.includes(user.id)};
    const collectGold = (reaction, user) => { 
        userClick = user;
        return reaction.emoji.name === '🔶' && user.id !== msg.author.id && !ignoreListGold.includes(user.id)
    };

    const collectorCollect = msg.createReactionCollector(collect, {max: 6, time: 30000});
    const collectorCollectGold = msg.createReactionCollector(collectGold, {max: 6, time: 30000});

    collectorCollect.on('collect', async (reaction, reactionCollector) => {
        if(winner) return;

        // Check if user exists
        user = await bot.userinventories.findOne({ userID: userClick.id });
        if(user) {
            // Check if user has a sleeve
            if(user.get('sleeves') < 1){
                message.channel.send(`${userClick}, You don't have a Sleeve.`);
                ignoreList.push(userClick.id);
                return;
            }
            // Check if user already has the character
            checkUser = user.get('characters').filter(chara => chara.name === char.get('name'));
            if(checkUser.length > 0){
                message.channel.send(`${userClick}, You already have that character`);
                ignoreList.push(userClick.id);
                return;
            }
        }
        // Give the character to the user
        winner = true;
        addCharacterToInventory(bot, message, char, userClick, false);
        msg.clearReactions();
    });
    collectorCollectGold.on('collect', async (reaction, reactionCollector) => {
        if(winner) return;

        // Check if user exists
        user = await bot.userinventories.findOne({ userID: userClick.id });
        if(user) {
            // Check if user has a sleeve
            if(user.get('goldSleeves') < 1){
                message.channel.send(`${userClick}, You don't have a Golden Sleeve.`);
                ignoreListGold.push(userClick.id);
                return;
            }
            // Check if user already has the character
            checkUser = user.get('characters').filter(chara => chara.name === char.get('name'));
            if(checkUser.length > 0){
                if(checkUser[0].isGolden === true){
                    ignoreListGold.push(userClick.id);
                    return message.channel.send(`${userClick}, You already have that character as Golden`);
                }
                // Upgrade character to golden
                await bot.userinventories.updateOne(
                    { userID: message.author.id, "characters.name": checkUser[0].name },
                    { $set: { "characters.$.isGolden" : true } }
                )
                winner = true;
                message.channel.send(`${userClick}, You upgraded your **${char.get('name')}** to Golden!`);
                msg.clearReactions();
                return;
            }
        }
        // Give the character to the user
        winner = true;
        addCharacterToInventory(bot, message, char, userClick, true);
        msg.clearReactions();
    });
    collectorCollect.on('end', async (reaction, reactionCollector) => {
        msg.clearReactions();
    });
}

module.exports.config = {
    name: "spawn",
    aliases: ["s"]
}

async function addCharacterToInventory(bot, message, char, userClick, golden){
    // If user WHO CLICKED doesn't have an inventory, create it
    user = await bot.userinventories.findOne({ userID: userClick.id });
    if(!user){
        date = new Date();
        date.setHours(date.getHours() - 13);
        newUser = new bot.userinventories({
            _id: mongoose.Types.ObjectId(),
            userID: userClick.id,
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
        // Save user to userinventories
        await newUser.save();
        user = await bot.userinventories.findOne({ userID: userClick.id });
        message.channel.send(`${userClick}, Welcome to Waifun! You got a free extra **Sleeve**, use Sleeves to catch characters you want, you get Sleeves by either using 'get' every 3 hours or grabbing them when they randomly drop. You can now start using 'get' to get your Sleeves and 'spawn' to spawn a random character, object or event. Good Luck!`);
    }
    // Add character to user inventory
    let character = new Map();
    character.set('name', char.get('name'))
    character.set('mainPic', 0);
    character.set('isGolden', golden);
    character.set('exp', 0);
    await bot.userinventories.updateOne({ userID: userClick.id }, 
        { $push: 
            { 
            characters: character
            }
        })
    if(golden){
        // Remove a golden sleeve if golden
        await bot.userinventories.updateOne({ userID: userClick.id }, 
            { $set: 
                { 
                goldSleeves: user.get('goldSleeves')-1
                }
            })
    }else{
        // Remove a sleeve
        await bot.userinventories.updateOne({ userID: userClick.id }, 
            { $set: 
                { 
                sleeves: user.get('sleeves')-1
                }
            })
    }
    // Increment char popularity by 1
    popularityIncrement = char.get('popularity');
    await bot.characters.updateOne({ name: char.get('name') }, 
        { $set: 
            { 
                popularity: popularityIncrement+1
            }
        })
    if (golden) return message.channel.send(`**${userClick.username}** got **${char.get('name')}** as Golden!`);
    else return message.channel.send(`**${userClick.username}** got **${char.get('name')}**!`);
}