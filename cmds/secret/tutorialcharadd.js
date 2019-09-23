const Discord = require("discord.js");
const fs = require("fs");

module.exports.run = async (bot, message, args) => { 

    if(message.author.id != 311979587242557442) return;
////////\n///////////////////////////////////////////////////////////////////////////////////////////////////
    let embed = new Discord.RichEmbed()
    .setColor(bot.colors.Green)
    .setTitle("Waifun Help - Add a character")
    .setDescription(`'${bot.prefix}add  Name ; Sex ; Franchise ; Image1,Image2 ; Category ; Short Description '\nYou can use spaces between the ';' separators. In case of multiple images, use ',' to separate them`)
    .addField("👤 Name",
    "The character's Name. Know that names are the unique identification of the character, so there can't be 2 with the same name, if this happens you can add the Franchise's name or initials to the character name: `Lilith already exists. Then add Lilith (Borderlands)`")
    .addField("👤 Sex",
    "The sex of the character, allowed options: `female (1, female, f, waifu, w), male (2, male, m, husbando, h), both (3, both, b), unknown (4, unknown, u)`")
    .addField("👤 Franchise",
    "Where does the character come from? Check if the Franchise you are trying to add the character to exists, when sending the character to moderation, where the franchise would show, there'll be a message telling you if the franchise you wrote was found, if there is one with a name similar to it, or if it'll be created. If you want to add it to the existing franchise then use the exact same name: `Naruto and Naruto Shippuden belong to the Naruto Franchise`, we don't create 2 versions of the same characters just because they look slightly different or are of a different age. In other example: `Fallout 3 and Fallout New Vegas could be different franchises, because they don't share characters and it's also worth considering that both have a massive amount of characters`.")
    .addField("📸 Images",
    "Pictures are 300x450 to maintain format, and jpg (best Quality/Size ratio and no alpha), if you don't have an image manipulation software in hand, you can just use 'crop' to quickly get your picture in the right format, then upload the picture to your Imgur folder and don't delete it, get the `Direct Link` (important) and you can use that as a picture for your character.\nIf you want more than 1 picture, separate the links with a ','. Example: `Image1,Image2,Image3`")    
    .addField("👤 Category",
    "Where did the character first appeared? Currently allowed options: `Anime/Manga, Games, Cartoons/Comics, Internet/Youtube` You can write the category in basically any way and it will take it, just check it's okay before sending, ex: `cartoon`.")
    .addField("👤 Description",
    "Optional -- A short description of the character, no more than 4 or 5 words to present the character, example: description of Allura from Voltron = `Princess of Altea`")
    .addField("✅ Example",
    "`;add Hugh Neutron;m;Jimmy Neutron: Boy Genius;https://i.imgur.com/cuErlA1.jpg,https://i.imgur.com/pVV6XUd.jpg;cartoons;Father of a Genius`")
    .setFooter(`After getting your line ready, head to the 'add' channel and send the line, then check if everything's fine and click the green tick send the character for moderation`);
    let msg = await message.channel.send(embed);
}

module.exports.config = {
    name: "tutorialcharadd",
    aliases: []
}