const Discord = require("discord.js");
const stringSimilarity = require('string-similarity');

module.exports.run = async (bot, message, args) => {
    if(args[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}info | to check information about the bot\n${bot.prefix}info <f> or <m> | to count male and female characters\n${bot.prefix}info <category> | to count amount of characters from said category (${bot.prefix}categories)\n${bot.prefix}info <name> | to check a character's info`);
    }

    if(args.length < 1){
        bot.characters.find().then(characters =>{
            message.reply(`There are currently **${characters.length}** characters!\nTo find info about a specific character, use: ${bot.prefix}info <name>\nUse ${bot.prefix}invite | to join our discord and add new characters.`)
        })
        return;
    }else if(args.length < 2){
        if(args[0] === "f" || args[0] === "female" || args[0] === "w" || args[0] === "waifu"){
            chars = await bot.characters.find({ sex: 1 });
            return message.reply(`There are currently **${chars.length}** female characters!\nTo find info about a specific character, use: ${bot.prefix}info <name>`)
        }else if(args[0] === "m" || args[0] === "male" || args[0] === "h" || args[0] === "husbando"){
            chars = await bot.characters.find({ sex: 2 });
            return message.reply(`There are currently **${chars.length}** male characters!\nTo find info about a specific character, use: ${bot.prefix}info <name>`)
        }else if(args[0] === "b" || args[0] === "both"){
            chars = await bot.characters.find({ sex: 3 });
            return message.reply(`There are currently **${chars.length}** male/female characters!\nTo find info about a specific character, use: ${bot.prefix}info <name>`)
        }else if(args[0] === "u" || args[0] === "unknown"){
            chars = await bot.characters.find({ sex: 4 });
            return message.reply(`There are currently **${chars.length}** characters of unknown sex!\nTo find info about a specific character, use: ${bot.prefix}info <name>`)
        }
    }

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

    // Get all data from char
    let name = char.get('name');
    let sex = char.get('sex');
    let franch = char.get('franch');
    let images = char.get('images');
    let category = char.get('category');
    let description = char.get('description');
    let popularity = char.get('popularity');
    //let addedBy = char.get('createdBy');
    //let addedOn = char.get('createdAt');

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
    let fixMainPic = false;

    // Show character
    let embed = new Discord.RichEmbed()  
        .setColor(bot.colors.Green)
        .setTitle(`${name} ${sexIcon}`)
        .setDescription(`${franch}\n${categoryName}\n${description}`)
        .setFooter(`Picture ${imgNumber+1}/${imgs.length}`)
        .setImage(imgs[imgNumber]);
    // Check if user has the character
    let user = await bot.userinventories.findOne({ userID: message.author.id });
    let check = await user.get('characters').filter(char => char.name === name);
    if(check.length > 0){
        if(check[0].mainPic == undefined || check[0].mainPic >= char.get('images').split(",").length){
            check[0].mainPic = 0;
            fixMainPic = true
        }
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
        // ADD STATS HERE
        if(check[0].isGolden){
            embed.setColor(bot.colors.Yellow);
            embed.setTitle(`${name} ${sexIcon} <:gsleeve:553299310280835073>`);
        };
        embed.setImage(imgs[check[0].mainPic])
        imgNumber = check[0].mainPic;
        embed.addField(`Level:`, `${level}`, true);
        embed.setFooter(`You own this character - Picture ${check[0].mainPic+1}/${imgs.length}`, message.author.displayAvatarURL)
    }
    // Send embed
    let msg = await message.channel.send(embed);
    // Add reactions
    if(imgs.length > 1){
        await msg.react('◀');
        if(check.length > 0) await msg.react('*⃣');
        await msg.react('▶');
    }
    await msg.react('✖');

    if(fixMainPic){
        await bot.userinventories.updateOne(
            { userID: message.author.id, "characters.name": check[0].name },
            { $set: { "characters.$.mainPic" : 0 } }
        )
    }


//////////////////////////REACTION COLLECTORS///////////////////////////////////////////////////////////////////////////////////

    const back = (reaction, user) => { return reaction.emoji.name === '◀';};
    const set = (reaction, user) => { return reaction.emoji.name === '*⃣' && user.id === message.author.id;};
    const next = (reaction, user) => { return reaction.emoji.name === '▶';};
    const close = (reaction, user) => { return reaction.emoji.name === '✖' && user.id === message.author.id;};

    const collectorBack = msg.createReactionCollector(back, { time: 30000});
    const collectorSet = msg.createReactionCollector(set, { time: 30000});
    const collectorNext = msg.createReactionCollector(next, { time: 30000});
    const collectorClose = msg.createReactionCollector(close, { time: 30000});

    collectorBack.on('collect', async (reaction, reactionCollector) => {
        imgNumber-=1
        if(imgNumber < 0) imgNumber = (imgs.length-1);
        embed.setImage(imgs[imgNumber]);
        if (check.length > 0) embed.setFooter(`You own this character - Picture ${imgNumber+1}/${imgs.length}`, message.author.displayAvatarURL)
        else embed.setFooter(`Picture ${imgNumber+1}/${imgs.length}`)
        reaction.message.edit(embed);
        reaction.remove(reaction.users.keyArray()[1]);
    });
    collectorSet.on('collect', async (reaction, reactionCollector) => {
        if(check.length < 1) return;
        await bot.userinventories.updateOne(
            { userID: message.author.id, "characters.name": check[0].name },
            { $set: { "characters.$.mainPic" : imgNumber } }
        )
        message.channel.send("Picture set as main");
    });
    collectorNext.on('collect', async (reaction, reactionCollector) => {
        imgNumber+=1
        if(imgNumber > (imgs.length-1)) imgNumber = 0;
        embed.setImage(imgs[imgNumber]);
        if (check.length > 0) embed.setFooter(`You own this character - Picture ${imgNumber+1}/${imgs.length}`, message.author.displayAvatarURL)
        else embed.setFooter(`Picture ${imgNumber+1}/${imgs.length}`)
        reaction.message.edit(embed);
        reaction.remove(reaction.users.keyArray()[1]);

    });
    collectorClose.on('collect', async (reaction, reactionCollector) => {
        message.delete();
        msg.delete();
    });
}

module.exports.config = {
    name: "info",
    aliases: ["i", "inf", "information"]
}