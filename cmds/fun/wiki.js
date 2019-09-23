const Discord = require("discord.js");
const wiki = require('wikijs').default;

module.exports.run = async (bot, message, args) => { 

    // Usage info
    if(args[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}wiki <article> | to look for a wiki article.\n`);
    }

    let search = args.join(" ");
    if(args.length > 0){
        // { raw:
        //     { pageid: 28381,
        //       ns: 0,
        //       title: 'Superman',
        //       contentmodel: 'wikitext',
        //       pagelanguage: 'en',
        //       pagelanguagehtmlcode: 'en',
        //       pagelanguagedir: 'ltr',
        //       touched: '2019-02-22T06:16:21Z',
        //       lastrevid: 884429806,
        //       length: 151648,
        //       fullurl: 'https://en.wikipedia.org/wiki/Superman',
        //       editurl:
        //        'https://en.wikipedia.org/w/index.php?title=Superman&action=edit',
        //       canonicalurl: 'https://en.wikipedia.org/wiki/Superman' },
        //    html: [Function: html],
        //    content: [Function: content],
        //    summary: [Function: summary],
        //    images: [Function: images],
        //    references: [Function: references],
        //    links: [Function: links],
        //    categories: [Function: categories],
        //    coordinates: [Function: coordinates],
        //    info: [Function: s],
        //    backlinks: [Function: backlinks],
        //    rawImages: [Function: h],
        //    mainImage: [Function: mainImage],
        //    langlinks: [Function: langlinks],
        //    rawInfo: [Function: p],
        //    fullInfo: [Function: fullInfo],
        //    tables: [Function: tables],
        //    lists: [Function: lists] }

        site = await wiki().page(search).then(page => { return page; });
        // await site.info().then(console.log);
        image = await site.mainImage();
        summary = await site.summary();
        if(summary.length > 600){
            summary = summary.substring(0, 600)+"...";
        }
        let embed = await new Discord.RichEmbed()        
            .setColor(bot.colors.Green)
            .setTitle(`${site.raw.title}`)
            .setDescription(`${summary}\n[Click here to open full page](${site.raw.fullurl})`)
            .setImage(image);
        message.channel.send(embed);
    }
}

module.exports.config = {
    name: "wiki",
    aliases: []
}