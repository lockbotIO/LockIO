const botconfig = require("./../../config.json");
const stripe = require("stripe")(botconfig.payment_processor.stripe.secret_key);
const database = require("./database.js");
const bodyParser = require("body-parser");
const sendMail = require("./mailer.js");
const ipn = require("express-ipn");
const bot = require("./disc.js");

const app = require('express')();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: false})); // IPN data is sent in the body as x-www-form-urlencoded data

// Initialize the app.
let server = app.listen(process.env.PORT || botconfig.express_server.port || 8080, function () {
    let host = server.address().address;
    let port = server.address().port;
    console.log(`Express server launched at: https://${botconfig.heroku.app_name}.herokuapp.com:${port}/`);
});

app.post("/webhook/endpoint/stripe", function(req, res) {
    let _event = req.body;
    if (_event["type"] === "customer.subscription.created") {
        // Let's retrieve this new subscription.
        stripe.subscriptions.retrieve(_event.data.object.id, function(err, subscription) {
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
        // Remove key off database. Will be swept up by on_ready.
        database.cancel_key(_event.data.object.id);
    };
    res.status(200).json({status: "acknowledged"});
});

app.post("/webhook/endpoint/paypal", ipn.validator(async (err, ipnContent) => {
    if (err) {
        console.error("IPN invalid"); // The IPN was invalid
    } else {
        switch (ipnContent.txn_type) {
            case "subscr_signup":
                let key = await database.generate_key({
                    paymentEmail: ipnContent.payer_email,
                    customerId: ipnContent.payer_id,
                    subscriptionId: ipnContent.subscr_id,
                    paymentTimestamp: Date.now(),
                    discordId: ""
                });
                // Lets e-mail the customer his/her key.
                sendMail(ipnContent.payer_email, key);
                break;
            case "subscr_eot":
                // Remove key off database. Will be swept up by on_ready.
                database.cancel_key(ipnContent.subscr_id);
                break;
        };
    };
}, true));

module.exports = server;
