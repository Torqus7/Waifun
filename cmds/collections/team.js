const Discord = require("discord.js");
const stringSimilarity = require('string-similarity');

const gm = require('gm');
const request = require('request');

module.exports.run = async (bot, message, args) => {
    if(args[0] == "help") {
        return message.reply (`Usage: ${bot.prefix}level | to see the currently leveling character.\n${bot.prefix}level <name> | to start leveling up a character you own.\nYour characters gain Exp each time you use 'spawn' and they are selected with this command. They also gain Exp for completing events or duels.`);
    }

    return message.reply("This command is being worked on, it'll be available in a future patch")
    
    let user = await bot.userinventories.findOne({ userID: message.author.id })
    if(user.teamUpdated !== false && user.teamUpdated !== true){
        await bot.userinventories.updateOne({ userID: message.author.id }, 
            { $set: 
                { 
                    team: [],
                    teamUpdated: false
                }
            })
    }
    if(args[0] == "show"){
        if(user.team.length < 1) return message.reply("You don't have any characters in your team, use 'team add <name>' to add a character to your team")
        let img = `./assets/teams/${message.author.id}teamo5.jpg`;
        let teamTemplate = `./assets/images/Team.jpg`;
        let charImages = [];
        let names = "";
        let xOffset = -700;
        let imageNumber = 0;
        if(user.teamUpdated){
            user.team.forEach(async chara => {
                tempCharImg = `./assets/teams/temp/${message.author.id}number${imageNumber}.jpg`;
                console.log(chara.name)
                if(names == "") names += `${chara.name}`
                else names += `, ${chara.name}`
                char = await bot.characters.findOne({ name: chara.name})
                images = char.images.split(",");
                image = images[chara.pic];
                
                await gm(request(image))
                .write(tempCharImg, function (err) {
                    if (err) return console.log(err)
                    imageNumber++;
    
                    gm(teamTemplate)
                    .command("composite") 
                    .in("-gravity", "center")
                    .in('-geometry', `+${xOffset}-154`)
                    // OFFSET 13 x 12 y
                    .in(tempCharImg)
                    .write(img, function (err) {
                        if (!err) message.channel.send({ file: img });
                        else console.log(err)
                    })
                    xOffset += 320;
                })
            });
        }else{
            return message.channel.send({ file: img });
        }
    }
    if(args[0] == "add"){
        let charName = args.slice(1).join(" ");
        // Find best match and check if character exists
        let names = [];
        // Escape all characters inside the variable
        charName = charName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        let regexp = new RegExp(charName, "i");
        // Find all characters matching regexp
        let char = await bot.characters.find({ name: regexp });
        if (char.length < 1) return message.reply(`**${charName}** isn't an available character.`);
        await char.forEach(chara => names.push(chara.name));
        // Compare user input and gotten characters to get best match
        let match = await stringSimilarity.findBestMatch(charName, names);
        char = await bot.characters.findOne({name: match.bestMatch.target});

        // Check if the user has the character
        charactersUser = user.get('characters');
        check = charactersUser.filter(chara => chara.name === char.get('name'));
        if(check.length < 1) return message.reply(`You don't have **${char.get('name')}**.`)

        // Check if the character is in team already
        inTeamAlready = false;
        teamCharacters = user.get('team');
        teamCharacters.forEach(chara => {
            if(chara.name === char.name) return inTeamAlready = true;
        });
        if(inTeamAlready === true) return message.reply(`**${char.get('name')}** already is in your team.`)
        // Get all data from char
        let name = char.get('name');
        let sex = char.get('sex');
        let franch = char.get('franch');
        let images = char.get('images');
        let category = char.get('category');
        let description = char.get('description');

        // Set icons for sex
        let male = "<:male:538223014727122944>";
        let female = "<:female:538223014710476810>";
        let both = "<:male:538223014727122944><:female:538223014710476810>";
        let unknown = "❔";
        let sexIcon = "";
        if(sex == 1) sexIcon = female;
        else if(sex == 2) sexIcon = male;
        else if(sex == 3) sexIcon = both;
        else if(sex == 4) sexIcon = unknown;

        // Get category name
        let categoryName = "";
        if(category === 1) categoryName = "Anime/Manga";
        else if(category === 2) categoryName = "Games";
        else if(category === 3) categoryName = "Cartoons/Comics";
        else if(category === 4) categoryName = "Internet/Youtube";
        
        // Get character level
        let level = 1;
        let exp = check[0].exp;
        if(exp >= bot.levelCurve.ten) level = 10;
        else if(exp >= bot.levelCurve.nine) level = 9;
        else if(exp >= bot.levelCurve.eight) level = 8;
        else if(exp >= bot.levelCurve.seven) level = 7;
        else if(exp >= bot.levelCurve.six) level = 6;
        else if(exp >= bot.levelCurve.five) level = 5;
        else if(exp >= bot.levelCurve.four) level = 4;
        else if(exp >= bot.levelCurve.three) level = 3;
        else if(exp >= bot.levelCurve.two) level = 2;
        else if(exp >= bot.levelCurve.one) level = 1;

        // Separate images into an array
        let imgNumber = 0;
        let imgs = images.split(",");

        // Show character
        let embed = new Discord.RichEmbed()  
            .setColor(bot.colors.Green)
            .setTitle(`${name} ${sexIcon}`)
            .setDescription(`${franch}\n${categoryName}\n${description}`)
            .addField(`Level:`, `${level}`)
            .setFooter(`Click the tick to confirm adding this character to your team.`)
            .setImage(imgs[0]);
        if(check[0].isGolden){
            embed.setColor(bot.colors.Yellow);
            embed.setTitle(`${name} ${sexIcon} <:gsleeve:553299310280835073>`);
        };
        let msg = await message.channel.send(embed);
        await msg.react('✅');
        await msg.react('✖');

        const send = (reaction, user) => { return reaction.emoji.name === '✅' && user.id === message.author.id;};
        const close = (reaction, user) => { return reaction.emoji.name === '✖' && user.id === message.author.id;};
    
        const collectorSend = msg.createReactionCollector(send, {max: 1, maxEmojis: 1, time: 30000});
        const collectorClose = msg.createReactionCollector(close, { time: 30000});
    
        collectorSend.on('collect', async (reaction, reactionCollector) => {
            // Save character to team
            let character = new Map();
            character.set('name', check[0].name)
            character.set('pic', check[0].mainPic);
            character.set('isGolden', check[0].isGolden);
            character.set('exp', check[0].exp);
            character.set('equip', "");
            await bot.userinventories.updateOne({ userID: message.author.id }, 
                { $push: 
                    { 
                        team: character
                    }
                })
            await bot.userinventories.updateOne({ userID: message.author.id }, 
                { $set: 
                    { 
                        teamUpdated: true
                    }
                })
            message.reply(`**${name}** is now part of your team!`);
        });
        collectorClose.on('collect', async (reaction, reactionCollector) => {
            message.delete();
            msg.delete();
        });
        return;
    }
    if(user.team.length < 1) return message.reply("You don't have any characters in your team, use 'team add <name>' to add a character to your team")
    
    let power = 0;
    let names = "";
    user.team.forEach(chara => {
        power += 10;
        // power += level;
        // IF CHARA HAS EQUIPMENT, GET EQUIP POWER
        if(names == "") names += `${chara.name}`
        else names += `, ${chara.name}`
        
    });
    // Show team
    let embed = new Discord.RichEmbed()        
        .setColor(bot.colors.Green)
        .setTitle(`${message.author.username}'s Team of 5`)
        .setDescription(`${names}`)
        .setFooter(`Power: ${power}`)
    // Send embed
    let msg = await message.channel.send(embed);
}

module.exports.config = {
    name: "team",
    aliases: []
}