module.exports.run = async (bot, message, args) => {
    message.delete();
    if(args.length < 1) return;
    let words = args.join(" ");
    message.channel.send(words);
}

module.exports.config = {
    name: "say",
    aliases: []
}