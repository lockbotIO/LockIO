const express_server = require("./../etc/express.js");
const botconfig = require("./../../config.json");
const stripe = require("stripe")(botconfig.payment_processor.stripe.secret_key);

let manage_webhooks = function() {
    return new Promise(function(resolve, reject) {
        // First lets define our express endpoint URL.
        let endpoint = `https://${botconfig.heroku.app_name}.herokuapp.com/webhook/endpoint`;

        // Then we want to delete all webhooks to prevent duplicates.
        stripe.webhookEndpoints.list({limit: 100}, function(err, response) {
            if (err) {
                console.log(err);
                throw new Error("Error listing Stripe webhooks.");
            };
            let webhooks = response.data;
            if (webhooks.length > 0) {
                for (var i = 0; i < webhooks.length; i++) {
                    stripe.webhookEndpoints.del(webhooks[i].id, function(err, confirmation) {
                        if (err) {
                            throw new Error("Error deleting Stripe webhook.");
                        };
                        console.log(`Deleted Stripe webhook [${confirmation.id}].`);
                    });
                };
            };
            // After we cleared up the webhooks, we can create our own.
            stripe.webhookEndpoints.create({
                url: endpoint,
                enabled_events: ["customer.subscription.deleted", "checkout_beta.session_succeeded"],
                connect: false
            }, function(err, webhookEndpoint) {
                if (err) {
                    throw new Error("Error creating Stripe webhook.");
                };
                resolve(webhookEndpoint);
            });
        });
    });
};

let init = async function() {
    let new_webhook = await manage_webhooks();
};

module.exports = {
    manage_webhooks: manage_webhooks,
    init: init
};
