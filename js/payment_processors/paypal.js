const express_server = require("./../etc/express.js");
const botconfig = require("./../../config.json");
const paypal = require('paypal-rest-sdk');

paypal.configure({
    "mode": botconfig.payment_processor.paypal.mode, //sandbox or live
    "client_id": botconfig.payment_processor.paypal.client_id,
    "client_secret": botconfig.payment_processor.paypal.client_secret
});

let manage_webhooks = function() {
    // First lets define our express endpoint URL.
    let endpoint = `https://${botconfig.heroku.app_name}.herokuapp.com/webhook/endpoint/paypal`;

    paypal.notification.webhook.create({
        url: endpoint,
        event_types: [{name: "BILLING.SUBSCRIPTION.CREATED"}, {name: "BILLING.SUBSCRIPTION.CANCELLED"}]
    }, function (error, webhook) {
        if (error) {
            console.log(`Failed to create a PayPal webhook, most likely because it already exists.`);
        } else {
            console.log(`Created PayPal webhook [${webhook.id}].`);
        };
    });
};

module.exports = {
    manage_webhooks: manage_webhooks
};
