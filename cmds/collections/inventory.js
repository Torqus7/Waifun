const Discord = require("discord.js");
const mongoose = require("mongoose");

module.exports.run = async (bot, message, args) => {

    if(args[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}collection | to see your collected characters`);
    }
    
    let inventory = await bot.userinventories.findOne({ userID: message.author.id });
    // Create inventory if it doesn't exist
    if(!inventory){
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
        inventory = await bot.userinventories.findOne({ userID: message.author.id });
        return message.reply(`Welcome to Waifun! You got a free extra **Sleeve**, use Sleeves to catch characters you want, you get Sleeves by either using 'claim' every 3 hours or grabbing them when they randomly drop. You can now start using 'claim' to get your Sleeves and 'spawn' to spawn a random character, object or event. Good Luck!`)    
    }

    let levelingText = "";
    // Get current leveling character name
    if(inventory.get('leveling')) levelingText = inventory.get('leveling');
    else levelingText = "None";

    // Build embed
    let embed = new Discord.RichEmbed()
        .setColor(bot.colors.Green)
        .setTitle(` - ${message.author.username}'s Inventory - `)
        .setThumbnail(message.author.displayAvatarURL)
        .setDescription(`Here's what you have:`)
        .addField(`<:csleeve:552260004925669377> Sleeves:`,`${inventory.get('sleeves')}`, true)
        .addField(`<:gsleeve:553299310280835073> Golden Sleeves:`,`${inventory.get('goldSleeves')}`, true)
        .addField(`Total Characters:`,`${inventory.get('characters').length}`, true)
        .addField(`Objects:`,`${inventory.get('objects').length}`, true)
        .addField(`Events:`,`${inventory.get('events').length}`, true)
        .addField(`Leveling:`,`${levelingText}`, true)
        .setFooter(`Showing all results`);
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
    name: "inventory",
    aliases: ["inv", "b"]
}