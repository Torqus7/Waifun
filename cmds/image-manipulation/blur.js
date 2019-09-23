const gm = require('gm');
const request = require('request');

async function editAndSendImage(bot, message, arg1, arg2, image){
    let img = `./assets/gmedits/test/blur${message.author.id}.jpg`;

    // Set values of Number1 and Number2 in case user didn't specify
    let number1 = 1;
    let number2 = 1;
    if(!arg1 && !arg2){
        number1 = 30;
        number2 = 100;
    }
    else if(!arg2){
        number1 = await parseInt(arg1, 10);
        number2 = 100;
    }
    else{
        number1 = await parseInt(arg1, 10);
        number2 = await parseInt(arg2, 10);
    }
    if(isNaN(number1) || isNaN(number2)) return message.reply(`You didn't input the correct syntax. Correct syntax ${bot.prefix}blur, or ${bot.prefix}blur <numberRadius> <numberAngle>`);
    // Don't allow 0 because it returns a black image
    if(number2 === 0) number2 = 1;

    gm(request(image))
    // Check if image is too big
    .size(function(err, value){
        if(value.width > 1600) return message.reply("Bruh, that picture is WAY too big for me to process.");
        else if(value.height > 1600) return message.reply("Bruh, that picture is WAY too big for me to process.");
        
        gm(request(image))
            ///////////////////////////// IMAGE EDITION /////////////////////////////
            .motionBlur(number1,number2)
            /////////////////////////////////////////////////////////////////////////
            // Send image to chat
            .write(img, function (err) {
                if (!err) message.channel.send({ file: img });
            })
        })
}

module.exports.run = async (bot, message, args) => {

    let image = "";
    let help = `Usage: ${bot.prefix}hue <number> | to cycle colors on the last picture sent in chat\n${bot.prefix}hue me <number> | to cycle colors on your avatar\n${bot.prefix}hue @name <number> | to cycle colors of an avatar`

    if(args[0] == "help") {
        return message.reply (help);
    }
    
    // Check the arguments
    if(message.mentions.users.first()){
        // If they want to edit an avatar picture
        image = message.mentions.users.first().displayAvatarURL;
        await editAndSendImage(bot, message, args[1], args[2], image);
    }
    else if(args[0] === "me"){
        // If they want to edit their avatar picture
        image = message.author.displayAvatarURL;
        await editAndSendImage(bot, message, args[1], args[2], image);
    }
    else{
        // If they want to edit the last picture sent
        image = await getImageFromChat(message);

        // If there isn't any image
        if(!image) return message.reply("Couldn't find any picture in chat. Send a picture and then use this command.");

        await editAndSendImage(bot, message, args[0], args[1], image);
    }
}

module.exports.config = {
    name: "blur",
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