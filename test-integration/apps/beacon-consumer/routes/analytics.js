const fs = require('fs');

module.exports = ({ beaconFilePath, logger }) => {
    return (req, res, _) => {
        logger(`Beacon consumer received request. Instructed to write beacon to ${beaconFilePath}.`);

        const beacon = req.body;

        // UNCOMMENT FOR MORE LOGGING FOR TROUBLESHOOTING TESTS
        logger(`Received beacon:`);
        logger(JSON.stringify(beacon, null, 2));
    
        fs.writeFileSync(beaconFilePath, JSON.stringify(beacon));
        logger(`Wrote beacon to disk at: ${beaconFilePath}`);
    
        // No pre-flight OPTIONS is needed and no body is sent, but this prevents
        // scary error messages in the browser when it tries to read the body of the
        // response. Cannot use wildcard * because AMP runtime sends cookie creds.
        res.set('Access-Control-Allow-Credentials', true);
        res.set('Access-Control-Allow-Origin', req.headers.origin);
    
        // No body is needed, just 2xx response.
        res.status(204).send();
    };
};
