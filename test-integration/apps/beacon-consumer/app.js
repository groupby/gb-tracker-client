const express = require('express');
const morgan = require('morgan');

const pixelParser = require('./middleware/parseJsonBody');
const analyticsHandler = require('./routes/analytics');

module.exports = ({ beaconFilePath, logger }) => {
    const app = express();

    app.use(morgan('dev'));

    const handler = analyticsHandler({
        beaconFilePath,
        logger,
    });

    app.post('/', pixelParser, handler);

    return app;
}
