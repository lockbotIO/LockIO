const botconfig = require("./../../../config.json");
const database = require("./../../etc/database.js");
const commando = require("discord.js-commando");
const {RichEmbed} = require('discord.js');

class Generate extends commando.Command {
    constructor (client) {
        super(client, {
            name: "generate",
            group: "security",
            memberName: "generate",
            description: "An admin command to generate a key.",
            examples: ["generate [mode] [e-mail]"],
            args: [
                {
                    key: "mode",
                    prompt: "Please enter the **mode** of the **key** `\"lifetime\" or \"regular\"`.",
                    type: "string",
                    validate: text => {
                        if (text === "regular" || text === "lifetime") return true;
                        return "The **mode** of the **key** can **only** be `\"lifetime\" or \"regular\"`.";
                    }
                },
                {
                    key: "email",
                    prompt: "Please enter the **e-mail** to send the **key** to.",
                    type: "string",
                    validate: text => {
                        if (text.includes("@")) return true;
                        return "Invalid **e-mail** address.";
                    }
                }
            ]
        });
    }

    hasPermission(message) {
        if (!this.client.isOwner(message.author)) return 'Only the bot owner(s) may use this command.';
        return true;
    }

    async run(message, {mode, email}) {
        let group_server = this.client.guilds.find(guild => guild.name === botconfig.discord.guildName),
            key;
        if (group_server) {
            if (mode === "lifetime") {
                key = await database.generate_key({
                    paymentEmail: email,
                    customerId: "Member",
                    subscriptionId: "Lifetime",
                    paymentTimestamp: Date.now(),
                    discordId: ""
                });
            } else if (mode === "regular") {
                key = await database.generate_key({
                    paymentEmail: email,
                    customerId: "Member",
                    subscriptionId: "Regular",
                    paymentTimestamp: Date.now(),
                    discordId: ""
                });
            }
            // Lets e-mail the customer his/her key.
            sendMail(email, key);
            let embed = new RichEmbed()
              .setColor("#00FF00")
              .setTitle(message.author.tag)
              .setThumbnail(message.author.displayAvatarURL)
              .setAuthor(botconfig.discord.guildName, group_server.iconURL || "https://discordapp.com/assets/dd4dbc0016779df1378e7812eabaa04d.png")
              .setFooter("LockIO", "https://i.imgur.com/t9hCq0m.png")
              .setTimestamp()
              .setDescription(`Successfully sent key \`${key}\` to **${email}**.`);
            await message.author.send({embed});
        } else {
            throw new Error(`guildName ${botconfig.discord.guildName} is incorrect.`);
        };
    }
}

module.exports = Generate;
