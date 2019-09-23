const Discord = require("discord.js");
const GoogleImages = require('google-images');

module.exports.run = async (bot, message, args) => { 
    const client = new GoogleImages(bot.apiKeys.googleCSEID, bot.apiKeys.googleAPIKEY);

    if(args.length < 1) {
        return message.reply (`Usage: ${bot.prefix}image <tags> | to look for images on Google Images.`);
    }
    let result = undefined;
    let resultCurrent = 0;

    let search = args.join(" ");

    // Search
    await client.search(search)
    .then(images => {
        result = images;
    });

    // Send result
    let embed = new Discord.RichEmbed()        
        .setColor(bot.colors.Green)
        .setTitle(`Search results for: **${search}**`)
        .setFooter(`Result ${resultCurrent+1} of ${result.length}`)
        .setImage(result[0].url);
    let msg = await message.channel.send(embed);
    // Add reactions
    if(result.length > 1){
        await msg.react('◀');
        await msg.react('▶');
    }
    // await msg.react(sleeveGolden);


//////////////////////////REACTION COLLECTORS///////////////////////////////////////////////////////////////////////////////////

    const back = (reaction, user) => { return reaction.emoji.name === '◀' && user.id !== msg.author.id};
    const next = (reaction, user) => { return reaction.emoji.name === '▶' && user.id !== msg.author.id};
    
    const collectorBack = msg.createReactionCollector(back, { time: 60000});
    const collectorNext = msg.createReactionCollector(next, { time: 60000});

    collectorBack.on('collect', async (reaction, reactionCollector) => {
        resultCurrent-=1
        if(resultCurrent < 0) resultCurrent = (result.length-1);
        embed.setImage(result[resultCurrent].url);
        embed.setFooter(`Result ${resultCurrent+1} of ${result.length}`)
        reaction.message.edit(embed);
        reaction.remove(reaction.users.keyArray()[1]);
    });
    collectorNext.on('collect', async (reaction, reactionCollector) => {
        resultCurrent+=1
        if(resultCurrent > (result.length-1)) resultCurrent = 0;
        embed.setImage(result[resultCurrent].url);
        embed.setFooter(`Picture ${resultCurrent+1} of ${result.length}`)
        reaction.message.edit(embed);
        reaction.remove(reaction.users.keyArray()[1]);
    });
}

module.exports.config = {
    name: "image",
    aliases: ["img","images", "search"]
}