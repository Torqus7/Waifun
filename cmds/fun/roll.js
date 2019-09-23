const Discord = require("discord.js");
const Roll = require('roll'),
roll = new Roll();

module.exports.run = async (bot, message, args) => {
    if(args.length < 1 || args[0] === "help") return message.reply(`Usage: ${bot.prefix}roll <die(s)> | to make a throw.\nRoll Examples: '1d20' | '2d6+1+1d4' | '2d6 + 2d8 + 3d5' | '2d6*2 + 6d4/4'`);
    
    let numbers;
    let terminate;

    await args.forEach(die => {
        numbers = die.match(/\d+/g).map(Number)
        if(numbers.some(n => n > 2000)) terminate = true;
    });
    if(terminate) return message.reply("You can't imput a number over 2000");

    let input = args.join(" ");
    let die;

    try{
        die = await roll.roll(input);
    }catch(err){
        return message.reply("Can't roll that die.\nRoll Examples: '1d20' | '2d6+1+1d4' | '2d6 + 2d8 + 3d5' | '2d6*2 + 6d4/4'`");
    }

    let embed = await new Discord.RichEmbed()
        .setColor(bot.colors.Green)
    if(input.length > 60) input = "a lot"
        embed.setTitle(`Rolled ${input}`)
    if(die.rolled.toString().length > 1000) die.rolled = "Too Big";
        embed.addField("Rolls", `\`\`\`\n${die.rolled}\`\`\``)
        .addField("Result", `\`\`\`js\n${die.result}\`\`\``)
    message.channel.send(embed);
}

module.exports.config = {
    name: "roll",
    aliases: ["r"]
}