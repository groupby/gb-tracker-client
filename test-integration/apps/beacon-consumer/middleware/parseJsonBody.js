const bodyParser = require('body-parser');

/**
 * To avoid pre-flight OPTIONS with our new POST approach for beacons, we send
 * the requests with Content-Type set to "text/plain". Therefore, the Express
 * framework cannot parse the beacon from the JSON body automatically. We need
 * to manually parse it.
 * 
 * This middleware parses bodies from these "sneaky" JSON body requests.
 */
module.exports = [
    bodyParser.text(),
    function (req, res, next) {
        try {
            req.body = JSON.parse(req.body);
            return next();
        } catch (e) {
            console.error(`Error parsing pixel body: ${e.message}`);
            return res.status(400).send();
        }
    }
];
