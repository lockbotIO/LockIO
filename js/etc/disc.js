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

let cancel_member = async function(discordId) {
    let group_server = lockIO.guilds.find(guild => guild.name === botconfig.discord.guildName);
    let author = lockIO.users.get(discordId);
    let embed = new RichEmbed()
      .setColor("#00FF00")
      .setTitle(author.tag)
      .setThumbnail(author.displayAvatarURL)
      .setAuthor(botconfig.discord.guildName, group_server.iconURL || "https://discordapp.com/assets/dd4dbc0016779df1378e7812eabaa04d.png")
      .setFooter("LockIO", "https://i.imgur.com/t9hCq0m.png")
      .setTimestamp()
      .setDescription(`We noticed you cancelled your subscription, and we're sad to see you go. Goodbye ${author.tag}! \`You can re-subscribe anytime you want!\``);
    await author.send({embed});
    let group_member = group_server.members.get(author.id);
    await group_member.kick("Cancelled subscription.");
};

lockIO.on("ready", async () => {
    lockIO.user.setActivity("with security!");
    console.log(`${lockIO.user.username} [${lockIO.user.id}] connected to Discord.`);
});

lockIO.login(botconfig.discord.botToken);

module.exports = {
    lockIO: lockIO,
    cancel_member: cancel_member
};
