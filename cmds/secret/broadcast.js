module.exports.run = async (bot, message, args) => {

    if(message.author.id != 311979587242557442) return; 
    
    let words = args.join(" ");
    let guilds = await bot.guildsettings.find({});
    guilds.forEach(guild => {
        channel = guild.get('channel');
        try{
            bot.guilds.get(guild.get('guildID')).channels.get(guild.get('channel')).send(words);
        }catch(err){
            console.log("ERROR: Cannot read property 'send' of undefined, The guild whose channel was trying to send a message probably removed the bot during downtime.")
        }
    });
}

module.exports.config = {
    name: "broadcast",
    aliases: []
}