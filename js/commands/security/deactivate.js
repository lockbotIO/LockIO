const botconfig = require("./../../../config.json");
const database = require("./../../etc/database.js");
const commando = require("discord.js-commando");
const {RichEmbed} = require('discord.js');

class Deactivate extends commando.Command {
    constructor (client) {
        super(client, {
            name: "deactivate",
            group: "security",
            memberName: "deactivate",
            description: "Deactivates your key and unbinds your discord.",
            clientPermissions: ["MANAGE_ROLES", "KICK_MEMBERS"],
            examples: ["deactivate"]
        });
    }

    async run(message) {
        let group_server = this.client.guilds.find(guild => guild.name === botconfig.discord.guildName);
        if (group_server) {
            let response = await database.unverify_key(message.author.id);
            let embed = new RichEmbed()
              .setColor("#00FF00")
              .setTitle(message.author.tag)
              .setThumbnail(message.author.displayAvatarURL)
              .setAuthor(botconfig.discord.guildName, group_server.iconURL || "https://discordapp.com/assets/dd4dbc0016779df1378e7812eabaa04d.png")
              .setFooter("LockIO", "https://i.imgur.com/t9hCq0m.png")
              .setTimestamp()
              .setDescription(response);
            await message.author.send({embed});
            if (response === "Successfully deactivated.") {
                let group_member = group_server.members.get(message.author.id);
                await group_member.setRoles([group_server.defaultRole], "Deactivated");
                console.log(`${group_member.user.tag} (${group_member.id}) stripped of roles. Reason: Deactivated`);
            };
        } else {
            throw new Error(`guildName ${botconfig.discord.guildName} is incorrect.`);
        };
    }
}

module.exports = Deactivate;
