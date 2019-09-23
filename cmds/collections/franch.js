const Discord = require("discord.js");
const stringSimilarity = require('string-similarity');

module.exports.run = async (bot, message, args) => {
    if(args[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}franch <name> | to get info and character list of a franchise`);
    }
    if(args.length < 1){
        // LIST ALL FRANCHISES
        let franch = await bot.franchises.find();
        let franchList = "";
        let franchiseArray = [];
        let franchiseAmount = 0;
        await franch.forEach(franchise => {
            franchiseArray.push(franchise.get('name'));
        });
        await franchiseArray.sort();
        await franchiseArray.forEach(franchise => {
            franchiseAmount++;
            franchList += `${franchise}\n`
        });
        let embed = new Discord.RichEmbed()
            .setColor(bot.colors.Green)
            .setTitle(`Available Franchises`)
            .setDescription(`${franchList}`)
            .setFooter(`There are currently ${franchiseAmount} franchises.`);
        let msg = await message.channel.send(embed);
        return;
    }

    let franchName = args.join(" ");
    // Find best math and check if franchise exists
    let names = [];
    // Escape all characters inside the variable
    franchName = franchName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    let regexp = new RegExp(franchName, "i");
    // Find all franchises matching regexp
    let franch = await bot.franchises.find({ name: regexp });
    if (franch.length < 1) return message.reply(`Could not find franchise: **${franchName}**`);
    await franch.forEach(franchise => names.push(franchise.name));
    // Compare user input and gotten franchises to get best match
    let match = await stringSimilarity.findBestMatch(franchName, names);
    franch = await bot.franchises.findOne({name: match.bestMatch.target});

    let characters = franch.get('characters');
    characters.sort();
    let nameList = "";

    let gottenCharacters = {};
    let gottenAmount = 0;
    // Get user characters
    let user = await bot.userinventories.findOne({ userID: message.author.id });
    if(user){
        gottenCharacters = user.get('characters')
    }

    // IF USER HAS ALL CHARACTERS, CHANGE EMBED TITLE WITH THIS ICON 🏆
    // Foreach franch character, check if user has it
    if(user){
        characters.forEach(chara => {
            check = gottenCharacters.filter(char => char.name === chara);
            if(check.length > 0){
                gottenAmount++;
                nameList += `**${chara} ***\n`
            }else{
                nameList += `${chara}\n`;
            }
        });
    }else characters.forEach(chara => nameList += `${chara}\n`);

    // Add characters category in title
    let charsFrom = ``;
    let fromAnimeManga = franch.get('fromAnimeManga')
    let fromGames = franch.get('fromGames')
    let fromCartoonsComics = franch.get('fromCartoonsComics')
    let fromInternetYoutube = franch.get('fromInternetYoutube')
    let charsTotal = fromAnimeManga+fromGames+fromCartoonsComics+fromInternetYoutube;

    if(fromAnimeManga > 0) charsFrom+= `${fromAnimeManga} from Anime/Manga`;

    if(fromGames > 0){
        if(fromAnimeManga > 0) charsFrom+=`, `;
        charsFrom+= `${fromGames} from Games`;
    }
    if(fromCartoonsComics > 0){
        if(fromAnimeManga > 0 || fromGames > 0) charsFrom+=`, `;
        charsFrom+= `${fromCartoonsComics} from Cartoons/Comics`;
    }
    if(fromInternetYoutube > 0){
        if(fromAnimeManga > 0 || fromCartoonsComics > 0 || fromGames > 0) charsFrom+=`, `;
        charsFrom+= `${fromInternetYoutube} from Internet/Youtube`;
    }

    let embed = new Discord.RichEmbed()
        .setColor(bot.colors.Green)
        .setTitle(`${franch.get('name')}`)
        .setDescription(`(${charsFrom})\n${nameList}`)
        .setFooter(`You have ${gottenAmount}/${charsTotal} characters`);
    if(gottenAmount == charsTotal) {
        embed.setTitle(`${franch.get('name')} 🏆`)
        await embed.setFooter(`You have all ${charsTotal} characters!`);
    }
    let msg = await message.channel.send(embed);
    // if(imgs.length > 1){
    //     await msg.react('◀');
    //     await msg.react('*⃣');
    //     await msg.react('▶');
    // }
    await msg.react('✖');

    const back = (reaction, user) => { return reaction.emoji.name === '◀';};
    const set = (reaction, user) => { return reaction.emoji.name === '*⃣' && user.id === message.author.id;};
    const next = (reaction, user) => { return reaction.emoji.name === '▶';};
    const close = (reaction, user) => { return reaction.emoji.name === '✖' && user.id === message.author.id;};

    const collectorBack = msg.createReactionCollector(back, { time: 30000});
    const collectorSet = msg.createReactionCollector(set, { time: 30000});
    const collectorNext = msg.createReactionCollector(next, { time: 30000});
    const collectorClose = msg.createReactionCollector(close, { time: 30000});

    collectorBack.on('collect', async (reaction, reactionCollector) => {
        // imgNumber-=1
        // if(imgNumber < 0) imgNumber = (imgs.length-1);
        // embed.setImage(imgs[imgNumber]);
        // embed.setFooter(`Picture ${imgNumber+1}/${imgs.length}`)
        // reaction.message.edit(embed);
    });
    collectorSet.on('collect', async (reaction, reactionCollector) => {
        // message.channel.send("Picture set as main");
    });
    collectorNext.on('collect', async (reaction, reactionCollector) => {
        // imgNumber+=1
        // if(imgNumber > (imgs.length-1)) imgNumber = 0;
        // embed.setImage(imgs[imgNumber]);
        // embed.setFooter(`Picture ${imgNumber+1}/${imgs.length}`)
        // reaction.message.edit(embed);

    });
    collectorClose.on('collect', async (reaction, reactionCollector) => {
        message.delete();
        msg.delete();
    });
}

module.exports.config = {
    name: "franch",
    aliases: ["franchise", "fr", "f"]
}