const gm = require('gm');
const request = require('request');

async function editAndSendImage(bot, message, args, image){
    gm(request(image))
    // Check if image is too big
    .size(async function(err, value){
        if(value.width > 1600) return message.reply("Bruh, that picture is WAY too big for me to process.");
        else if(value.height > 1600) return message.reply("Bruh, that picture is WAY too big for me to process.");
        
        gm(request(image))
            let text = args.join(" ");
            let lines = await text.split(";");

            let img = `./assets/gmedits/test/impact${message.author.id}.png`;
            let lineCount = 0;
            await lines.forEach(line => {
                lineCount++;
            });
            if(lineCount > 2){
                return message.reply("You can only make 2 lines of text (1 use of ;).");
            }
            else if(lineCount > 1){
                drawTwoLineText(image, lines, img, message)
            }else{
                drawOneLineText(image, lines, img, message)
            }
        })
}

module.exports.run = async (bot, message, args) => {

    let help = `Usage: ${bot.prefix}impact | to write in a pic with a funny non-outdated font\n${bot.prefix}impact me | to write on your avatar with a super funny font\n${bot.prefix}impact @name | to epicly quote in someone's avatar, lol so epic`
    let image = "";

    if(args[0] == "help" || args.length < 1) {
        return message.reply (help);
    }
    
    // Check the arguments
    if(message.mentions.users.first()){
        // If they want to edit an avatar picture
        text = args.slice(1);
        image = message.mentions.users.first().displayAvatarURL;
        await editAndSendImage(bot, message, text, image);
    }
    else if(args[0] === "me"){
        // If they want to edit their avatar picture
        image = message.author.displayAvatarURL;
        text = args.slice(1);
        await editAndSendImage(bot, message, text, image);
    }
    else{
        // If they want to edit the last picture sent
        image = await getImageFromChat(message);

        // If there isn't any image
        if(!image) return message.reply("Couldn't find any picture in chat. Send a picture and then use this command.");

        await editAndSendImage(bot, message, args, image);
    }
}

module.exports.config = {
    name: "impact",
    aliases: []
}



//////////////////////////////////////////////////////////////////////////////////////

async function getImageFromChat(message){
    
    // Find the first message with a picture
    let urlFound = false;
    let url = undefined;
    let image = "";
    let messages = await message.channel.fetchMessages({ limit: 10 })

    // Alert that the image is being processed
    let alert = await message.reply("processing image...");
    messages.forEach(msg => {
        // If it's an embed, get url
        if(msg.embeds){
            msg.embeds.forEach((embed) => {
                // Check if video
                if(embed.thumbnail) return url = embed.thumbnail.url;
                // Check if url
                if(!embed.image) return url = embed.url;
                url = embed.image.url
            })
        }
        // If it's an attachment, get url
        if(msg.attachments){
            msg.attachments.forEach((attachment) => {
                // Check if video
                if(attachment.thumbnail) return url = attachment.thumbnail.url;
                // Check if url
                if(!attachment.image) return url = attachment.url;
                url = attachment.image.url
            })
        }
        // If an image was found, take it
        if(url !== undefined && urlFound === false){
            urlFound = true;
            image = url;
        }
    });

    if(image === "") {
        await alert.delete();
        return;
    }
    setTimeout(function() {
        alert.delete()
    }, 2000);
    return image;
}

//////////////////////////////////////////////////////////////

async function drawTwoLineText(image, lines, img, message){
    gm(request(image))
        .size(function(err, value){
            imgWidth = value.width;
            imgHeight = value.height;
            fontSize = (imgHeight+imgWidth)/20
            stroke = fontSize/16
            gm(request(image))
                .gravity('Center')
                .fill('#000000')
                .font("./assets/fonts/Impact.ttf", fontSize)
                .drawText(0, (-value.height/2)+fontSize+stroke, lines[0].toUpperCase())
                .drawText(0, (-value.height/2)+fontSize-stroke, lines[0].toUpperCase())
                .drawText(-stroke, (-value.height/2)+fontSize, lines[0].toUpperCase())
                .drawText(stroke, (-value.height/2)+fontSize, lines[0].toUpperCase())
                .drawText(stroke, (-value.height/2)+fontSize+stroke, lines[0].toUpperCase())
                .drawText(stroke, (-value.height/2)+fontSize-stroke, lines[0].toUpperCase())
                .drawText(-stroke, (-value.height/2)+fontSize+stroke, lines[0].toUpperCase())
                .drawText(-stroke, (-value.height/2)+fontSize-stroke, lines[0].toUpperCase())
                .fill('#FFFFFF')
                .drawText(0, (-value.height/2)+fontSize, lines[0].toUpperCase())
                .fill('#000000')
                .drawText(0, (value.height/2)-fontSize+stroke, lines[1].toUpperCase())
                .drawText(0, (value.height/2)-fontSize-stroke, lines[1].toUpperCase())
                .drawText(-stroke, (value.height/2)-fontSize, lines[1].toUpperCase())
                .drawText(stroke, (value.height/2)-fontSize, lines[1].toUpperCase())
                .drawText(stroke, (value.height/2)-fontSize+stroke, lines[1].toUpperCase())
                .drawText(stroke, (value.height/2)-fontSize-stroke, lines[1].toUpperCase())
                .drawText(-stroke, (value.height/2)-fontSize+stroke, lines[1].toUpperCase())
                .drawText(-stroke, (value.height/2)-fontSize-stroke, lines[1].toUpperCase())
                .fill('#FFFFFF')
                .drawText(0, (value.height/2)-fontSize, lines[1].toUpperCase())
                .write(img, function (err) {
                    if(err) console.log(err);
                    if (!err){
                        message.channel.send({ file: img });
                    } 
                });
        })
}

async function drawOneLineText(image, lines, img, message){
    gm(request(image))
        .size(function(err, value){
            imgWidth = value.width;
            imgHeight = value.height;
            fontSize = (imgHeight+imgWidth)/20
            stroke = fontSize/16
            gm(request(image))
                .gravity('Center')
                .fill('#000000')
                .font("./assets/fonts/Impact.ttf", fontSize)
                .fill('#000000')
                .drawText(0, (value.height/2)-fontSize+stroke, lines[0])
                .drawText(0, (value.height/2)-fontSize-stroke, lines[0])
                .drawText(-stroke, (value.height/2)-fontSize, lines[0])
                .drawText(stroke, (value.height/2)-fontSize, lines[0])
                .drawText(stroke, (value.height/2)-fontSize+stroke, lines[0])
                .drawText(stroke, (value.height/2)-fontSize-stroke, lines[0])
                .drawText(-stroke, (value.height/2)-fontSize+stroke, lines[0])
                .drawText(-stroke, (value.height/2)-fontSize-stroke, lines[0])
                .fill('#FFFFFF')
                .drawText(0, (value.height/2)-fontSize, lines[0])
                .write(img, function (err) {
                    if(err) console.log(err);
                    if (!err){
                        message.channel.send({ file: img });
                    } 
                });
        })
}