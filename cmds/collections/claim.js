const Discord = require("discord.js");
const parser = require('cron-parser');
const mongoose = require("mongoose");
const claimedRecently = new Set();

module.exports.run = async (bot, message, args) => {

    if(args[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}claim | to claim sleeves and other items. One use for every 3 hours.`);
    }
    
    if (claimedRecently.has(message.author.id)) {
        return message.reply("You are claiming too fast (1 second cooldown).");
    }
    else{
        claimedRecently.add(message.author.id);
        setTimeout(() => {
        claimedRecently.delete(message.author.id);
        }, 1000);
    }

    // If user doesn't exist, add them to the database
    let user = await bot.userinventories.findOne({ userID: message.author.id });
    if(!user){
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
        // Save user to userinventories
        await newUser.save();
        user = await bot.userinventories.findOne({ userID: message.author.id });
        message.reply(`Welcome to Waifun! You got a free extra **Sleeve**, use Sleeves to catch characters you want, you get Sleeves by either using 'claim' every 3 hours or grabbing them when they randomly drop. You can now start using 'claim' to get your Sleeves and 'spawn' to spawn a random character, object or event. Good Luck!`)
    }

    // Check if the user can use get
    if(user.get('getUses') < 1){
        let options = {
            tz: 'Etc/UTC'
          };
        let interval = parser.parseExpression('0 0 1-23/3 * * *', options);

        let nextInterval = interval.next().toDate();
        let date = new Date();
        let time = Math.abs(nextInterval.getTime() - date.getTime());
        let seconds = Math.ceil(time / 1000);
        let minutes = seconds/60;
        let hours = minutes/60;
        let claimedText = "You have already claimed rewards."

        if(hours<1){
            return message.reply(`${claimedText} Time remaining: **${minutes.toString().split(".")[0]} minutes**`);
        }else if(hours<2){
            if (minutes-60<10) return message.reply(`${claimedText} Time remaining: **${hours.toString().split(".")[0]}:0${(minutes-60).toString().split(".")[0]} hours**`)
            return message.reply(`${claimedText} Time remaining: **${hours.toString().split(".")[0]}:${(minutes-60).toString().split(".")[0]} hours**`)
        }else if(hours<3){
            if (minutes-120<10) return message.reply(`${claimedText} Time remaining: **${hours.toString().split(".")[0]}:0${(minutes-120).toString().split(".")[0]} hours**`)
            else return message.reply(`${claimedText} Time remaining: **${hours.toString().split(".")[0]}:${(minutes-120).toString().split(".")[0]} hours**`)
        }
        if (minutes-120<10) return message.reply(`${claimedText} Time remaining: **${hours.toString().split(".")[0]}:0${(minutes-120).toString().split(".")[0]} hours**`)
        return message.reply(`${claimedText} Time remaining: **${hours.toString().split(".")[0]}:${minutes.toString().split(".")[0]} hours**`)
    }

    // Rest 1 to amount of get uses
    let get = user.get('getUses')-1;

    let commonSleeve = "<:csleeve:552260004925669377>";
    let goldenSleeve = "<:gsleeve:553299310280835073>";

    // Check if the user will get a ultra rare golden sleeve
    let rewards = `${commonSleeve} A **Sleeve**`;
    let goldSleeve = 0
    let r = Math.floor(Math.random()*100);
    let goldChance = 2;
    if(user.get('voteUses') === true) goldChance = 5;
    // Chances to get it
    if(r < goldChance) {
        goldSleeve = 1;
        rewards += ` and ${goldenSleeve} a **Golden Sleeve**! Congratulations!`;
    }

    // Add claimed items to inventory
    await bot.userinventories.updateOne({ userID: message.author.id }, 
    { $set: 
        { 
            getUses: get,
            sleeves: user.get('sleeves')+1,
            goldSleeves: user.get('goldSleeves')+goldSleeve
        }
    })

    // Praise the user
    let embed = new Discord.RichEmbed()
    .setColor(bot.colors.Green)
    .setTitle(`${message.author.username} Claims`)
    .setDescription(`You Got: ${rewards}`)
    message.channel.send(embed);
}

module.exports.config = {
    name: "claim",
    aliases: ["g","get","c"]
}