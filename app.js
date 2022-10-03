const { TibberFeed } = require('tibber-api');
const JSONdb = require('simple-json-db');
const db = new JSONdb('storage.json');
require('dotenv').config()

const express = require("express");
const app = express();
const port = 3030;

// Config object needed when instantiating TibberQuery
const config = {
    // Endpoint configuration.
    apiEndpoint: {
        apiKey: process.env.TIBBER_TOKEN, // Demo token
        feedUrl: 'wss://api.tibber.com/v1-beta/gql/subscriptions',
    },
    // Query configuration.
    homeId: process.env.TIBBER_HOME_ID,
    timestamp: true,
    power: true,
};

// Instantiate TibberFeed.
const tibberFeed = new TibberFeed(config);

// Subscribe to "data" event.
tibberFeed.on('data', (data) => {
    console.log(data);
    db.set('power', data.power);
    db.set('timestamp', data.timestamp);
});

// Connect to Tibber data feed
tibberFeed.connect();

app.get("/power", (request, response) => {
    const value = db.get('power');
    response.status(200);
    response.send("" + value);
});

app.listen(port, (err) => {
    if (err) {
        return console.log("something bad happened", err);
    }
    console.log("server is listening on " + port);
});