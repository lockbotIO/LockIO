const botconfig = require("./../../../config.json");
const database = require("./../../etc/database.js");
const commando = require("discord.js-commando");
const {RichEmbed} = require('discord.js');

class Resubscribe extends commando.Command {
    constructor (client) {
        super(client, {
            name: "resubscribe",
            group: "security",
            memberName: "resubscribe",
            description: "Allows old members to re-subscribe to the group.",
            clientPermissions: ["MANAGE_ROLES"],
            examples: ["resubscribe"]
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
                await group_member.kick("Deactivated key.");
            };
        } else {
            throw new Error(`guildName ${botconfig.discord.guildName} is incorrect.`);
        };
    }
}

module.exports = Resubscribe;
