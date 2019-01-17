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

    // Then we want to delete all webhooks to prevent duplicates.
    paypal.notification.webhook.list(function (error, webhooks) {
        if (error) {
            throw new Error("Error listing PayPal webhooks.");
        } else {
            for (var i = 0; i < webhooks.length; i++) {
                paypal.notification.webhook.del(webhooks[i].id, function (error, response) {
                    if (error) {
                        throw new Error("Error deleting PayPal webhook.");
                    } else {
                        console.log(`Deleted PayPal webhook [${webhooks[i].id}].`);
                    };
                });
            };
        };

        // After we cleared up the webhooks, we can create our own.
        paypal.notification.webhook.create({
            url: endpoint,
            event_types: [{name: "BILLING.SUBSCRIPTION.CREATED"}, {name: "BILLING.SUBSCRIPTION.CANCELLED"}]
        }, function (error, webhook) {
            if (error) {
                throw new Error("Error creating PayPal webhook.");
            } else {
                console.log(`Created Stripe webhook [${webhook.id}].`);
            };
        });
    });
};

module.exports = {
    manage_webhooks: manage_webhooks
};
