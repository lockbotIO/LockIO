const express_server = require("./../etc/express.js");
const botconfig = require("./../../config.json");
const paypal = require('paypal-rest-sdk');

paypal.configure({
    "mode": botconfig.payment_processor.paypal.mode, //sandbox or live
    "client_id": botconfig.payment_processor.paypal.client_id,
    "client_secret": botconfig.payment_processor.paypal.client_secret
});
