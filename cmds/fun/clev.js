const cleverbot = require("cleverbot.io");

module.exports.run = async (bot, message, args) => {

    if(!bot.clever[message.author.id]) bot.clever[message.author.id] = new cleverbot("u546ub4PUbJi3vqw", "UWSmgDLiYQ0qbKvmf1YkQGLxCO0gM31p");
    bot.clever[message.author.id].setNick(message.author.id);

    let question = args.join(" ");

    bot.clever[message.author.id].create(function (err, session) {
        
    });

    bot.clever[message.author.id].ask(question, function (err, response) {
        message.reply(response);
    });
}

module.exports.config = {
    name: "clev",
    aliases: ["cleverbot"]
}



//////////////////////////////////////////////////////////////////////////////////////