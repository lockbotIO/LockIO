const botconfig = require("./../../../config.json");
const database = require("./../../etc/database.js");
const commando = require("discord.js-commando");
const {RichEmbed} = require('discord.js');

class Activate extends commando.Command {
    constructor (client) {
        super(client, {
            name: "activate",
            group: "security",
            memberName: "activate",
            description: "Activates your key to grant access to the group.",
            clientPermissions: ["MANAGE_ROLES"],
            examples: ["activate [key] [e-mail]"],
            throttling: {
                usages: 2,
                duration: 10
            },
            args: [
                {
                    key: "key",
                    prompt: "Please enter your **key**.",
                    type: "string",
                    validate: text => {
                        if (text.length == 26) return true;
                        return "Your **key** is incorrect.";
                    }
                },
                {
                    key: "email",
                    prompt: "Please enter the **e-mail** you purchased with.",
                    type: "string",
                    validate: text => {
                        if (text.includes("@")) return true;
                        return "Your **e-mail** is incorrect.";
                    }
                }
            ]
        });
    }

    async run(message, {key, email}) {
        let group_server = this.client.guilds.find(guild => guild.name === botconfig.discord.guildName);
        if (group_server) {
            let response = await database.verify_key(key, message.author.id, email);
            let embed = new RichEmbed()
              .setColor("#00FF00")
              .setTitle(message.author.tag)
              .setThumbnail(message.author.displayAvatarURL)
              .setAuthor(botconfig.discord.guildName, group_server.iconURL || "https://discordapp.com/assets/dd4dbc0016779df1378e7812eabaa04d.png")
              .setFooter("LockIO", "https://i.imgur.com/t9hCq0m.png")
              .setTimestamp();
            if (typeof response === "object" && response !== null) {
                let group_member = group_server.members.get(message.author.id);
                if (response["Subscription ID"] === "Lifetime") {
                    let lifetime_role = group_server.roles.find(role => role.name === botconfig.discord.lifetimeRole);
                    await group_member.addRole(lifetime_role);
                };
                let members_role = group_server.roles.find(role => role.name === botconfig.discord.memberRole);
                await group_member.addRole(members_role);
                embed.setDescription("Account **successfully** authenticated!")
                Object.keys(response).forEach(key => {
                    embed.addField(key, response[key], true);
                });
            } else {
                embed.setDescription(response);
            };
            await message.author.send({embed});
        } else {
            throw new Error(`guildName ${botconfig.discord.guildName} is incorrect.`);
        };
    }
}

module.exports = Activate;
