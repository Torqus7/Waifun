const Discord = require('discord.js');
const translate = require('@vitalets/google-translate-api');

module.exports.run = async (bot, message, args) => {
    if(args.length < 1 || args[0] == "help"){
        return message.reply (`Usage: ${bot.prefix}translate <lang> <text> | to translate your text to given language.`);
    }
    const lang = args[0];
    const input = args.slice(1).join(" ");

    try {
        translate(input, { to: lang }).then(res => {
            const embed = new Discord.RichEmbed()
                .setAuthor('Translation result:')
                .setColor(bot.colors.Green)
                .addField(`Input: \`[auto]\``, `\`\`\`${input}\`\`\``)
                .addField(`Output: \`[${lang}]\``, `\`\`\`${res.text}\`\`\``);
            if(res.from.text.didYouMean) embed.setFooter("Auto-corrected");
            return message.channel.send({ embed });
        }).catch(err => {
            return message.reply(`That language isn't valid!`)
        })

    } catch (err) {
        return message.reply(`Something went wrong while doing your translation.`);
    }
}

module.exports.config = {
    name: "translate",
    aliases: ["trans"]
}