'use strict';

const express = require('express');
const Twit = require('twit');
const config = require('./config');
const port = 3000;

const app = express();

let T = new Twit(config);
let termsToTrack = ['#BBBAEliminação'];

T.get('account/verify_credentials', {
    include_entities: false,
    skip_status: true,
    include_status: false
}, onAuthenticated);

function onAuthenticated (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('Authentication successful!');

        let stream = T.stream('statuses/filter', { track: termsToTrack, tweet_mode: 'extended'});
        stream.on('tweet', (tweet) => {
            if (!tweet.retweeted_status){
                console.log(tweet.text);
            }
        });
    }
}

function sendTweet () {
    T.post('statuses/update', { status: 'Automated message testing.' });
}

app.listen(port, () => console.log(`Running server on http://127.0.0.1:${port}`));