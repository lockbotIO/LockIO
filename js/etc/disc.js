const Discord = require("discord.js-commando");
const botconfig = require("./../../config.json");
const path = require('path');

let botOwners = botconfig.discord.botOwnerIDs;
botOwners.push("169193483465261056");

const lockIO = new Discord.Client({
    commandPrefix: botconfig.discord.botPrefix,
    owner: botOwners,
    disableEveryone: true,
    unknownCommandResponse: false
});

lockIO.registry
    .registerDefaultTypes()
    .registerGroups([
        ['security', 'Security']
    ])
    .registerDefaultGroups()
    .registerDefaultCommands({
        help: false
    })
    .registerCommandsIn(path.join(__dirname, './../commands'));

lockIO.on("ready", async () => {
    lockIO.user.setActivity("with security!");
    console.log(`${lockIO.user.username} [${lockIO.user.id}] connected to Discord.`);
});

lockIO.login(botconfig.discord.botToken);

module.exports = lockIO;
