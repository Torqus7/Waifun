const Discord = require("discord.js");
const mongoose = require("mongoose");

module.exports.run = async (bot, message, args) => {

    if(message.author.id != 311979587242557442) return;   
     
    let line = args.join(" ");
    let reline = await line.split(";")

    if(!reline[0] || reline.length < 7 || reline[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}addobj name;type;quality;image;franch;description;power/uses (equipable/consumable)`);
    }

    // Get all data from args
    let name = reline[0];
    let image = reline[3];
    let franch = reline[4];
    let description = reline[5];
    let usesNPower = reline[6];

    // Check if object already exists in objects
    let regexp = new RegExp(name, "i");
    let obj = await bot.objects.findOne({ name: regexp });
    if(obj) return message.reply(`An object by the name **${name}** already exists. Check if it is the same one you are trying to add.`)

    // Check if type is correct
    let type = 0;
    typeEntry = reline[1].toLowerCase();
    if(typeEntry == "1" || typeEntry == "e" || typeEntry == "equipable" || typeEntry == "equip"){
        type = 1;
    }else if(typeEntry == "2" || typeEntry == "c" || typeEntry == "consumable" || typeEntry == "cons"){
        type = 2;
    }else{
        return message.reply("Currently allowed types for objects are: equipable (1, e, equip) | consumable (2, c, cons)")
    }
    
    // Check that quality is correct
    let quality = 0;
    qualityEntry = reline[2].toLowerCase();
    if(qualityEntry == "1" || qualityEntry == "c" || qualityEntry == "common"){
        quality = 1;
    }else if(qualityEntry == "2" || qualityEntry == "r" || qualityEntry == "rare"){
        quality = 2;
    }else if(qualityEntry == "3" || qualityEntry == "e" || qualityEntry == "epic"){
        quality = 3;
    }else if(qualityEntry == "4" || qualityEntry == "l" || qualityEntry == "legendary"){
        quality = 4;
    }else{
        return message.reply("Currently allowed qualities are: common (1), rare (2), epic (3), legendary (4).")
    }

    let typeName = "";
    if(type == 1) typeName = "Equipable";
    else if(type == 2) typeName = "Consumable";

    let qualityName = "";
    if(quality == 1) qualityName = "Common";
    else if(quality == 2) qualityName = "Rare";
    else if(quality == 3) qualityName = "Epic";
    else if(quality == 4) qualityName = "Legendary";
    
    let embed;
    let msg;
    // Show object
    if(type === 2){
        embed = new Discord.RichEmbed()        
            .setColor(bot.colors.Yellow)
            .setTitle(`${name}`)
            .setDescription(`${qualityName} ${typeName}\n${franch}`)
            .addField("On Use:", `${description} (**${usesNPower} use/s)**`)
            .setImage(image);
        msg = await message.channel.send(embed);
    }
    else{
        embed = new Discord.RichEmbed()        
            .setColor(bot.colors.Yellow)
            .setTitle(`${name}`)
            .setDescription(`${qualityName} ${typeName}\n${franch}\n${description} (Power: ${usesNPower})`)
            .setImage(image);
        msg = await message.channel.send(embed);
    }

    await msg.react('✅');
    await msg.react('❌');


/////////////////////REACTION COLLECTORS////////////////////////////////////////////////////////////////////////////////////////

    const send = (reaction, user) => { return reaction.emoji.name === '✅' && user.id === message.author.id;};
    const cancel = (reaction, user) => { return reaction.emoji.name === '❌' && user.id === message.author.id;};

    const collectorSend = msg.createReactionCollector(send, {max: 1, maxEmojis: 1, time: 60000});
    const collectorCancel = msg.createReactionCollector(cancel, { time: 60000});

    collectorSend.on('collect', async (reaction, reactionCollector) => {
        if(type === 2){
            // Construct character data to save into db
            let object = new bot.objects({
                _id: mongoose.Types.ObjectId(),
                name: name,
                quality: quality,
                image: image,
                franch: franch,
                description: description,
                uses: usesNPower
            });
            // Save character to checklist
            await object.save();
            message.reply(`Object **${name}** saved to Object list.`);
        }else if(type === 1){
            // Construct character data to save into db
            let object = new bot.equipments({
                _id: mongoose.Types.ObjectId(),
                name: name,
                quality: quality,
                image: image,
                franch: franch,
                description: description,
                power: usesNPower
            });
            // Save character to checklist
            await object.save();
            message.reply(`Object **${name}** saved to Object list.`);
        }
    });
    // Cancel sending character to checklist
    collectorCancel.on('collect', async (reaction, reactionCollector) => {
        message.channel.send(`Object **${name}** was cancelled by user.`)
        msg.delete();
    });
}

module.exports.config = {
    name: "addobj",
    aliases: []
}