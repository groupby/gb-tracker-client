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

    // for "search" event type
    app.post('/', pixelParser, handler);

    // For all other event types
    [
        'autoSearch',
        'viewProduct',
        'addToCart',
        'removeFromCart',
        'order',
        'impression'
    ].forEach(eventType => app.post(`/gbi-event-${eventType}`, pixelParser, handler));

    return app;
}
