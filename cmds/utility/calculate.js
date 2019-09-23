const Discord = require("discord.js");
const math = require('mathjs')

module.exports.run = async (bot, message, args) => {
    if(args.length < 1 || args[0] === "help") return message.reply(`Usage: ${bot.prefix}calculate @<name> | to make a calculation.`);

    let resp;
    try{
        resp = math.eval(args.join(" "))
    }catch(err){
        return message.channel.send("You didn't input a valid calculation.")
    }

    let embed = await new Discord.RichEmbed()
        .setColor(bot.colors.Green)
        .setTitle("Calculator")
        .addField("Input", `\`\`\`js\n${args.join(" ")}\`\`\``)
        .addField("Output", `\`\`\`js\n${resp}\`\`\``)
    message.channel.send(embed);

}

module.exports.config = {
    name: "calculate",
    aliases: ["calc"]
}