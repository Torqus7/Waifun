const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    let objs = await bot.objects.find({});
    let r = Math.floor(Math.random()*objs.length);
    let obj = objs[r];

    // Get all data from obj
    let name = obj.get('name');
    let quality = obj.get('quality');
    let image = obj.get('image');
    let franch = obj.get('franch');
    let description = obj.get('description');
    let uses = obj.get('uses');

    // Get quality name
    let qualityName = "";
    if(quality == 1) qualityName = "Common";
    else if(quality == 2) qualityName = "Rare";
    else if(quality == 3) qualityName = "Epic";
    else if(quality == 4) qualityName = "Legendary";

    // Show object
    let embed = new Discord.RichEmbed()        
        .setColor(bot.colors.LightGray)
        .setTitle(`${name}`)
        // .setFooter(`Picture ${imgNumber+1}/${imgs.length}`)
        .setImage(image);
    if(franch !== "None") embed.setDescription(`${qualityName}\n${franch}\n${description} (**${uses} use/s**)`)
    else embed.setDescription(`${qualityName}\n${description} (**${uses} use/s**)`)
    

    let msg = await message.channel.send(embed);

    // Add reactions
    await msg.react('🖐');

    let userClick = undefined;
    let ignoreList = [];
    let winner = false;

    const collect = (reaction, user) => { 
        userClick = user;
        return reaction.emoji.name === '🖐' && user.id !== msg.author.id && !ignoreList.includes(user.id)};

    const collectorCollect = msg.createReactionCollector(collect, {max: 6, time: 30000});

    collectorCollect.on('collect', async (reaction, reactionCollector) => {
        if(winner) return;
    
        let user = await bot.userinventories.findOne({ userID: userClick.id });
        // Check if user already has the object
        check = user.get('objects').filter(object => object.name === name);
        if(check.length > 0){
            message.channel.send(`${userClick}, You already have that object`);
            ignoreList.push(userClick.id);
            return;
        }
        // Give the object to the user
        winner = true;
        addObjectToInventory(bot, message, name, uses, userClick);
        msg.clearReactions();
    });
    collectorCollect.on('end', async (reaction, reactionCollector) => {
        msg.clearReactions();
    });
}

async function addObjectToInventory(bot, message, name, uses, userClick){
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
    // Add object to user inventory
    let object = new Map();
    object.set('name', name)
    object.set('uses', uses)
    await bot.userinventories.updateOne({ userID: userClick.id }, 
        { $push: 
            { 
                objects: object
            }
        })
    return message.channel.send(`**${userClick.username}** got a **${name}**!`);
}