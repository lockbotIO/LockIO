const botconfig = require("./../../config.json");
const database = require("./database.js");
const bodyParser = require("body-parser");
const express = require("express");

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Initialize the app.
let server = app.listen(process.env.PORT || botconfig.express_server.port || 8080, function () {
    let host = server.address().address;
    let port = server.address().port;
    console.log(`Express server launched at: https://${host}:${port}/`);
});

app.get("/webhook/endpoint", function(req, res) {
    let _event = JSON.parse(req.body.read);
    if (_event["type"] === "checkout_beta.session_succeeded") {
        // Let's retrieve this new subscription.
        stripe.subscriptions.retrieve(_event.data.object.subscription, function(err, subscription) {
            // Now let's get the customer.
            stripe.customers.retrieve(subscription.customer, function(err, customer) {
                let key = await database.generate_key({
                    paymentEmail: customer.email,
                    customerId: customer.id,
                    subscriptionId: subscription.id,
                    paymentTimestamp: Date.now(),
                    discordId: ""
                });
                // Lets e-mail the customer his/her key.
            });
        });
    } else if (_event["type"] === "customer.subscription.deleted") {

    };
});

module.exports = server;
