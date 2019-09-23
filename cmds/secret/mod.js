const Discord = require("discord.js");
const mongoose = require("mongoose");

async function addCharacterToDatabase(bot, message, char){
    let characters = new bot.characters({
        _id: mongoose.Types.ObjectId(),
        name: char.get('name'),
        sex: char.get('sex'),
        franch: char.get('franch'),
        images: char.get('images'),
        category: char.get('category'),
        description: char.get('description'),
        popularity: 0,
        createdBy: char.get('createdBy')
    });
    // Save character to characters
    await characters.save();
    // Remove character from checklists
    await bot.checklists.findOneAndDelete({ name: char.get('name') });
    // send another message as dm to the author of the character
    message.channel.send(`Character **${char.get('name')}** approved.`);
}

// NOT UPDATING FROM WHICH CATEGORY CHARACTERS COME FROM
async function addCharacterToFranchise(bot, message, char){
    let thisFranch = await bot.franchises.findOne({ name: char.get('franch') })
    // If franchise exists, update it
    if(thisFranch){
        let fromAnimeManga = thisFranch.get('fromAnimeManga');
        let fromGames = thisFranch.get('fromGames');
        let fromCartoonsComics = thisFranch.get('fromCartoonsComics');
        let fromInternetYoutube = thisFranch.get('fromInternetYoutube');
        if(char.get('category') == 1) fromAnimeManga++;
        else if(char.get('category') == 2) fromGames++;
        else if(char.get('category') == 3) fromCartoonsComics++;
        else if(char.get('category') == 4) fromInternetYoutube++;
        // Update the new data
        await bot.franchises.updateOne({ name: char.get('franch') }, 
            { $set: 
                {
                fromAnimeManga: fromAnimeManga,
                fromGames: fromGames,
                fromCartoonsComics: fromCartoonsComics,
                fromInternetYoutube: fromInternetYoutube
                }
            })
        await bot.franchises.updateOne({ name: char.get('franch') }, 
            { $push: 
                { 
                characters: char.get('name')
                }
            })
        return message.channel.send(`Added to: **${thisFranch.get('name')}**.`);
    }else{
        // Get character category
        let fromAnimeManga = 0;
        let fromGames = 0;
        let fromCartoonsComics = 0;
        let fromInternetYoutube = 0;
        if(char.get('category') == 1) fromAnimeManga++;
        else if(char.get('category') == 2) fromGames++;
        else if(char.get('category') == 3) fromCartoonsComics++;
        else if(char.get('category') == 4) fromInternetYoutube++;

        // Create franchise
        let franchise = new bot.franchises({
            _id: mongoose.Types.ObjectId(),
            name: char.get('franch'),
            fromAnimeManga: fromAnimeManga,
            fromGames: fromGames,
            fromCartoonsComics: fromCartoonsComics,
            fromInternetYoutube: fromInternetYoutube,
            thumbnail: null,
        });
        // Save new franchise to franchises
        await franchise.save();
        // Add character to created franchise
        await bot.franchises.updateOne({ name: char.get('franch') }, 
        { $push: 
            { 
            characters: char.get('name')
            }
        })
        message.channel.send(`New franchise started: **${char.get('franch')}**.`);
    }
}

///////////////////////////////////////////////////////////////////////////////////////////

module.exports.run = async (bot, message, args) => {

    if(message.author.id != 311979587242557442) return; 

    if(args[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}mod | to moderate the first character in checklist\n${bot.prefix}mod next <number>(optional) | to get the next or the <number> next character to moderate\n${bot.prefix}mod <name> | to find a character to moderate by name`);
    }

    let char = undefined;
    let charName = "";

    if(args.length < 1){
        // Find first create
        char = await bot.checklists.findOne({}).sort({date: 'asc'});
    }else if(args[0] === "next"){
        // Find the next to the first created
        let nextNumber = 1;
        if(args[1]) nextNumber = args[1];
        let chars = await bot.checklists.find({}).sort({date: 'asc'});
        char = chars[nextNumber];
    }else{
        // Find one by name
        let name = args.join(" ");
        let regexp = new RegExp(name, "i");
        char = await bot.checklists.findOne({ name: regexp });
    }
    // If there isn't any character or by that name
    if (!char) {
        return message.reply(`Could not find character ${charName}`);
    }
    // Set icons for sex
    let male = "<:male:538223014727122944>";
    let female = "<:female:538223014710476810>";
    // NEED TO ADD ICONS FOR BOTH AND OTHER
    let both = "<:male:538223014727122944><:female:538223014710476810>";
    let unknown = "❔";
    let sex = "";
    if(char.get('sex') == 1) sex = female;
    else if(char.get('sex') == 2) sex = male;
    else if(char.get('sex') == 3) sex = both;
    else if(char.get('sex') == 4) sex = unknown;

    // Get category name
    let categoryName = "";
    if(char.get('category') == 1) categoryName = "Anime/Manga";
    else if(char.get('category') == 2) categoryName = "Games";
    else if(char.get('category') == 3) categoryName = "Cartoons/Comics";
    else if(char.get('category') == 4) categoryName = "Internet/Youtube";

    // Separate images into an array
    let imgNumber = 0;
    let imgs = char.get('images').split(",");

    // Show character
    let embed = new Discord.RichEmbed()
        .setColor(bot.colors.Yellow)
        .setTitle(`${char.get('name')} ${sex}`)
        .setDescription(`${char.get('franch')}\n${categoryName}\n${char.get('description')}`)
        .setFooter(`Picture ${imgNumber+1}/${imgs.length}`)
        .setImage(imgs[imgNumber]);
    let msg = await message.channel.send(embed);
    // Add reactions
    if(imgs.length > 1){
        await msg.react('◀');
        await msg.react('*⃣');
        await msg.react('▶');
    }
    await msg.react('✅');
    await msg.react('❌');
    await msg.react('✖');


//////////////////////////REACTION COLLECTORS///////////////////////////////////////////////////////////////////////////////////

    const back = (reaction, user) => { return reaction.emoji.name === '◀' && user.id === message.author.id;};
    const set = (reaction, user) => { return reaction.emoji.name === '*⃣' && user.id === message.author.id;};
    const next = (reaction, user) => { return reaction.emoji.name === '▶' && user.id === message.author.id;};
    const send = (reaction, user) => { return reaction.emoji.name === '✅' && user.id === message.author.id;};
    const cancel = (reaction, user) => { return reaction.emoji.name === '❌' && user.id === message.author.id;};
    const close = (reaction, user) => { return reaction.emoji.name === '✖' && user.id === message.author.id;};

    const collectorBack = msg.createReactionCollector(back, { time: 60000});
    const collectorSet = msg.createReactionCollector(set, { time: 60000});
    const collectorNext = msg.createReactionCollector(next, { time: 60000});
    const collectorApprove = msg.createReactionCollector(send, {max: 1, maxEmojis: 1, time: 60000});
    const collectorDisapprove = msg.createReactionCollector(cancel, {max: 1, maxEmojis: 1, time: 60000});
    const collectorClose = msg.createReactionCollector(close, {max: 1, maxEmojis: 1, time: 60000});

    collectorBack.on('collect', async (reaction, reactionCollector) => {
        imgNumber-=1
        if(imgNumber < 0) imgNumber = (imgs.length-1);
        embed.setImage(imgs[imgNumber]);
        embed.setFooter(`Picture ${imgNumber+1}/${imgs.length}`)
        reaction.message.edit(embed);
        reaction.remove(reaction.users.keyArray()[1]);
    });
    collectorSet.on('collect', async (reaction, reactionCollector) => {
        message.channel.send("Picture set as main");
    });
    collectorNext.on('collect', async (reaction, reactionCollector) => {
        imgNumber+=1
        if(imgNumber > (imgs.length-1)) imgNumber = 0;
        embed.setImage(imgs[imgNumber]);
        embed.setFooter(`Picture ${imgNumber+1}/${imgs.length}`)
        reaction.message.edit(embed);
        reaction.remove(reaction.users.keyArray()[1]);
    });
    collectorApprove.on('collect', async (reaction, reactionCollector) => {
        msg.clearReactions();
        addCharacterToDatabase(bot, message, char);
        addCharacterToFranchise(bot, message, char);
    });
    collectorDisapprove.on('collect', async (reaction, reactionCollector) => {
        msg.clearReactions();
        // Remove character from checklists
        await bot.checklists.findOneAndDelete({ name: char.get('name') });
        message.channel.send(`${char.get('name')} was not approved.`);
    });
    collectorClose.on('collect', async (reaction, reactionCollector) => {
        message.delete();
        msg.delete();
    });
}

module.exports.config = {
    name: "mod",
    aliases: []
}