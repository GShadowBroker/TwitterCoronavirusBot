'use strict';

const express = require('express');
const Twit = require('twit');
const config = require('./config');
const axios = require('axios');
const port = 3000;

const app = express();

let T = new Twit(config);
let termsToTrack = ['@coronavirusbrbot', '@CoronavirusBrBot', '@CoronavirusBRBot'];

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
            if (!tweet.retweeted_status && isTweetExactMatch(tweet.text) && tweet.user.screen_name !== 'Não tem biscoito') {
                console.log(tweet.text);
                sendReply(tweet);
            }
        });
    }
}

function sendReply (tweet) {
    let screenName = tweet.user.screen_name;
    axios.get('https://covid19-brazil-api.now.sh/api/report/v1/brazil')
        .then(response => {
            let msg = `@${screenName} No Brasil há atualmente ${response.data.data.confirmed} casos confirmados, ${response.data.data.deaths} mortes e ${response.data.data.recovered} recuperados.`;
            
            T.post('statuses/update', {
                in_reply_to_status_id: tweet.id_str,
                status: msg
            }, onTweeted);
        })
        .catch(err => console.log(err));
}

function isTweetExactMatch (text) {
    text = text.toLowerCase();
    return termsToTrack.some(term => text.includes(term));
}

function sendTweet (text) {
    T.post('statuses/update', { status: text });
}

function onTweeted () {
    console.log("Bot has replied to a user successfully.");
}

app.listen(port, () => console.log(`Running server on http://127.0.0.1:${port}`));