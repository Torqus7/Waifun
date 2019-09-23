const Discord = require("discord.js");
const mongoose = require("mongoose");

module.exports.run = async (bot, message, args) => {
    
    let line = args.join(" ");
    let reline = await line.split(";")
    if(!reline[0] || reline[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}add name;sex;franchise;image1,image2;category;description\nRead the how-to-add-characters channel for more detailed info.`);
    }
    // WAIFUN QUEST
    if(message.channel.id !== "540963682860138505") return message.reply(`That command only works on the 'add-a-character' channel on the official server.\nUse ${bot.prefix}invite | to join our discord and add new characters.`)

    
    // Get all data from args
    let name = reline[0];
    let franch = reline[2];
    let images = reline[3];
    let description = reline[5];

    if(!reline[5]) description = "";

    // Check if character already exists in characters or checklists
    let regexp = new RegExp(name, "i");
    let char = await bot.characters.findOne({ name: regexp });
    if(char) if(char.name.toLowerCase() == name.toLowerCase()) return message.reply(`A character by the name **${name}** already exists. Check if it is the same one you are trying to add.`)
    let charCheck = await bot.checklists.findOne({ name: regexp });
    if(charCheck) if(charCheck.name.toLowerCase() == name.toLowerCase())  return message.reply(`A character by the name **${name}** already is in the checklist. Wait for it to be added.`)

    // Check if sex chosen exists and prepare to show
    let sex = 0;
    sexEntry = reline[1].toLowerCase();
    if(sexEntry == "1" || sexEntry == "f" || sexEntry == "female" || sexEntry == "w" || sexEntry == "waifu"){
        sex = 1;
    }else if(sexEntry == "2" || sexEntry == "m" || sexEntry == "male" || sexEntry == "h" || sexEntry == "husbando"){
        sex = 2;
    }else if(sexEntry == "3" || sexEntry == "both" || sexEntry == "b"){
        sex = 3;
    }else if(sexEntry == "4" || sexEntry == "unknown" || sexEntry == "u"){
        sex = 4;
    }else{
        return message.reply("Currently allowed sexes are: female (1, f, female, w, waifu) | male (2, m, male, h, husbando) | both (3, b, both) | unknown (4, u, unknown)")
    }
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
    
    // Check that category chosen exists and prepare to show
    let category = 0;
    categoryentry = reline[4].toLowerCase();
    if(categoryentry == "1" || categoryentry == "anime" || categoryentry == "manga" || categoryentry == "anime/manga"){
        category = 1;
    }else if(categoryentry == "2" || categoryentry == "games" || categoryentry == "game"){
        category = 2;
    }else if(categoryentry == "3" || categoryentry == "cartoons" || categoryentry == "comics" || categoryentry == "cartoons/comics" || categoryentry == "cartoon" || categoryentry == "comic"){
        category = 3;
    }else if(categoryentry == "4" || categoryentry == "internet" || categoryentry == "youtube" || categoryentry == "internet/youtube"){
        category = 4;
    }else{
        return message.reply("Currently allowed categories are: anime/manga (1), games (2), cartoons/comics (3), internet/youtube (4). It'll probably work however you write it, ex: 'CaRtOoN' will take it as Cartoons/Comics")
    }
    let categoryName = "";
    if(category == 1) categoryName = "Anime/Manga";
    else if(category == 2) categoryName = "Games";
    else if(category == 3) categoryName = "Cartoons/Comics";
    else if(category == 4) categoryName = "Internet/Youtube";

    // Check if franchise exists or not to tell the user
    let franchiseText = ""
    let regexpFranch = new RegExp(franch, "i");
    let franchise = await bot.franchises.findOne({ name: regexpFranch });
    if(franchise){
        if(franch === franchise.get('name')) franchiseText = `Character will be added to existing franchise ${franch}`;
        else franchiseText = `*Character will be added to ${franch}. But '${franchise.get('name')}' was found, if this is the one you where looking for, cancel this and send the character again with this franchise name instead.*`
    } else franchiseText = `*'${franch}' not found. Franchise will be created, make sure you wrote it right and got the right capitalization.*`;
    // Separate images into an array
    let imgs = images.split(",");
    let imgNumber = 0;

    // Show Character
    let embed = new Discord.RichEmbed()
        .setColor(bot.colors.Yellow)
        .setTitle(`${name} ${sexIcon}`)
        .setDescription(`${franchiseText}\n${categoryName}\n${description}`)
        .setFooter(`Picture ${imgNumber+1}/${imgs.length} - Check if everything's correct and click the tick to send`)
        .setImage(imgs[imgNumber]);
    let msg = await message.channel.send(embed);
    // Add reactions
    if(imgs.length > 1){
        await msg.react('◀');
        await msg.react('▶');
    }
    await msg.react('✅');
    await msg.react('❌');


/////////////////////REACTION COLLECTORS////////////////////////////////////////////////////////////////////////////////////////

    const back = (reaction, user) => { return reaction.emoji.name === '◀' && user.id === message.author.id;};
    const next = (reaction, user) => { return reaction.emoji.name === '▶' && user.id === message.author.id;};
    const send = (reaction, user) => { return reaction.emoji.name === '✅' && user.id === message.author.id;};
    const cancel = (reaction, user) => { return reaction.emoji.name === '❌' && user.id === message.author.id;};

    const collectorBack = msg.createReactionCollector(back, { time: 60000});
    const collectorNext = msg.createReactionCollector(next, { time: 60000});
    const collectorSend = msg.createReactionCollector(send, {max: 1, maxEmojis: 1, time: 60000});
    const collectorCancel = msg.createReactionCollector(cancel, { time: 60000});

    // Image back
    collectorBack.on('collect', async (reaction, reactionCollector) => {
        imgNumber-=1
        if(imgNumber < 0) imgNumber = (imgs.length-1);
        embed.setImage(imgs[imgNumber]);
        embed.setFooter(`Picture `+(imgNumber+1)+`/`+imgs.length);
        reaction.message.edit(embed);
        reaction.remove(reaction.users.keyArray()[1]);
    });
    collectorNext.on('collect', async (reaction, reactionCollector) => {
        imgNumber+=1
        if(imgNumber > (imgs.length-1)) imgNumber = 0;
        embed.setImage(imgs[imgNumber]);
        embed.setFooter(`Picture `+(imgNumber+1)+`/`+imgs.length);
        reaction.message.edit(embed);
        reaction.remove(reaction.users.keyArray()[1]);
    });

    collectorSend.on('collect', async (reaction, reactionCollector) => {
        // Construct character data to save into db
        let characters = new bot.checklists({
            _id: mongoose.Types.ObjectId(),
            name: name,
            sex: sex,
            franch: franch,
            images: images,
            category: category,
            description: description,
            popularity: 0,
            createdBy: message.author.username
        });
        // Save character to checklist
        await characters.save();
        message.reply(`Character **${name}** saved to checklist, it will be available once approved by an Admin`);
    });
    // Cancel sending character to checklist
    collectorCancel.on('collect', async (reaction, reactionCollector) => {
        message.channel.send(`Character **${name}** was cancelled by user.`)
        msg.delete();
    });
}

module.exports.config = {
    name: "add",
    aliases: []
}