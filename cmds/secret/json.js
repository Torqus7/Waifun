const Discord = require("discord.js");
const mongoose = require("mongoose");
const fs = require('fs');

async function addCharacterToDatabase(bot, char){
    let characters = new bot.characters({
        _id: mongoose.Types.ObjectId(),
        name: char.name,
        sex: char.sex,
        franch: char.franch,
        images: char.images,
        category: char.category,
        description: char.description,
        popularity: 0,
        createdBy: char.createdBy
    });
    // Save character to characters
    await characters.save();
}

async function editFranchises(bot, names, franch, anime, games, cartoons, internet){
    thisFranch = await bot.franchises.findOne({ name: franch })
    // If franchise exists, update it
    if(thisFranch){
        fromAnimeManga = thisFranch.get('fromAnimeManga');
        fromGames = thisFranch.get('fromGames');
        fromCartoonsComics = thisFranch.get('fromCartoonsComics');
        fromInternetYoutube = thisFranch.get('fromInternetYoutube');
        fromAnimeManga += anime;
        fromGames += games;
        fromCartoonsComics += cartoons;
        fromInternetYoutube += internet;
        // Update the new data
        await bot.franchises.updateOne({ name: franch }, 
            { $set: 
                {
                fromAnimeManga: fromAnimeManga,
                fromGames: fromGames,
                fromCartoonsComics: fromCartoonsComics,
                fromInternetYoutube: fromInternetYoutube
                }
            })
        await bot.franchises.updateOne({ name: franch }, 
            { $push: 
                { 
                characters: names
                }
            })
    }else{
        // Get character category
        fromAnimeManga = anime;
        fromGames = games;
        fromCartoonsComics = cartoons;
        fromInternetYoutube = internet;

        // Create franchise
        franchise = new bot.franchises({
            _id: mongoose.Types.ObjectId(),
            name: franch,
            fromAnimeManga: fromAnimeManga,
            fromGames: fromGames,
            fromCartoonsComics: fromCartoonsComics,
            fromInternetYoutube: fromInternetYoutube,
            thumbnail: null,
        });
        // Save new franchise to franchises
        await franchise.save();
        // Add character to created franchise
        await bot.franchises.updateOne({ name: franch }, 
        { $push: 
            { 
            characters: names
            }
        })
    }
}

///////////////////////////////////////////////////////////////////////////////////////////

module.exports.run = async (bot, message, args) => {

    let json = `./assets/toAdd/${args[0]}.json`

    if(message.author.id != 311979587242557442) return; 
    try{
        await fs.readFile(json, 'utf8', function (err, data) {
            if (err) throw err;
            let obj = JSON.parse(data);
            let names = [];
            let franch = "";
            let animeCount = 0;
            let gamesCount = 0;
            let cartoonsCount = 0;
            let internetCount = 0;
            franch = obj[0].franch;
            obj.forEach(char => {
                addCharacterToDatabase(bot, char);
                // console.log(`Added ${char.name}`)
                names.push(char.name);
                if(char.category == 1) animeCount++;
                if(char.category == 2) gamesCount++;
                if(char.category == 3) cartoonsCount++;
                if(char.category == 4) internetCount++;
            });
            editFranchises(bot, names, franch, animeCount, gamesCount, cartoonsCount, internetCount);
        });
    }catch(err){
        if(err) console.log(err);
        else message.reply("Imported Successfully")
    }
}

module.exports.config = {
    name: "json",
    aliases: []
}