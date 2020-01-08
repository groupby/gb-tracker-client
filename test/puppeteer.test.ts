// These tests use Puppeteer with Headless Chrome to test how the compiled and
// bundled tracker client behaves in a web browser, and whether a beacon is
// accepted by a fake "beacon-consumer" app. If the beacon is accepted and has
// all the data we expect, the tests pass.

import { expect } from 'chai';
const http = require('http');
const createHttpServer = require('http-server').createServer;

const NETWORK_IDLE = 'networkidle0';
const PORT_BEACON_CONSUMER = 8080;
const PORT_SITE = PORT_BEACON_CONSUMER + 1;
const PATH_RECEIVED_BEACON = 'receivedBeacon.json';
const PATH_BUILT_AMP_SITE = 'test/apps/amp-site/index.html';
const PATH_BUILT_AMP_SITE_DEV = 'test/apps/amp-site-dev/index.html';
const UTF8 = 'utf8';
const TIMEOUT_MS = 10000;

// Cleanup required after tests.
let closables;

describe('built gb-tracker-client, running in a web browser', () => {
    it('allows a beacon to be sent to a web API that receives the beacon', () => {

    });
});
