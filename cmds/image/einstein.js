const gm = require('gm');
const wrap = require('word-wrap');

module.exports.run = async (bot, message, args) => {

    let help = `Usage: ${bot.prefix}einstein <text> | to make Einstein say a quote\n${bot.prefix}einstein <text>;<name> | to make Einstein say a quote but change the name\n`

    if(args.length < 2 && args[0] == "help") {
        return message.reply (help);
    }
    // Delete the user message
    message.delete();
    // Get text length and lines
    let text = args.join(" ");
    let lines = await text.split(";");
    let stringSize = lines[0].length;
    // Get image
    let img = `./assets/gmedits/test/einstein${message.author.id}.jpg`;
    let image = `./assets/images/Einstein.jpg`;
    // Image configuration
    let font = `./assets/fonts/Quicksand.otf`
    let maxFontSize = 38;
    let textW = 640;
    let textH = 400;
    let textX = 540;
    let textY = 100;
    let nameW = 620;
    let nameH = 80;
    let nameX = 540;
    let nameY = 490;
    // Modifiers for string length
    let mainModif = 3600;
    let wrapModifier = 1.94;
    let plusTwoHundModif = 0.44;
    let plusThreeHundModif = 0.36;
    let plusFourHundModif = 0.28;
    let plusSixHundModif = 0.24;
    let plusSevenHundModif = 0.24;
    let usedModif = maxFontSize/100;
    // Defaults
    let name = "Albert Einstein"
    let fontSize = 44;
    let wrapWidth = 30;
    let nameFontSize = 44;

    // Text is too long
    if(stringSize > 900) return message.reply("The text to write into the image is too big (More than 900 characters) "+stringSize);
    // Calculate font and width size
    else if(stringSize > 700) usedModif = plusSevenHundModif;
    else if(stringSize > 600) usedModif = plusSixHundModif;
    else if(stringSize > 400) usedModif = plusFourHundModif;
    else if(stringSize > 300) usedModif = plusThreeHundModif;
    else if(stringSize > 180) usedModif = plusTwoHundModif;

    // fontSize is calculated by how many characters are there, with a max
    fontSize = mainModif/(stringSize*usedModif)
    fontSize = parseInt(fontSize, 10)
    if(fontSize>maxFontSize) fontSize = maxFontSize;
    // text wrapping calculates how many chars of fontSize fit in region
    wrapWidth = textW/fontSize*wrapModifier
    wrapWidth = parseInt(wrapWidth, 10)

    // wrap text with calculated values
    let wrapped = await wrap(lines[0], {width: wrapWidth});
    // Get name if we are using 2 lines
    if(lines.length > 1) name = lines[1];

    // Write text on image
    gm(image)
            //   W    H    X    Y
        .region(textW, textH, textX, textY)
        .gravity('Center')
        .font(font, fontSize)
        .fill('#FFFFFF')
        .drawText(0, 0, wrapped)
        .region(nameW, nameH, nameX, nameY)
        .gravity('Center')
        .font(font, nameFontSize)
        .fill('#FFFFFF')
        .drawText(0, 0, `- ${name}`)
        .write(img, function (err) {
            if (!err){
                message.channel.send({ file: img });
            } else{
                console.log(err);
            }
        })
}

module.exports.config = {
    name: "einstein",
    aliases: []
}