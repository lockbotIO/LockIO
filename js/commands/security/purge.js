const botconfig = require("./../../../config.json");
const commando = require("discord.js-commando");
const {RichEmbed} = require('discord.js');

class Purge extends commando.Command {
    constructor (client) {
        super(client, {
            name: "purge",
            group: "security",
            memberName: "purge",
            description: "An admin command to remove all members without roles.",
            clientPermissions: ["MANAGE_ROLES", "KICK_MEMBERS"],
            userPermissions: ["MANAGE_ROLES", "KICK_MEMBERS"],
            examples: ["purge"]
        });
    }

    async run(message) {
        let group_server = this.client.guilds.find(guild => guild.name === botconfig.discord.guildName);
        if (group_server) {
            group_server.members.forEach(async function(guildMember, guildMemberId) {
                if (guildMember.roles.array().length == 1) {
                    guildMember.kick("No roles").then(async () => {
                        let embed = new RichEmbed()
                        .setColor("#00FF00")
                        .setTitle(guildMember.user.tag)
                        .setThumbnail(guildMember.user.displayAvatarURL)
                        .setAuthor(botconfig.discord.guildName, group_server.iconURL || "https://discordapp.com/assets/dd4dbc0016779df1378e7812eabaa04d.png")
                        .setFooter("LockIO", "https://i.imgur.com/t9hCq0m.png")
                        .setTimestamp()
                        .setDescription(`Kicked for having no roles.`);
                        await message.author.send({embed});
                    }).catch(console.error);
                };
            });
        } else {
            throw new Error(`guildName ${botconfig.discord.guildName} is incorrect.`);
        };
    }
}

module.exports = Purge;
