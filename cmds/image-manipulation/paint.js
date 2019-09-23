const gm = require('gm');
const request = require('request');

async function editAndSendImage(bot, message, arg, image){
    let img = `./assets/gmedits/test/paint${message.author.id}.jpg`;

    let number = 1;
    if(!arg) number = 7;
    else number = await parseInt(arg, 10)
    if(isNaN(number)) return message.reply(`You didn't input a number. Correct syntax ${bot.prefix}paint, or ${bot.prefix}paint <number> (1 to 50)`);
    if(!number) return message.reply(`0 does nothing :). Try using a cool number instead, like 7`);
    else if(number > 50) return message.reply(`**${bot.prefix}paint** Accepted Range: 1 to 50`)

    gm(request(image))
    // Check if image is too big
    .size(function(err, value){
        if(value.width > 1600) return message.reply("Bruh, that picture is WAY too big for me to process.");
        else if(value.height > 1600) return message.reply("Bruh, that picture is WAY too big for me to process.");
    
        gm(request(image))
            ///////////////////////////// IMAGE EDITION /////////////////////////////
            .paint(number)
            /////////////////////////////////////////////////////////////////////////
            // Send image to chat
            .write(img, function (err) {
                if (!err) message.channel.send({ file: img });
            })
        })
}

module.exports.run = async (bot, message, args) => {

    let image = "";
    let help = `Usage: ${bot.prefix}paint <number> | to transform the picture into a painting\n${bot.prefix}hue me <number> | to transform your avatar into a painting\n${bot.prefix}hue @name <number> | to transform someone's avatar into a painting`

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
    name: "paint",
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