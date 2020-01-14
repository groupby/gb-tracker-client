// These tests use Puppeteer with Headless Chrome to test how the compiled and
// bundled tracker client behaves in a web browser, and whether a beacon is
// accepted by a fake "beacon-consumer" app. If the beacon is accepted and has
// all the data we expect, the tests pass.

const chai = require('chai');
const expect = chai.expect;
const jsonDiff = require('json-diff');
const http = require('http');
const createHttpServer = require('http-server').createServer;
const fs = require('fs-extra');
const puppeteer = require('puppeteer');

const beaconConsumerApp = require('./apps/beacon-consumer/app');
const utils = require('./utils');
const log = utils.log;

const NETWORK_IDLE = 'networkidle0';
const PORT_BEACON_CONSUMER = 8080;
const PORT_SITE = PORT_BEACON_CONSUMER + 1;
const PATH_RECEIVED_BEACON = 'receivedBeacon.json';
const PATH_BUILT_SITE = 'test-integration/apps/site/index.html';
const UTF8 = 'utf8';
const TIMEOUT_MS = 10000;
const trackerVersion = require('./version');

log(`Detected tracker version: ${trackerVersion}`);

// Cleanup required after tests.
let closables;

function build() {
    // Prepare test version of site. Fill in template with values for test.
    const siteTemplate = fs.readFileSync(`test-integration/apps/site/index.html.template`, UTF8);
    let site = siteTemplate.replace('{{gbTrackerClientSrc}}', `gb-tracker-client-${trackerVersion}.js`);
    site = site.replace('{{beaconConsumerPort}}', `${PORT_BEACON_CONSUMER}`);
    log(`Complete site:\n\n${site}`);
    fs.writeFileSync(`test-integration/apps/site/index.html`, site);
};

async function startServersAndBrowser() {
    const beaconConsumerAppServer = http.createServer(beaconConsumerApp({
        beaconFilePath: 'receivedBeacon.json',
        logger: utils.logBeaconConsumer,
    }));
    closables.push(beaconConsumerAppServer);
    beaconConsumerAppServer.listen(PORT_BEACON_CONSUMER, () => log(`Beacon consumer app server listening on ${PORT_BEACON_CONSUMER}.`));

    const siteServer = createHttpServer({
        root: `./test-integration/apps/site`,
    });
    closables.push(siteServer);
    siteServer.listen(PORT_SITE, () => log(`Site server listening on ${PORT_SITE}.`));

    const browser = await puppeteer.launch({
        headless: true,
        env: {
            TZ: 'UTC',
            ...process.env,
        },
    });
    closables.push(browser);

    const page = await browser.newPage();

    // The version will be different depending on when "npm install"
    // is run, since it grabs the latest Chromium binary each time.
    // Therefore, we manually set user agent version to something known.
    await page.setUserAgent('headlesschrome');

    return page;
}

async function visitSiteAndAssert(page, expectedReceivedBeacon) {
    await page.goto(`http://localhost:${PORT_SITE}`, {
        waitUntil: NETWORK_IDLE,
    });

    // Read beacon from disk and assert
    const receivedBeacon = JSON.parse(fs.readFileSync(PATH_RECEIVED_BEACON, UTF8));

    // The following properties will be different each time a beacon is sent,
    // so we remove them before performing the "equal to" assertion, and just
    // assert that they are the right type and format:
    // - clientVersion.raw
    // - search.id
    // - visit.customerData.sessionId
    // - visit.customerData.visitorId
    // - visit.generated.localTime
    expect(receivedBeacon.clientVersion).to.not.be.undefined;

    expect(receivedBeacon.clientVersion.raw).to.not.be.undefined;
    expect(receivedBeacon.clientVersion.raw).to.be.a('string');

    expect(receivedBeacon.search).to.not.be.undefined;

    expect(receivedBeacon.search.id).to.not.be.undefined;
    expect(receivedBeacon.search.id).to.be.a('string');

    expect(receivedBeacon.visit).to.not.be.undefined;
    expect(receivedBeacon.visit).to.be.a('object');

    expect(receivedBeacon.visit.customerData).to.not.be.undefined;
    expect(receivedBeacon.visit.customerData).to.be.a('object');

    expect(receivedBeacon.visit.customerData.sessionId).to.not.be.undefined;
    expect(receivedBeacon.visit.customerData.sessionId).to.be.a('string');

    expect(receivedBeacon.visit.customerData.visitorId).to.not.be.undefined;
    expect(receivedBeacon.visit.customerData.visitorId).to.be.a('string');

    expect(receivedBeacon.visit.generated).to.not.be.undefined;
    expect(receivedBeacon.visit.generated).to.be.a('object');

    expect(receivedBeacon.visit.generated.localTime).to.not.be.undefined;
    expect(receivedBeacon.visit.generated.localTime).to.be.a('string');
    // invalid ISO8601 date strings result in an error when parsed with
    // new Date() and toString()'d
    const localTime = receivedBeacon.visit.generated.localTime;
    const d = new Date(localTime);
    expect(d).to.be.a('Date');
    expect(d.toString()).not.eql('Invalid Date');

    // Delete nondeterministic properties and assert on rest of beacon.
    delete receivedBeacon.clientVersion.raw;
    delete receivedBeacon.search.id;
    delete receivedBeacon.visit.customerData.sessionId;
    delete receivedBeacon.visit.customerData.visitorId;
    delete receivedBeacon.visit.generated.localTime;

    expect(jsonDiff.diffString(receivedBeacon, expectedReceivedBeacon)).eql('');
}

describe('gb-tracker-client, running in a web browser', () => {
    beforeEach(() => {
        closables = [];

        fs.removeSync(PATH_RECEIVED_BEACON);
        fs.removeSync(PATH_BUILT_SITE);
        log('Deleted previously received beacon and previously built site from disk.');
    });

    afterEach(async () => {
        for (const c of closables) {
            await c.close();
        }
        log('Servers and headless browser closed.');
    });

    it('sends a beacon to a web API consumer app, which successfully receives the beacon', async () => {
        build();

        const page = await startServersAndBrowser();

        // Some data will have been removed before the "eql" assert because it
        // is different each time a beacon is sent, like visitorId.
        const expectedReceivedBeacon = {
            clientVersion: {},
            customer: {
                area: 'testarea',
                id: 'testcustomer',
            },
            eventType: 'autoSearch',
            search: {
                origin: {
                    autosearch: false,
                    collectionSwitcher: false,
                    dym: false,
                    navigation: false,
                    recommendations: false,
                    sayt: false,
                    search: true,
                },
            },
            visit: {
                customerData: {},
                generated: {
                    timezoneOffset: 0,
                    uri: `http://localhost:${PORT_SITE}/`,
                },
            },
        };

        await visitSiteAndAssert(page, expectedReceivedBeacon);
    }).timeout(TIMEOUT_MS);
});
