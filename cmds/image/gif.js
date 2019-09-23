const Discord = require('discord.js');
const snekfetch = require('snekfetch');

module.exports.run = async (bot, message, args) => {
    if(args.length < 1) {
        return message.reply (`Usage: ${bot.prefix}gif <tags> | to look for gifs on giphy.`);
    }
    let res = await snekfetch
        .get('http://api.giphy.com/v1/gifs/search')
        .query({
            q: args.join('+'),
            api_key: bot.apiKeys.giphyAPIKEY,
            rating: message.channel.nsfw ? 'r' : 'pg',
            limit: 5
        })

        let body = res.body
    if (!body.data.length) return message.reply(`Nothing found.`);
    let r = Math.floor(Math.random() * body.data.length);

    image = body.data[r].images.original.url;
    const embed = new Discord.RichEmbed()
        .setDescription(`[Sauce](${body.data[r].images.original.url})`)
        .setImage(image)
        .setColor(bot.colors.Green);
    return message.channel.send({ embed });
}

module.exports.config = {
    name: "gif",
    aliases: ["giphy"]
}