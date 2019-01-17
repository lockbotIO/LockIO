const botconfig = require("./../../config.json");
const mongo = require('mongodb').MongoClient;
const _ = require("underscore");

// Group's Database
mongo.connect(botconfig.database.mongo_url, {useNewUrlParser: true}, function (err, client) {
    if (err) {
        console.log(err);
        process.exit(1);
    };
    // Save database object from the callback for reuse.
    db = client.db();
    keys = db.collection("keys");
});

module.exports = {
    verify_key: function(key, discordId, email) {
        return new Promise(function(resolve, reject) {
            keys.findOne({key: key}, function(err, doc) {
                if (err) {
                    reject("Error connecting to database.");
                } else if (doc === null || doc === undefined) {
                    resolve("Your **key** or **e-mail** is incorrect.");
                } else if (doc.discordId && doc.discordId != discordId) {
                    resolve(`\`${key}\` is already activated.`);
                } else if (doc.discordId == "" || doc.discordId == discordId) {
                    keys.findOne({discordId: discordId}, function(err, doc2) {
                        if (err) {
                            reject("Error connecting to database.");
                        } else if (doc2 !== null && !_.isEqual(doc, doc2)) {
                            resolve("You already have a key linked to your discord account.");
                        };
                        keys.updateOne(doc, {$set: {discordId: discordId}}, function(err, res) {
                            if (err) {
                                reject("Error connecting to database.");
                            };
                            resolve({
                                "Key": key,
                                "Discord ID": discordId,
                                "Customer ID": doc.customerId,
                                "Subscription ID": doc.subscriptionId,
                                "Payment E-mail": email,
                                "Payment Timestamp (ISO)": new Date(doc.paymentTimestamp).toISOString()
                            });
                        });
                    });
                } else {
                    reject("Something wrong happened.");
                };
            });
        });
    },
    unverify_key: function(discordId) {
        return new Promise(function(resolve, reject) {
            keys.findOne({discordId: discordId}, function(err, doc) {
                if (err) {
                    reject("Error connecting to database.");
                } else {
                    keys.updateOne(doc, {$set: {discordId: ""}}, function(err, res) {
                        if (err) {
                            reject("Error connecting to database.");
                        };
                        resolve("Successfully deactivated.");
                    });
                };
            });
        });
    },
    generate_key: function(key_payload) {
        return new Promise(function(resolve, reject) {
            let key = "", alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
            for (var x = 0; x < 5; x++) {
                let chunk = "-";
                for (var i = 0; i < 5; i++) {
                    chunk += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
                };
                key += chunk;
            };
            key_payload["key"] = key.slice(1);
            keys.insertOne(key_payload, function(err, response) {
                if (err) {
                    reject("Error connecting to database.");
                };
                resolve(key);
            });
        });
    },
    cancel_key: function(customer_id) {
        keys.findOneAndDelete({customerId: customer_id}, function(err, doc) {
            if (err) {
                reject("Error connecting to database.");
            };
            console.log(`Deleted ${customer_id}'s information from database. (Subscription Cancelled)`);
        });
    },
    find_key: function(query_key, query_value) {
        return new Promise(function(resolve, reject) {
            keys.findOne({query_key: query_value}, function(err, doc) {
                if (err) {
                    reject("Error connecting to database.");
                } else {
                    resolve(doc);
                };
            });
        });
    }
};
