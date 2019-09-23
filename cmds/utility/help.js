const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => { 

////////\n///////////////////////////////////////////////////////////////////////////////////////////////////

    let embed = new Discord.RichEmbed()
        .setColor(bot.colors.Green)
        .setTitle("Waifun Help - Commands")
        .setDescription("Join our Discord channel by [clicking here](https://discord.gg/8VkZqsH)")
        .addField("🔘 Collections",
        "        ```CSS\nclaim\nspawn\ninfo\nlevel\nfavorite\nfranch\ncollection\ninventory\ngive\ntrade\nburn\nannihilate\ndelete\nadd\nobj\nuse```", true)
        .addField("---------------------Description---------------------",
        "        ```Get a sleeve (3 hours cd)\nSpawn a character, object, event\nInfo of character, object, event\nTrain a character to level up\nSet a character as favorite\nCheck a franchise's info\nShows a collection\nShows a user inventory\nGift a character\nTrade characters\nDispose of a character\nAnnihilate your collection\nDelete your inventory\nAdds a character to Waifun\nSee objects info\nUse an object```", true)
        .addField("😂 Fun",
        "        ```CSS\nsay\nwiki\nclev\nroll```", true)
        .addField("---------------------Description---------------------",
        "        ```Makes the bot say something for u\nSearch wiki pages\nTalk to cleverbot\nRoll a d&d die```", true)
        .addField("🖼 Image",
        "        ```CSS\navatar\nimage\ngif\nmeme\ndeletis\nsonic\neinstein\nghandhi\nlizard```", true)
        .addField("---------------------Description---------------------",
        "        ```Shows a user's avatar\nSearch google images\nSearch gifs on giphy\nGet a meme from reddit\nDemand'em to delete content\nSonic says something\nEinstein says something\nGhandhi says something\nRandom lizard pic```", true)
        .addField("🖼 Image-Manipulation",
        "        ```CSS\nimpact\ninvert\ngray\ndf\nmagik\nyoutube\nblur\ncycle\npaint\nswirl\ncrop```", true)
        .addField("---------------------Description---------------------",
        "        ```Impact meme generator\nInvert last picture\nBlack'n'White last picture\nDeep Fry last picture\nDeform a picture\nTransform picture to yt video\nBlur last picture\nCycle pixels last picture\nPaint effect last picture\nSwirl last picture\nCrop picture for Waifun use```", true)
        .addField("---------------------Description---------------------",
        "        ```Look for hentai on a random site\nLook for a hentai pic on danbooru\nLook for a hentai pic on gelbooru\nLook for a hentai pic on rule34\nLook for a hentai pic on konachan\nLook for a hentai pic on yandere\nLook for a hentai pic on xbooru\nLook for hentai'nt on safebooru\nLook for a hentai pic on tbib```", true)
        .addField("🛠 Utility",
        "        ```CSS\nhelp\ninvite\nvote\nuserinfo\nping\npong\ncalc\ntranslate```", true)
        .addField("---------------------Description---------------------",
        "        ```Shows this\nGet invitation links\nVote for me and get prizes\nShows a user's info\nPing\nPong\nShows character categories\nMake a calculation\nTranslate a text```", true)
        .addField("⚙ Settings",
        "        ```CSS\nchannel\nblock\nprefix```", true)
        .addField("---------------------Description---------------------",
        "        ```Set channel, use 'channel help'\nBlock a channel\nChange prefix```", true)
        .setFooter(`Version 2.2.0 'The fun has arrived!" (60 commands) - You can use ${bot.prefix}<command> help on every command for more detailed info and syntax definitions`);
    if(args[0] === "here") return message.channel.send(embed);
    else message.author.send(embed);
}


module.exports.config = {
    name: "help",
    aliases: ["h"]
}