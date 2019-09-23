const gm = require('gm');
const request = require('request');

let video = ["webm","avi","swf","wmb","mp4","mkv"]

async function editAndSendImage(bot, message, arg, image){
    let img = `./assets/gmedits/test/deepfry${message.author.id}.png`;

    gm(request(image))
    // Check if image is too big
    .size(function(err, value){
        if(value.width > 1600) return message.reply("Bruh, that picture is WAY too big for me to process.");
        else if(value.height > 1600) return message.reply("Bruh, that picture is WAY too big for me to process.");
        gm(request(image))
            ///////////////////////////// IMAGE EDITION /////////////////////////////
            .modulate(100,150)
            .contrast(4)
            .sharpen(15, 24)
            .mosaic(5)
            .gamma(1)
            .median(1)
            .enhance()
            /////////////////////////////////////////////////////////////////////////
            // Send image to chat
            .write(img, function (err) {
                if (!err) message.channel.send({ file: img });
            })
        })
}

module.exports.run = async (bot, message, args) => {

    let image = "";
    let help = `Usage: ${bot.prefix}df | to destroy the last picture sent in chat\n${bot.prefix}df me | to destroy your avatar\n${bot.prefix}df @name | to destroy someone's avatar`

    if(args[0] == "help") {
        return message.reply (help);
    }
    
    // Check the arguments
    if(message.mentions.users.first()){
        // If they want to edit an avatar picture
        image = message.mentions.users.first().displayAvatarURL;
        await editAndSendImage(bot, message, args[1], image);
    }
    else if(args[0] === "me"){
        // If they want to edit their avatar picture
        image = message.author.displayAvatarURL;
        await editAndSendImage(bot, message, args[1], image);
    }
    else{
        // If they want to edit the last picture sent
        image = await getImageFromChat(message);

        // If there isn't any image
        if(!image) return message.reply("Couldn't find any picture in chat. Send a picture and then use this command.");

        await editAndSendImage(bot, message, args[0], image);
    }
}

module.exports.config = {
    name: "df",
    aliases: ["deepfry"]
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
                if(embed.thumbnail) return url = embed.thumbnail.url;
                // Check if url
                if(!embed.image) return url = embed.url;
                // Check if video
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