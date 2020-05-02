'use strict';

const express = require('express');
const Twit = require('twit');
const config = require('./config');
const wakeUpDyno = require('./wakeUpDyno');
const axios = require('axios');
const moment = require('moment');
require('./node_modules/moment/locale/pt-br');
const port = process.env.PORT || 8080;

const app = express();

let T = new Twit(config);

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

        let stream = T.stream('statuses/filter', { track: config.termsToTrack, tweet_mode: 'extended'});
        stream.on('tweet', (tweet) => {
            if (!tweet.retweeted_status
                && isTweetExactMatch(tweet.text)
                && tweet.user.screen_name !== 'CoronavirusBRBot') {

                console.log(tweet.text);
                sendReply(tweet);
            }
        });
    }
}

function sendReply (tweet) {
    let screenName = tweet.user.screen_name;
    let regex = /{(\s*)\w+(\s*)}/gi;

    if (!tweet.text.match(regex)) {
        console.log('Someone replied to our bot but the command was not recognized.')
        return false
    }

    let uf = tweet.text.match(regex)[0]
                .replace(/{\s+|\s+}/g, '')
                .replace(/({|})/g, '')
                .trim()
                .toUpperCase();
    
    if (config.states.includes(uf)) {
        return axios.get(`https://covid19-brazil-api.now.sh/api/report/v1/brazil/uf/${uf}`)
            .then(response => {
                let lastUpdate = moment(response.data.datetime).fromNow();
                let msg = `@${screenName} Em ${response.data.state} há atualmente ${response.data.cases} casos confirmados, ${response.data.suspects} casos suspeitos e ${response.data.deaths} mortes. Última vez atualizado: ${lastUpdate}.`;
                T.post('statuses/update', {
                    in_reply_to_status_id: tweet.id_str,
                    status: msg
                }, onTweeted);
            })
            .catch(err => console.log(err));
    } else if (uf === 'BRASIL' || uf === 'BRAZIL') {
        return axios.get('https://covid19-brazil-api.now.sh/api/report/v1/brazil')
            .then(response => {
                let lastUpdate = moment(response.data.data.updated_at).fromNow();
                let msg = `@${screenName} No Brasil há atualmente ${response.data.data.confirmed} casos confirmados, ${response.data.data.deaths} mortes e ${response.data.data.recovered} recuperados. Última vez atualizado: ${lastUpdate}.`;
                
                T.post('statuses/update', {
                    in_reply_to_status_id: tweet.id_str,
                    status: msg
                }, onTweeted);
            })
            .catch(err => console.log(err));
    }
    console.log(`Command {${uf}} not recognized`);
    return false
}

function isTweetExactMatch (text) {
    text = text.toLowerCase();
    return config.termsToTrack.some(term => text.includes(term));
}

function sendTweet (text) {
    T.post('statuses/update', { status: text });
}

function onTweeted () {
    console.log("Bot has replied to a user successfully.");
}

app.listen(port, () => {
    console.log(`Running server on http://127.0.0.1:${port}`);
    wakeUpDyno(config.dynoUrl);
});