const Discord = require("discord.js");
const stringSimilarity = require('string-similarity');

module.exports.run = async (bot, message, args) => {

    // return message.channel.send("This command is disabled until there are enough characters");

    if(args.length < 1 || args[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}use <object> | to use a consumable from your inventory.`);
    }

    // Get character name
    let objectName = args.join(" ");

    // Find best math and check if character exists
    let names = [];
    // Escape all characters inside the variable
    objectName = objectName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    let regexp = new RegExp(objectName, "i");
    // Find all objs matching regexp
    let obj = await bot.objects.find({ name: regexp });
    if (obj.length < 1) return message.reply(`Couldn't find object: **${objectName}**.`);
    await obj.forEach(object => names.push(object.name));
    // Compare user input and gotten objs to get best match
    let match = await stringSimilarity.findBestMatch(objectName, names);
    obj = await bot.objects.findOne({name: match.bestMatch.target});

    // Check if the user has the object
    let user = await bot.userinventories.findOne({ userID: message.author.id });
    objectsUser = user.get('objects');
    checkObjects = objectsUser.filter(object => object.name === obj.get('name'));
    if(checkObjects.length < 1) return message.reply(`You don't have **${obj.get('name')}**.`)

    // let objName = obj.name.replace(/\s/g, '');
    // let script = require(`./assets/objScripts/${objName}.js`);
    // script.run(bot, message, args)
    
    // Get all data from char
    name = obj.get('name');
    quality = obj.get('quality');
    image = obj.get('image');
    franch = obj.get('franch');
    description = obj.get('description');
    uses = checkObjects[0].uses;
    
    // Check that quality is correct
    qualityText = ""
    if(quality === 1) qualityText = "Common";
    else if(quality === 2) qualityText = "Rare";
    else if(quality === 3) qualityText = "Epic";
    else if(quality === 4) qualityText = "Legendary";

    // Show object
    let embed = new Discord.RichEmbed()        
        .setColor(bot.colors.Yellow)
        .setTitle(`${name}`)
        .setDescription(`${qualityText}\n${franch}`)
        .addField("On Use:", `${description} (${uses} uses remaining)`)
        .setImage(image);
    let msg = await message.channel.send(embed);

    await msg.react('✅');
    await msg.react('✖');

//////////////////////////REACTION COLLECTORS///////////////////////////////////////////////////////////////////////////////////

    const use = (reaction, user) => { return reaction.emoji.name === '✅' && user.id === message.author.id;};
    const close = (reaction, user) => { return reaction.emoji.name === '✖' && user.id === message.author.id;};

    const collectorUse = msg.createReactionCollector(use, {max: 1, maxEmojis: 1, time: 30000});
    const collectorClose = msg.createReactionCollector(close, { time: 30000});

    collectorUse.on('collect', async (reaction, reactionCollector) => {
        newUses = checkObjects[0].uses - 1;
        if(newUses < 1){
            // Remove object from user inventory if all uses where used
            await bot.userinventories.updateOne({ userID: message.author.id }, 
                { $pull: 
                    { 
                    objects: { name: name }
                    }
                })
        }
        else{
            // Remove 1 use from object
            await bot.userinventories.updateOne(
                { userID: message.author.id, "objects.name": checkObjects[0].name },
                { $set: { "objects.$.uses" : newUses } }
            )
        }
        let scriptName = name;
        let script = require(`../../assets/objScripts/${scriptName}.js`);
        script.run(bot, message, args)
    });
    collectorClose.on('collect', async (reaction, reactionCollector) => {
        message.delete();
        msg.delete();
    });
}

module.exports.config = {
    name: "use",
    aliases: ["u", "consume"]
}