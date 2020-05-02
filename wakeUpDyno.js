'use strict';
const axios = require('axios');

// Wakes up a heroku app's dyno to prevent it from sleeping (and disabling our bot)

function wakeUpDyno (url, interval=1200000) {
    console.log(`Scheduling wake up call to ${interval / 60 / 1000} minutes`);
    setTimeout(() => {
        axios.get(url)
            .then(() => console.log('Hey! Wake up!'))
            .catch(err => console.log(`Ooops, something went wrong. Error: ${err}`))
            .finally(() => {
                wakeUpDyno(url, interval);
            });
    }, interval);
}

module.exports = wakeUpDyno;