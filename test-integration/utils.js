const moment = require('moment');

const tsFormat = () => moment().format('YYYY-MM-DD hh:mm:ss:SSS').trim();

// Logger functions for tests and apps spun up in background that tests
// interact with.
function log(msg) {
    console.log(`${tsFormat()} - TEST SUITE - ${msg}`);
}

function logBeaconConsumer(msg) {
    console.log(`${tsFormat()} - BEACON CONSUMER - ${msg}`);
}

module.exports = {
    log,
    logBeaconConsumer,
};