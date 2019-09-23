const gm = require('gm');
const wrap = require('word-wrap');

module.exports.run = async (bot, message, args) => {

    let help = `Usage: ${bot.prefix}sonic <text> | to make Sonic say something epic`

    if(args[0] == "help") {
        return message.reply (help);
    }

    let image = `./assets/images/SonicSays.png`;
    let img = `./assets/gmedits/test/sonic${message.author.id}.png`;
    message.delete();

    let text = args.join(" ");
    let lines = await text.split(";");
    let stringSize = lines[0].length;

    let fontSize = 32;
    let wrapWidth = 26;

    // Calculate font and width size
    if(stringSize > 900) return message.reply("The text to write into the image is too big (More than 900 characters): "+stringSize);
    else if(stringSize > 600){
        // fontSize is calculated by how many characters are there, with a max
        fontSize = 3600/(stringSize*0.30)
        fontSize = parseInt(fontSize, 10)
        if(fontSize>24) fontSize = 24;
        // text wrapping calculates how many chars of fontSize fit in region
        wrapWidth = 380/fontSize*2.1
        wrapWidth = parseInt(wrapWidth, 10)
    }
    else if(stringSize > 400){
        // fontSize is calculated by how many characters are there, with a max
        fontSize = 3600/(stringSize*0.36)
        fontSize = parseInt(fontSize, 10)
        if(fontSize>24) fontSize = 24;
        // text wrapping calculates how many chars of fontSize fit in region
        wrapWidth = 380/fontSize*2.1
        wrapWidth = parseInt(wrapWidth, 10)
    }
    else if(stringSize > 300){
        // fontSize is calculated by how many characters are there, with a max
        fontSize = 3600/(stringSize*0.5)
        fontSize = parseInt(fontSize, 10)
        if(fontSize>24) fontSize = 24;
        // text wrapping calculates how many chars of fontSize fit in region
        wrapWidth = 380/fontSize*2.1
        wrapWidth = parseInt(wrapWidth, 10)
    }
    else if(stringSize > 180){
        // fontSize is calculated by how many characters are there, with a max
        fontSize = 3600/(stringSize*0.6)
        fontSize = parseInt(fontSize, 10)
        if(fontSize>24) fontSize = 24;
        // text wrapping calculates how many chars of fontSize fit in region
        wrapWidth = 380/fontSize*2.1
        wrapWidth = parseInt(wrapWidth, 10)
    }

    let wrapped = await wrap(lines[0], {width: wrapWidth});
    // console.log(wrapped);
    // Write text on image
    gm(image)
            //   W    H    X    Y
        .region(380, 320, 230, 40)
        .gravity('Center')
        .font("./assets/fonts/Impact.ttf", fontSize)
        .fill('#FFFFFF')
        .drawText(0, 0, wrapped)
        .write(img, function (err) {
            if (!err){
                message.channel.send({ file: img });
            } else{
                console.log(err);
            }
        })
}

module.exports.config = {
    name: "sonic",
    aliases: []
}