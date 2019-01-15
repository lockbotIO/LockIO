const botconfig = require("./../config.json");

// Verifying config.json
if (!botconfig.group.domain) {
    throw new Error("Please input your domain under \"group\" > \"domain\" in config.json!");
} else if (!botconfig.group.twitterHandle) {
    throw new Error("Please input your twitter handle under \"group\" > \"twitterHandle\" in config.json!");
} else if (!botconfig.discord.guildName) {
    throw new Error("Please exactly input your discord group name under \"discord\" > \"guildName\" in config.json!");
} else if (!botconfig.discord.botPrefix) {
    throw new Error("Please set a prefix under \"discord\" > \"botPrefix\" in config.json!");
} else if (!botconfig.discord.botToken) {
    throw new Error("Please input your discord bot token under \"discord\" > \"botToken\" in config.json!");
} else if (!botconfig.discord.discordInvite) {
    throw new Error("Please provide a permanent discord invite link to your group under \"discord\" > \"discordInvite\" in config.json!");
} else if (!Array.isArray(botconfig.discord.botOwnerIDs)) {
    throw new Error("\"discord\" > \"botOwnerIDs\" must be a list in config.json!");
} else if (!botconfig.discord.memberRole) {
    throw new Error("Please set a prefix under \"discord\" > \"botPrefix\" in config.json!");
} else if (botconfig.payment_processor.mode !== "stripe" && botconfig.payment_processor.mode !== "paypal") {
    throw new Error("\"payment_processor\" > \"mode\" must either be \"stripe\" or \"paypal\" in config.json!");
} else if (botconfig.payment_processor.mode === "stripe" && (!botconfig.payment_processor.stripe.publishable_key || !botconfig.payment_processor.stripe.secret_key)) {
    throw new Error("Please fill out \"publishable_key\" and \"secret_key\" under \"payment_processor\" > \"stripe\" in config.json!");
} else if (botconfig.payment_processor.mode === "paypal" && botconfig.payment_processor.paypal.mode !== "sandbox" && botconfig.payment_processor.paypal.mode !== "live") {
    throw new Error("\"paypal\" > \"mode\" must either be \"sandbox\" or \"live\" in config.json!");
} else if (botconfig.payment_processor.mode === "paypal" && (!botconfig.payment_processor.paypal.client_id || !botconfig.payment_processor.paypal.client_secret)) {
    throw new Error("Please fill out \"client_id\" and \"client_secret\" under \"payment_processor\" > \"paypal\" in config.json!");
} else if (!Number.isInteger(botconfig.express_server.port) || botconfig.express_server.port.toString().length != 4) {
    throw new Error("\"port\" under \"express_server\" must be a 4 digit integer in config.json!");
} else if (!botconfig.database.mongo_url) {
    throw new Error("Please input your mongo database URL under \"database\" > \"mongo_url\" in config.json!");
} else if (!botconfig.sendgrid_settings.apiKey) {
    throw new Error("Please input your SendGrid API key under \"sendgrid_settings\" > \"apiKey\" in config.json!");
} else if (!botconfig.sendgrid_settings.host) {
    throw new Error("Please input a sender e-mail under \"sendgrid_settings\" > \"host\" in config.json!");
};

if (botconfig.payment_processor.mode === "stripe") {
    // Launching Stripe Code
    const stripeProcessor = require('./payment_processors/stripe.js');
    stripeProcessor.init();
} else if (botconfig.payment_processor.mode === "paypal") {
    console.log("paypal processor");
};
