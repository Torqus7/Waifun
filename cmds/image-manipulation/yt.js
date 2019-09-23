const gm = require('gm');
const request = require('request');

async function editAndSendImage(bot, message, title, image){
    let img = `./assets/gmedits/test/yt${message.author.id}.jpg`;
    let yttemplate = `./assets/images/yttemplate.jpg`;
    if(title.length < 1) title = "HAHA LOOK AT THIS FUNNY (3:33 AM PRANK GONE SEXUAL)"
    else title = title.join(" ");
    await gm(request(image))
    .resizeExact(1146, 645)
    .write(img, function (err) {
        if (!err){
            gm()
            .command("composite") 
            .in("-gravity", "center")
            .in('-geometry', '+0-71')
            // OFFSET 13 x 12 y
            .in(img)
            .in(yttemplate)
            .write(img, function (err) {
                gm(img)
                .fill('#000000')
                .font("./assets/fonts/Roboto.ttf", 26)
                .drawText(16, 716, title)
                .write(img, function (err) {
                    if (!err) message.channel.send({ file: img });
                    else console.log(err)
                })
            })
        };
    })
}

module.exports.run = async (bot, message, args) => {

    let image = "";
    let help = `Usage: ${bot.prefix}yt <text> | to make a picture into a youtube video.\n${bot.prefix}yt <text> | to set the video's title`

    if(args[0] == "help") {
        return message.reply (help);
    }
    
    // Check the arguments
    if(message.mentions.users.first()){
        // If they want to edit an avatar picture
        image = message.mentions.users.first().displayAvatarURL;
        args = args.slice(1);
        await editAndSendImage(bot, message, args, image);
    }
    else if(args[0] === "me"){
        // If they want to edit their avatar picture
        image = message.author.displayAvatarURL;
        args = args.slice(1);
        await editAndSendImage(bot, message, args, image);
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
    name: "yt",
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