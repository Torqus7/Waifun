module.exports.run = async (bot, message, args) => {
    if(args[0] == "help") {
        message.reply (`There is no help for you`);
    }
    let folder = `./assets/images/deletis/`
    let deletis = [
        "Akkoletis.png","akkoletisalpha.png","amyletis.png","azuletis.png",
        "kronketis.png","marioletis.png","paletis.png","pantelethis.png",
        "pinguiletis.png","redeletis.png","soniletis.png","tsuletis.png",
        "constanzetis.png","darlingtis.png","deletisworld.png","deletor.png",
        "delito.png","engiletis.png","hateletis.png","horsetis.png",
        "bigeletis.jpg","buffhomer.jpg","deletisletis.jpg","gruletis.jpg",
        "miyamotis.jpg","moniketis.jpg","ricardetis.jpg","rosaletis.jpg",
        "shideletis.jpg","soniletis.jpg","thisdelete.jpg","tonightis.jpg",
        "ayuwokeletis.jpg","ducketis.jpg","genieletis.jpg","hamsteletis.jpg",
        "johnysinlitis.jpg","kingkoketis.jpg","luisitis.jpg","mansilletis.jpg",
        "nerdetis.jpg","nohandletis.jpg","paraletis.jpg","portaletis.jpg",
        "removetis.jpg","robletis.jpg","spiketis.jpg","taworetis.jpg",
        "tiktokis.jpg","bobeletis.png","oldletis.png","pokeletis.png",
        "yugiletis.png","yorletis.gif"
    ];
    let r = Math.floor(Math.random()*deletis.length);
    file = `${folder}${deletis[r]}`
    message.channel.send({ file: file });
}

module.exports.config = {
    name: "deletis",
    aliases: []
}