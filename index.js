// Import modules
const settings = require("./settings.json");
const Discord = require("discord.js");
const fs = require("fs");
const DBL = require("dblapi.js");
const CronJob = require('cron').CronJob;

const bot = new Discord.Client({disableEveryone: true});
bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();

bot.dbl = new DBL('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUzNDAxNTM0NjQ4MzUyNzY5MSIsImJvdCI6dHJ1ZSwiaWF0IjoxNTUxMjAxMTI2fQ.ycPakVMN-1Mnu4opI197BHdcvpiKdY4t18j4gbqfHlw', bot);

bot.apiKeys = require("./assets/apiKeys.json");
bot.colors = require("./assets/colors.json");
bot.levelCurve = require("./assets/levelCurve.json");

////////////////////////    MONGO DB   ///////////////////////////////////////

// Mongoose connection to DB
const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/Waifun', {
    useNewUrlParser: true
}, function (err){
    if(err) console.log(err);
    else console.log("Successfully connected to MongoDB");
});
mongoose.set('useCreateIndex', true);

// Mongoose connection to DB
// const mongoose = require("mongoose");
// let options = {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     autoReconnect: true,
//     reconnectTries: Number.MAX_VALUE, 
//     reconnectInterval: 500
//    };
   
// let cluster = "mongodb+srv://Torqus:Priscipiero1!@waifun-lyiug.mongodb.net/Waifun";
// mongoose.connect(cluster, options, function (err){
//     if(err) console.log(err);
//     else console.log("<<< Successfully connected to MongoDB >>>");
// });

// Mongoose collection model definitions
bot.characters = require("./models/characters.js");
bot.checklists = require("./models/checklists.js");
bot.equipments = require("./models/equipments.js");
bot.franchises = require("./models/franchises.js");
bot.guildsettings = require("./models/guildSettings.js");
bot.objects = require("./models/objects.js");
bot.updates = require("./models/updates.js");
bot.userinventories = require("./models/userInventories.js");

////////////////////////    GLOBAL VARIABLES   ///////////////////////////////////////

bot.guildPrefix = [];
bot.guildBlocked = [];
bot.prefix = "";
bot.clever = [];

///////////////////////////// READ COMMANDS ////////////////////////////////////

let totalCommands = 0;

// Load commands
async function load(dir){
    fs.readdir(`./cmds/${dir}/`, (err, files) =>{
        if(err) console.error(err);
        // Checking for .js files only
        let jsfiles = files.filter (f => f.split(".").pop() === "js");
        if (jsfiles.length <= 0){
            console.log("No commands to load");
            return;
        }
        console.log(`Loading ${jsfiles.length} commands!`);
        
        jsfiles.forEach((f, i) =>{
            let pull = require(`./cmds/${dir}/${f}`);
            console.log(`${i+1}: ${f} loaded!`);
            totalCommands++;
            bot.commands.set(pull.config.name, pull);
            pull.config.aliases.forEach(alias => {
                bot.aliases.set(alias, pull.config.name)
            })
        });
    });
}

// Load commands in sub folders
["collections","fun","image","image-manipulation","nsfw","secret","settings","utility"].forEach(ld => load(ld));

///////////////////////////     On start
bot.on ("ready", async ()=> {
    // Salute
    console.log(`${bot.user.username} online!`);
    console.log(bot.commands);
    console.log(`${totalCommands} commands`);

    let guilds = await bot.guildsettings.find();
    guilds.forEach(guild => {
        bot.guildPrefix[guild.guildID] = guild.get('prefix');
        bot.guildBlocked[guild.guildID] = guild.get('blocked');
    });

    // Set Activity
    bot.user.setActivity('Fortnite!');

    // ---------------------- CRON JOBS
    // RESET SPAWN THROWS
    new CronJob('0 0 1-23 * * *', async function() {
        await bot.userinventories.updateMany({}, 
            { $set: 
                { 
                    spawnUses: 10
                }
            })
        console.log("Spawn throws reset - " + new Date())
    }, null, true, 'Etc/UTC');
    //     RESET GET THROWS
    new CronJob('0 0 1-23/3 * * *', async function() {
        await bot.userinventories.updateMany({}, 
            { $set: 
                { 
                    getUses: 1
                }
            })
        console.log("Get throws reset - " + new Date())
    }, null, true, 'Etc/UTC');
});

///////////////////////////    On guild join
bot.on ("guildCreate", async guild => {
    // Get the first text channel with send message permission
    let channelID = await guild.channels.filter(c => c.type === 'text' && c.permissionsFor(guild.me).has('SEND_MESSAGES')).first().id;

    // create and save guild settings
    let newGuild = new bot.guildsettings({
        _id: mongoose.Types.ObjectId(),
        guildID: guild.id,
        prefix: settings.prefix,
        channel: channelID
    });
    await newGuild.save();

    // Reload per-guild-prefixes
    let guilds = await bot.guildsettings.find();
    guilds.forEach(guild => {
        bot.guildPrefix[guild.guildID] = guild.get('prefix');
        bot.guildBlocked[guild.guildID] = guild.get('blocked');
    });
    // Send thanks message for inviting the bot
    guildChannel = newGuild.get('channel');
    guild.channels.get(guildChannel).send("Bot ready for duty!")
    guild.channels.get(guildChannel).send("Thanks for inviting me into this server!")
    
    // Send alert to Kahoot that a new server invited the bot
    bot.guilds.get("528059228946956297").channels.get("534016516383834123").send(`***A guild invited me: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!***`);
});

bot.on("guildDelete", async guild => {
    // Delete guild config from guildsettings
    await bot.guildsettings.findOneAndDelete({ guildID: guild.id });

    // Send alert to Kahoot that a server kicked the bot
    bot.guilds.get("528059228946956297").channels.get("534016516383834123").send(`***I have been removed from: ${guild.name} (id: ${guild.id}). This guild had ${guild.memberCount} members :c***`);
  });
  
///////////////////////////    On message
bot.on("message", async message =>{
    // If bot, ignore
    if(message.author.bot) return;
    // If it isn't in kahoot and isnt me
    if(message.guild.id === "538214390202105868" && message.author.id != "311979587242557442") return;
    // Send message on DM
    if(message.channel.type === "dm") return message.author.send("Sorry, I don't respond to DM's. Add me to your server so we can have fun:\nhttps://discordapp.com/oauth2/authorize?client_id=534015346483527691&scope=bot&permissions=519233");

    // use bot.prefix on every help command to get the guild specific prefix in the text
    bot.prefix = await bot.guildPrefix[message.guild.id];
    /////// create guild settings (added bot during downtime) /////
    if(!bot.prefix){
        let guild = await bot.guildsettings.findOne({ guildID: message.guild.id });
        if(!guild){
            // Get the first text channel with send message permission
            let channelID = await message.guild.channels.filter(c => c.type === 'text' && c.permissionsFor(message.guild.me).has('SEND_MESSAGES')).first().id;
    
            // create and save guild settings
            let newGuild = new bot.guildsettings({
                _id: mongoose.Types.ObjectId(),
                guildID: message.guild.id,
                prefix: settings.prefix,
                channel: channelID
            });
            await newGuild.save();
            guild = await bot.guildsettings.findOne({ guildID: message.guild.id });
        }
        let guilds = await bot.guildsettings.find();
        await guilds.forEach(guild => {
            bot.guildPrefix[guild.guildID] = guild.get('prefix');
            bot.guildBlocked[guild.guildID] = guild.get('blocked');
        });
        bot.prefix = bot.guildPrefix[message.guild.id];
    }
    //////////
    // If message doesn't have prefix, don't do anything
    if(!message.content.startsWith(bot.prefix)) return;
    // If message is on a channel where bot doesnt have permission to speak
    if (!message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES')) return message.react('❌');
    // If message is on a blocked channel, stop
    if(!message.content.startsWith(`${bot.prefix}block`) && bot.guildBlocked[message.guild.id].includes(message.channel.id)) return message.react('🔇');

    let messageArray = message.content.split(/\s+/g);
    let command = messageArray[0].toLowerCase();
    let args = messageArray.slice(1);

    // Execute command
    let cmd =  bot.commands.get(command.slice(bot.prefix.length)) || bot.commands.get(bot.aliases.get(command.slice(bot.prefix.length)));
    if(cmd) cmd.run(bot, message, args);
});

bot.on('error', console.error);

///////////////////////////   TAKE THE TOKEN        /////////////////////////////////////

bot.login(settings.token);


/////////////////////////////////////////////////////////////////////////////////////////

// Talk to channels directly through console like a champ
process.stdin.on("data", function(data) {
    console.log("recieved " + data)
    stringData = data.toString();
    let lines = stringData.split(";");
    if(lines.length > 2) bot.guilds.get(lines[0]).channels.get(lines[1]).send(lines[2]);
    else bot.guilds.get("528059228946956297").channels.get("534016516383834123").send(lines[0]);
});