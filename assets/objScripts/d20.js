const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    // let r = Math.floor(Math.random()*20)+1;
    let r = 1;
    
    let embed = await new Discord.RichEmbed()
        .setTitle(`Rolled d20`)
        .setColor(bot.colors.Green)
        .addField("Result", `\`\`\`js\n${r}\`\`\``);
    if(r < 10) embed.setColor(bot.colors.Gray);
    else if(r === 1) embed.setColor(bot.colors.Red);
    else if(r === 20) embed.setColor(bot.colors.Orange);
    await message.channel.send(embed);

    if(r === 20) return getFortune(bot, message); //FORTUNE
    else if (r >= 10) return getReward(bot, message); // Get a Sleeve
    else if (r === 1) return getMisfortune(bot, message); // MISFORTUNE
    else message.reply("You didn't get anything");
}

async function getMisfortune(bot, message){
    let user = await bot.userinventories.findOne({ userID: message.author.id });
    // Randomize misfortune
    let r = await Math.floor(Math.random()*2);
    switch(r) {
        case 0:
                // LOSE A SLEEVE
            newSleeves = user.get('sleeves') - 1;
            if(newSleeves < 0) return message.reply("You would've lost a Sleeve but you didn't have any.")
            await bot.userinventories.updateOne({ userID: message.author.id }, 
                { $set: 
                    { 
                        sleeves: newSleeves
                    }
                })
            message.reply("You just lost a **Sleeve** :C")
            break;
        case 1:
                // LOSE A RANDOM CHARACTER
            characters = user.get('characters');
            if(characters.length < 1) return message.reply("Okay... You would've lost a character now, but you didn't have any to begin with... Well played.");
            let R = Math.floor(Math.random()*characters.length);
            await bot.userinventories.updateOne({ userID: message.author.id }, 
                { $pull: 
                    { 
                    characters: { name: characters[R].name }
                    }
                })
            // If character was being leveled, change stuff in userinventory
            if(user.leveling == characters[R].name){
                await bot.userinventories.updateOne({ userID: message.author.id }, 
                    { $set: 
                        { 
                            leveling: "None",
                        }
                    })
            }
            // If character was favorited, change stuff in userinventory
            if(user.favorite == characters[R].name){
                await bot.userinventories.updateOne({ userID: message.author.id }, 
                    { $set: 
                        { 
                            favorite: "None"
                        }
                    })
            }
            message.reply(`You just lost **${characters[R].name}** :C`)
            break;
      }
}

async function getReward(bot, message){
    let user = await bot.userinventories.findOne({ userID: message.author.id });
    // Randomize reward
    let r = Math.floor(Math.random()*2);
    switch(r) {
        case 0:
                // GET 4 SPAWN USES
            newSpawns = user.get('spawnUses') + 4;
            await bot.userinventories.updateOne({ userID: message.author.id }, 
                { $set: 
                    { 
                        spawnUses: newSpawns
                    }
                })
            message.reply("You got **+4 'spawn' uses**!")
            break;
        case 1:
                // GET A SLEEVE
            newSleeves = user.get('sleeves') + 1;
            await bot.userinventories.updateOne({ userID: message.author.id }, 
                { $set: 
                    { 
                        sleeves: newSleeves
                    }
                })
            message.reply("You got a **Sleeve**!")
            break;
      }
}

async function getFortune(bot, message){
    let user = await bot.userinventories.findOne({ userID: message.author.id });
    // Randomize fortune
    let r = await Math.floor(Math.random()*2);
    switch(r) {
        case 0:
                // GET A GOLDEN SLEEVE
            newSleeves = user.get('goldSleeves') + 1;
            await bot.userinventories.updateOne({ userID: message.author.id }, 
                { $set: 
                    { 
                        goldSleeves: newSleeves
                    }
                })
            message.reply("You got a **Golden Sleeve**!")
            break;
        case 1:
                // GET 2 SLEEVES AND THE DIE BACK
            newSleeves = user.get('sleeves') + 2;
            await bot.userinventories.updateOne({ userID: message.author.id }, 
                { $set: 
                    { 
                        sleeves: newSleeves
                    }
                })
            let object = new Map();
            object.set('name', "d20")
            object.set('uses', 1)
            await bot.userinventories.updateOne({ userID: message.author.id }, 
                { $push: 
                    { 
                        objects: object
                    }
                })
            message.reply("You got **2 Sleeves** and the **d20** back!")
            break;
      }
}