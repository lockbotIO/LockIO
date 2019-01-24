const botconfig = require("./../../config.json");
const Discord = require("discord.js-commando");
const database = require("./database.js");
const {RichEmbed} = require('discord.js');
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

lockIO.on("guildMemberAdd", async (member) => {
    let embed = new RichEmbed()
      .setColor("#00FF00")
      .setTitle(member.user.tag)
      .setThumbnail(member.user.displayAvatarURL)
      .setAuthor(botconfig.discord.guildName, member.guild.iconURL || "https://discordapp.com/assets/dd4dbc0016779df1378e7812eabaa04d.png")
      .setFooter("LockIO", "https://i.imgur.com/t9hCq0m.png")
      .setTimestamp()
      .setDescription(`Activate your key with \`${botconfig.discord.botPrefix}activate [key] [payment email]\``);
    await member.send({embed});
});

lockIO.on("ready", () => {
    console.log(`${lockIO.user.username} [${lockIO.user.id}] connected to Discord.`);
    lockIO.user.setActivity("with security!");
    let group_server = lockIO.guilds.find(guild => guild.name === botconfig.discord.guildName);
    let members_role = group_server.roles.find(role => role.name === botconfig.discord.memberRole);
    let lifetime_role = group_server.roles.find(role => role.name === botconfig.discord.lifetimeRole);
    setInterval(() => {
        group_server.members.forEach(async function(guildMember, guildMemberId) {
            if (guildMember.kickable && !guildMember.hasPermission("KICK_MEMBERS", true, true) && guildMember.roles.has(members_role.id) && !guildMember.roles.has(lifetime_role.id)) {
                let doc = await database.find_key("discordId", guildMember.id);
                if (!doc || doc === null) {
                    let embed = new RichEmbed()
                      .setColor("#FF0000")
                      .setTitle(guildMember.user.tag)
                      .setThumbnail(guildMember.user.displayAvatarURL)
                      .setAuthor(botconfig.discord.guildName, guildMember.guild.iconURL || "https://discordapp.com/assets/dd4dbc0016779df1378e7812eabaa04d.png")
                      .setFooter("LockIO", "https://i.imgur.com/t9hCq0m.png")
                      .setTimestamp()
                      .setDescription(`Your membership has been **revoked** because you **did not** have a key assigned. To re-gain access please use the command \`${botconfig.discord.botPrefix}activate [key] [payment email]\`.`);
                    await guildMember.user.send({embed});
                    await guildMember.setRoles([group_server.defaultRole], "No key linked");
                    console.log(`${guildMember.user.tag} (${guildMember.id}) stripped of roles. Reason: No key linked`);
                };
            };
        });
    }, 300000);
});

lockIO.login(botconfig.discord.botToken);
