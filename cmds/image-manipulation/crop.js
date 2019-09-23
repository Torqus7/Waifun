const gm = require('gm');
const request = require('request');

module.exports.run = async (bot, message, args) => {

    let img = `./assets/gmedits/test/crop${message.author.id}.jpg`;

    if(args.length < 1 || args[0] == "help") {
        return message.reply (`This is a very useful command for quickly generating character pics\nUsage: ${bot.prefix}crop <url> (xOffset) | resizes and crop the picture at the center to 300x450 (Optional: you can set the offset of the crop if the character is not the center of the picture)\nExample: ${bot.prefix}crop <IMAGE_URL> -60`);
    }
    else if (args.length > 3){
        return message.reply("Your line couldn't be processed, the syntax is wrong somewhere.");
    }

    // TAKE THE PICTURE AND RESIZE
    gm(request(args[0]))
        .size(function(err, value){
            imgWidth = value.width;
            imgHeight = value.height;
            atx = parseInt(args[1], 10);
            gm(request(args[0]))
                .resize(imgWidth,450)
                .gravity("Center")
                .crop(300, 450, atx, 0)
                .write(img, function (err) {
                    if(err) console.log(err);
                    if (!err){
                        message.channel.send({ file: img });
                    } 
                });
            });
}

module.exports.config = {
    name: "crop",
    aliases: []
}