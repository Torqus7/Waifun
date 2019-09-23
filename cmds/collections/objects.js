const Discord = require("discord.js");
const stringSimilarity = require('string-similarity');

module.exports.run = async (bot, message, args) => {
    if(args[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}infobj | to check information about the objects\n${bot.prefix}infobj <name> | to see an object's info`);
    }

    let user = await bot.userinventories.findOne({ userID: message.author.id });

    if(args.length < 1){
        let objs = await bot.objects.find()
        let objectArray = [];
        let check = [];
        await objs.forEach(object => {
            objectArray.push(object.name);
        });
        await objectArray.sort();
        if(user){
            objNames = "";
            objectArray.forEach(object => {
                check = user.get('objects').filter(obj => obj.name === object);
                if(check.length > 0){
                    objNames += `**${object} ***\n`
                }else{
                    objNames += `${object}\n`;
                }
            });
        }else objs.forEach(object => nameList += `${object}\n`);
        
        let embed = new Discord.RichEmbed()
            .setColor(bot.colors.Green)
            .setTitle(`Objects List`)
            .setDescription(`${objNames}`)
            .setFooter(`There are currently ${objectArray.length} objects available.`);
        await message.channel.send(embed);
        return;
    }

    let objName = args.join(" ");

    // Find best math and check if object exists
    let names = [];
    // Escape all characters inside the variable
    objName = objName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    let regexp = new RegExp(objName, "i");
    // Find all characters matching regexp
    let obj = await bot.objects.find({ name: regexp });
    if (obj.length < 1) return message.reply(`Couldn't find character: **${objName}**.`);
    await obj.forEach(object => names.push(object.name));
    // Compare user input and gotten characters to get best match
    let match = await stringSimilarity.findBestMatch(objName, names);
    obj = await bot.objects.findOne({name: match.bestMatch.target});

    // Get all data from obj
    let name = obj.get('name');
    let quality = obj.get('quality');
    let franch = obj.get('franch');
    let image = obj.get('image');
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
        .setColor(bot.colors.Green)
        .setTitle(`${name}`)
        .setFooter(`You don't have this object`)
        .setImage(image);
    if(franch !== "None") embed.setDescription(`${qualityName}\n${franch}\n${description} (**${uses} use/s**)`)
    else embed.setDescription(`${qualityName}\n${description} (**${uses} use/s**)`)
    
    // Check if user has the character
    let check = await user.get('objects').filter(obj => obj.name === name);
    if(check.length > 0){
        embed.setFooter(`You have this object`, message.author.displayAvatarURL)
        if(franch !== "None") embed.setDescription(`${qualityName}\n${franch}\n${description} (**${check[0].uses} use/s remaining**)`)
        else embed.setDescription(`${qualityName}\n${description} (**${check[0].uses} use/s remaining**)`)
    }
    // Send embed
    let msg = await message.channel.send(embed);
    
    await msg.react('✖');

//////////////////////////REACTION COLLECTORS///////////////////////////////////////////////////////////////////////////////////

    const close = (reaction, user) => { return reaction.emoji.name === '✖' && user.id === message.author.id;};

    const collectorClose = msg.createReactionCollector(close, { time: 30000});

    collectorClose.on('collect', async (reaction, reactionCollector) => {
        message.delete();
        msg.delete();
    });
}

module.exports.config = {
    name: "objects",
    aliases: ["obj", "o"]
}