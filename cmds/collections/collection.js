const Discord = require("discord.js");
const mongoose = require("mongoose");

module.exports.run = async (bot, message, args) => {

    if(args[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}collection | to see your collected characters\n${bot.prefix}collection @mention | to see someone else's collection`);
    }

    let inventory = undefined;
    let user = undefined;
    // If you want to show mentioned user collection
    if(message.mentions.users.first()){
        inventory = await bot.userinventories.findOne({ userID: message.mentions.users.first().id });
        user = message.mentions.users.first();
        if(!inventory) return message.reply(`${message.mentions.users.first()} hasn't started playing yet. Encourage them!`)
    }else{
        // If you want to see your collection
        inventory = await bot.userinventories.findOne({ userID: message.author.id });
        user = message.author;
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
                leveling: "None",
            });
            await newUser.save();
            inventory = await bot.userinventories.findOne({ userID: message.author.id });
            message.reply(`Welcome to Waifun! You got a free extra **Sleeve**, use Sleeves to catch characters you want, you get Sleeves by either using 'claim' every 3 hours or grabbing them when they randomly drop. You can now start using 'claim' to get your Sleeves and 'spawn' to spawn a random character, object or event. Good Luck!`)    
        }
    }

    // get characters and check if there is at least 1
    characters = inventory.get('characters');
    if(characters.length < 1) return message.channel.send(`${user} currently has no characters.`)
    
    let nameList = "";
    let nameListArray = [];
    // IF USER HAS ALL CHARACTERS, CHANGE EMBED TITLE WITH THIS ICON 🏆
    // Foreach franch character, check if user has it
    await characters.forEach(chara => {
        if(chara.isGolden) nameListArray.push(chara.name+ "<:gsleeve:553299310280835073>")
        else nameListArray.push(chara.name)
    });
    await nameListArray.sort();
    await nameListArray.forEach(name => {
        nameList += `${name}\n`;
    });

    // Build embed
    let embed = new Discord.RichEmbed()
        .setColor(bot.colors.Green)
        .setTitle(` - ${user.username}'s collection - `) // (${charsFrom}) to set from where are t he chars
        .setDescription(nameList)
        .setFooter(`Showing all results`);
    // Add characters to embed
    // let fields = [];
    // let check = 0;
    // let char = undefined;
    // let fieldsDone = 0;
    // let charsDone = 0;
    // let charsDoneArray = [0];

    if(inventory.favorite && inventory.favorite !== "None"){
        char = await bot.characters.findOne({ name: inventory.get('favorite') });
        embed.setThumbnail(char.get('images').split(",")[0])
    }
    else {
        char = await bot.characters.findOne({ name: characters[characters.length-1].name });
        embed.setThumbnail(char.get('images').split(",")[0])
    }
    // Send embed
    let msg = await message.channel.send(embed);
    
    // await msg.react('◀');
    // await msg.react('▶');
    await msg.react('✖');

//////////////////////////REACTION COLLECTORS///////////////////////////////////////////////////////////////////////////////////

    // const back = (reaction, user) => { return reaction.emoji.name === '◀';};
    // const next = (reaction, user) => { return reaction.emoji.name === '▶';};
    const close = (reaction, user) => { return reaction.emoji.name === '✖' && user.id === message.author.id;};

    // const collectorBack = msg.createReactionCollector(back, { time: 30000});
    // const collectorNext = msg.createReactionCollector(next, { time: 30000});
    const collectorClose = msg.createReactionCollector(close, { time: 30000});
    
    // collectorNext.on('collect', async (reaction, reactionCollector) => {
    //     fields = [];
    //     embed.fields = [];
    //     fieldsDone = 0;
    //     charsDone = charsDoneArray[charsDoneArray.length-1]
    //     // Get characters and franchises list
    //     for (let i = charsDoneArray[charsDoneArray.length-1]; i < characters.length; i++) {
    //         const chara = characters[i];
    //         if(fieldsDone >= 10) {
    //             charsDoneArray.push(charsDone);
    //             break;
    //         }
    //         charsDone++;
    //         char = await bot.characters.findOne({ name: chara.name });
    //         franch = await char.get('franch');
    //         if (franch.length > 26) franch = franch.slice(0, 20)+"...";
    //         if (chara.length > 26) chara = chara.slice(0, 20)+"...";
            
    //         check = await fields.indexOf(franch);
    //         if(check === -1){
    //             fieldsDone++;
    //             fields.push(franch);
    //             if(chara.isGolden === true) embed.addField(franch, `${chara.name} <:gsleeve:553299310280835073>`, true);
    //             else embed.addField(franch, chara.name, true);
    //         }
    //         else{
    //             if(chara.isGolden === true) embed.fields[check].value += `\n${chara.name} <:gsleeve:553299310280835073>`;
    //             else embed.fields[check].value += `\n${chara.name}`;
    //         }
    //     }
    //     if(charsDone >= characters.length) msg.clearReactions();
    //     else reaction.remove(reaction.users.keyArray()[1]);
    //     await msg.edit(embed);
    // });
    collectorClose.on('collect', async (reaction, reactionCollector) => {
        message.delete();
        msg.delete();
    });
}

module.exports.config = {
    name: "collection",
    aliases: ["coll"]
}