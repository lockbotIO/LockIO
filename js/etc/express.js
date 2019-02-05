const botconfig = require("./../../config.json");
const stripe = require("stripe")(botconfig.payment_processor.stripe.secret_key);
const queryString = require('query-string');
const database = require("./database.js");
const bodyParser = require("body-parser");
const sendMail = require("./mailer.js");
const express = require("express");
const request = require('request');
const bot = require("./disc.js");
const app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

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

app.post("/webhook/endpoint/paypal", async function(req, res) {

    // Return 200 to caller
    res.status(200);

    // Read the IPN message sent from PayPal and prepend 'cmd=_notify-validate'
    let body = 'cmd=_notify-validate&' + req.body;

    let options = {
        url: 'https://www.sandbox.paypal.com/cgi-bin/webscr',
        method: 'POST',
        headers: {
            'Connection': 'close'
        },
        body: body,
        strictSSL: true,
        rejectUnauthorized: false,
        requestCert: true,
        agent: false
    };

    // POST IPN data back to PayPal to validate
    request(options, async function callback(error, response, body) {
        if (!error && response.statusCode === 200) {

            //Inspect IPN validation result and act accordingly
            if (body.substring(0, 8) === 'VERIFIED') {
                // The IPN is verified
                console.log('Valid IPN.');
                let parsed = queryString.parse(decodeURIComponent(req.body));
                switch (parsed.txn_type) {
                    case "subscr_signup":
                        let key = await database.generate_key({
                            paymentEmail: parsed.payer_email,
                            customerId: parsed.payer_id,
                            subscriptionId: parsed.subscr_id,
                            paymentTimestamp: Date.now(),
                            discordId: ""
                        });
                        // Lets e-mail the customer his/her key.
                        sendMail(parsed.payer_email, key);
                        break;
                    case "subscr_eot":
                        // Remove key off database. Will be swept up by on_ready.
                        database.cancel_key(parsed.subscr_id);
                        break;
                };
            } else if (body.substring(0, 7) === 'INVALID') {
                // The IPN invalid
                console.log('Invalid IPN.');
            } else {
                // Unexpected response body
                console.log(`Unexpected IPN verification body response: ${body}`);
            };
        } else {
            // Unexpected response
            console.log(`Unexpected IPN verification response: ${response}`);
        };
    });
});

module.exports = server;
