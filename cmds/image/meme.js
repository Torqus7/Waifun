const Discord = require('discord.js');
const randomPuppy = require('random-puppy');

module.exports.run = async (bot, message, args) => {
    if(args[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}gif <tags> | to look for gifs on giphy.`);
    }

    let subreddits = [
        "memes",
        "DeepFriedMemes",
        "bonehurtingjuice",
        "surrealmemes",
        "dankmemes",
        "meirl",
        "me_irl",
        "funny"
    ]
    var subr = subreddits[Math.round(Math.random() * (subreddits.length - 1))];

    randomPuppy(subr)
        .then(url => {
            const embed = new Discord.RichEmbed()
                .setFooter(`${subr}`)
                .setDescription(`[Sauce](${url})`)
                .setImage(url)
                .setColor(bot.colors.Green);
            return message.channel.send({ embed });
        })
}

module.exports.config = {
    name: "meme",
    aliases: ["meem","mimi"]
}