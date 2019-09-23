const Discord = require("discord.js");
const fs = require("fs");

module.exports.run = async (bot, message, args) => { 

    if(message.author.id != 311979587242557442) return;
////////\n///////////////////////////////////////////////////////////////////////////////////////////////////
    let embed = new Discord.RichEmbed()
    .setColor(bot.colors.Green)
    .setTitle("Waifun Help - Suggest a character")
    .setDescription(`To suggest characters, you need to head to the 'manual-suggest' channel and suggest characters as shown below (Description is optional)`)
    .addField("Example: One Character",
    "Name: Jotaro\nSex: male\nFrom: JoJo's Bizarre Adventure\nImage: https://i.redd.it/ku62mqd97k711.png\nCategory: anime\nDescription: I don't know, omae wa mou shinderu\n")
    .addField("Example: Many Characters",
    "Portal (Games)\nMale: Wheatley, Cave Johnson\nFemale: GlaDOS, Chell\nUnknown: Sentry Turret\n")
    .addField("Also",
    "Suggesting characters is always welcome, don't worry if you miss a bit of info or you didn't use the format, as long as it's readable and you don't spam the channel, it'll be okay. Every little bit of help is welcome!")
    let msg = await message.channel.send(embed);
}

module.exports.config = {
    name: "tutorialsuggest",
    aliases: []
}