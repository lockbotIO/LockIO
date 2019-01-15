const botconfig = require("./../../config.json");
const stripe = require("stripe")(botconfig.payment_processor.stripe.secret_key);
const database = require("./database.js");
const bodyParser = require("body-parser");
const {RichEmbed} = require('discord.js');
const sendMail = require("./mailer.js");
const lockIO = require("./disc.js");
const express = require("express");
const app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Initialize the app.
let server = app.listen(process.env.PORT || botconfig.express_server.port || 8080, function () {
    let host = server.address().address;
    let port = server.address().port;
    console.log(`Express server launched at: https://${botconfig.heroku.app_name}.herokuapp.com:${port}/`);
});

app.post("/webhook/endpoint", function(req, res) {
    let _event = req.body;
    if (_event["type"] === "checkout_beta.session_succeeded") {
        // Let's retrieve this new subscription.
        stripe.subscriptions.retrieve(_event.data.object.subscription, function(err, subscription) {
            // Now let's get the customer.
            stripe.customers.retrieve(subscription.customer, async function(err, customer) {
                let key = await database.generate_key({
                    paymentEmail: customer.email,
                    customerId: customer.id,
                    subscriptionId: subscription.id,
                    paymentTimestamp: Date.now(),
                    discordId: ""
                });
                // Lets e-mail the customer his/her key.
                sendMail(customer.email, key);
            });
        });
    } else if (_event["type"] === "customer.subscription.deleted") {
        // Let's cancel his/her key.
        (async () => {
            // Remove person off server.
            let group_server = lockIO.guilds.find(guild => guild.name === botconfig.discord.guildName);
            if (group_server) {
                // Remove key off database.
                let key_data = await database.cancel_key(_event.data.object.customer);
                let author = await lockIO.fetchUser(key_data.discordId);
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
            } else {
                throw new Error(`guildName ${botconfig.discord.guildName} is incorrect.`);
            };
        })();
    };
});

module.exports = server;
