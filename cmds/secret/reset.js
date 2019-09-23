const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {

    if(message.author.id != 311979587242557442) return;
    
    let gets = 1;
    let spawns = 6;

    if(args[0] === "g" || args[0] === "get" || args[0] === "gets" || args[0] === "c" || args[0] === "claims"){
        if (args.length > 1){
            gets = parseInt(args[1], 10);
        }
        await bot.userinventories.updateMany({}, 
            { $set: 
                { 
                    getUses: gets
                }
            })
        message.channel.send(`Claim uses reset to ${gets}.`);
    }
    else if(args[0] === "s" || args[0] === "spawn" || args[0] === "spawns"){
        if (args.length > 1){
            spawns = parseInt(args[1], 10);
        }
        await bot.userinventories.updateMany({}, 
            { $set: 
                { 
                    spawnUses: spawns
                }
            })
            message.channel.send(`Spawn uses reset to ${spawns}.`);
    }else{
        message.channel.send(`idk`);
    }
}

module.exports.config = {
    name: "reset",
    aliases: []
}