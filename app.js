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

const tibberFeed = new TibberFeed(config);

const startTibberFeed = () => {
    tibberFeed.on('data', (data) => {
        console.log(data);
        db.set('power', data.power);
        db.set('timestamp', data.timestamp);
    });

    // Connect to Tibber data feed
    tibberFeed.connect();
}

const stopTibberFeed = () => {
    tibberFeed.close();
}

startTibberFeed();

const isTibberAlive = () => {
    const timestamp = db.get('timestamp');
    const date = new Date(timestamp);
    const now = new Date();

    const diff = now - date;
    var active = true;
    if (diff > 300000) {
        console.log("TibberFeed has timeout!", diff);
        active = false;
    }
    if (!active) {
        console.log("Restarting TibberFeed!");
        try {
            stopTibberFeed();
        } catch (err) { }
        startTibberFeed();
    }
}


app.get("/power", (request, response) => {
    isTibberAlive();
    const value = db.get('power');
    console.log("Power Fetch: ", value)
    response.status(200);
    response.send("" + value);
});

app.listen(port, (err) => {
    if (err) {
        return console.log("something bad happened", err);
    }
    console.log("server is listening on " + port);
});