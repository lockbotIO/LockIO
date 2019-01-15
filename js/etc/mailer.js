const botconfig = require("./../../config.json");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(botconfig.sendgrid_settings.apiKey);

module.exports = function (to, key) {
    let msg = {
        to: to,
        from: {
            name: botconfig.discord.guildName,
            email: botconfig.sendgrid_settings.host
        },
        subject: "Subscription Delivery",
        html: `Congratulations on joining ${botconfig.discord.guildName}!<br>We received and processed your payment. Your product details are listed below.<br><br><strong>Key: </strong>${key}<br><strong>Discord: </strong><a href="${botconfig.discord.discordInvite}">${botconfig.discord.discordInvite}</a><br><strong>Twitter: </strong><a href="https://twitter.com/${botconfig.group.twitterHandle}">https://twitter.com/${botconfig.group.twitterHandle}</a><br><br><br>If you have any questions, feel free to DM us on twitter!<br>We appreciate all your support.<br><strong>Warm Regards,<br>${botconfig.discord.guildName} Team</strong>`
    };
    sgMail.send(msg, function(error, result) {
        if (error) {
            console.log(`Failed to send key ${key} to ${to}.`);
        } else {
            console.log(`Successfully sent key ${key} to ${to}.`);
        };
    });
};
