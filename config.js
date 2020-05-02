if (process.env.NODE_ENV !== 'production') require('dotenv').config();

module.exports = {
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    termsToTrack: ['@coronavirusbrbot', '@CoronavirusBrBot', '@CoronavirusBRBot', '@CoronavirusBrB1', '@CoronavirusBRB1', '@coronavirusbrb1'],
    states: ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'],
    dynoUrl: 'https://aqueous-ravine-30915.herokuapp.com/'
};