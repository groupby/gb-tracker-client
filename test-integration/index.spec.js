// These tests use Puppeteer with Headless Chrome to test how the compiled and
// bundled tracker client behaves in a web browser, and whether a beacon is
// accepted by a fake "beacon-consumer" app. If the beacon is accepted and has
// all the data we expect, the tests pass.

const chai = require('chai');
const expect = chai.expect;
const jsonDiff = require('json-diff');
const express = require('express');
const fs = require('fs-extra');
const puppeteer = require('puppeteer');

const beaconConsumerAppCtor = require('./apps/beacon-consumer/app');
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
const { EVENT_TYPE_ORDER } = require('../src/eventTypes');

log(`Detected tracker version: ${trackerVersion}`);

// Cleanup required after tests.
let closables;

/**
 * Prepares the test version of each site before the test starts. Builds a site
 * for each event type one at a time, specified by the parameter.
 * @param {string} eventType 
 */
function build(eventType) {
    const siteTemplate = fs.readFileSync(
        `test-integration/apps/sites/${eventType}.template.html`, UTF8);

    let site = siteTemplate.replace(
        '{{gbTrackerClientSrc}}', `gb-tracker-client-${trackerVersion}.js`);
    site = site.replace('{{beaconConsumerPort}}', `${PORT_BEACON_CONSUMER}`);

    fs.writeFileSync(`test-integration/apps/sites/index.html`, site);
}

/**
 * Creates Express apps for the fake consumer and site server, and stores
 * references to them so that they can be closed when the tests are complete.
 */
async function startServersAndBrowser() {
    const beaconConsumerApp = beaconConsumerAppCtor({
        beaconFilePath: 'receivedBeacon.json',
        logger: utils.logBeaconConsumer,
    });
    const beaconConsumerAppServer = beaconConsumerApp.listen(PORT_BEACON_CONSUMER, () => {
        log(`Beacon consumer app server listening on ${PORT_BEACON_CONSUMER}.`);
    });
    closables.push(beaconConsumerAppServer);

    const siteApp = express();
    siteApp.use(express.static('test-integration/apps/sites'));
    const siteAppServer = siteApp.listen(PORT_SITE, () => {
        log(`Site server listening on ${PORT_SITE}.`);
    });
    closables.push(siteAppServer);


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

    // Read beacon from disk and assert.
    const receivedBeacon = JSON.parse(
        fs.readFileSync(PATH_RECEIVED_BEACON, UTF8));

    // The following properties will be different each time a beacon is sent,
    // so we remove them before performing the "equal to" assertion, and just
    // assert that they are the right type and format:
    // - clientVersion.raw
    // - visit.customerData.sessionId
    // - visit.customerData.visitorId
    // - visit.generated.localTime
    expect(receivedBeacon.clientVersion).to.not.be.undefined;

    expect(receivedBeacon.clientVersion.raw).to.not.be.undefined;
    expect(receivedBeacon.clientVersion.raw).to.be.a('string');

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
    delete receivedBeacon.visit.customerData.sessionId;
    delete receivedBeacon.visit.customerData.visitorId;
    delete receivedBeacon.visit.generated.localTime;

    const jsonDiffStr = jsonDiff.diffString(
        receivedBeacon, expectedReceivedBeacon);

    if (jsonDiffStr !== '') {
        console.log(`Received beacon doesn't match expected. Diff:`,
            jsonDiffStr);
        throw new Error('JSON diff revealed difference in actual received '
            + 'beacon vs. expected received beacon.')
    }
}

/**
 * Creates the base expected received beacon. Each test builds upon it to
 * include the event type specific data.
 * @param {string} eventType 
 */
function expectedReceivedBeaconBase(eventType) {
    // Some data will have been removed before the assert because it is
    // different each time a beacon is sent, like visitorId.
    return {
        clientVersion: {},
        customer: {
            area: 'testarea',
            id: 'testcustomer',
        },
        eventType,
        visit: {
            customerData: {},
            generated: {
                timezoneOffset: 0,
                uri: `http://localhost:${PORT_SITE}/`,
            },
        },
        experiments: [
            {
                experimentId: 'testexperimentid',
                experimentVariant: 'testexperimentvariant',
            },
        ],
    };
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

        // Wait a bit before next test - helps with ports still in use.
        async function waitMs(ms) {
            return new Promise((accept, _) => {
                setTimeout(() => {
                    accept();
                }, ms);
            });
        }
        await waitMs(100);
    });

    // AutoSearch
    it('sends a valid AutoSearch beacon to a web API consumer app, which successfully receives the beacon', async () => {
        const eventType = 'autoSearch';

        build(eventType);

        const page = await startServersAndBrowser();

        const expectedReceivedBeacon = {
            ...expectedReceivedBeaconBase(eventType),
            search: {
                id: 'e30a4611-64b0-49a1-ad56-ab8fa2ffcc10',
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
        };

        await visitSiteAndAssert(page, expectedReceivedBeacon);
    }).timeout(TIMEOUT_MS);

    // Search
    it('sends a valid Search beacon to a web API consumer app, which successfully receives the beacon', async () => {
        const eventType = 'search';

        build(eventType);

        const page = await startServersAndBrowser();

        const expectedReceivedBeacon = {
            ...expectedReceivedBeaconBase(eventType),
            search: {
                query: "beacon",
                originalQuery: "beacon",
                correctedQuery: "beacon",
                totalRecordCount: 3,
                pageInfo: {
                    recordStart: 1,
                    recordEnd: 3
                },
                area: "Dev",
                selectedNavigation: [
                    {
                        name: "Survival Equipment",
                        displayName: "Survival Equipment",
                        refinements: [
                            {
                                type: "value",
                                value: "Survival Equipment"
                            }
                        ],
                        range: false,
                        or: false,
                    },
                ],
                records: [
                    {
                        _u: "http://www.example.co.uk/23PY",
                        collection: "test",
                    },
                    {
                        _u: "http://www.example.com/F20R"
                    },
                ],
                origin: {
                    search: true,
                    autosearch: false,
                    collectionSwitcher: false,
                    dym: false,
                    navigation: false,
                    recommendations: false,
                    sayt: false,
                }
            }
        };

        await visitSiteAndAssert(page, expectedReceivedBeacon);
    }).timeout(TIMEOUT_MS);

    // ViewProduct
    it('sends a valid ViewProduct beacon to a web API consumer app, which successfully receives the beacon', async () => {
        build('viewProduct');

        const page = await startServersAndBrowser();

        const expectedReceivedBeacon = {
            ...expectedReceivedBeaconBase('viewProduct'),
            product: {
                productId: 'testproductid',
                title: 'testtitle',
                collection: 'default',
            },
            searchAttributionToken: 'abc123',
        };

        await visitSiteAndAssert(page, expectedReceivedBeacon);
    }).timeout(TIMEOUT_MS);

    // AddToCart
    it('sends a valid AddToCart beacon to a web API consumer app, which successfully receives the beacon', async () => {
        const eventType = 'addToCart';

        build(eventType);

        const page = await startServersAndBrowser();

        const expectedReceivedBeacon = {
            ...expectedReceivedBeaconBase(eventType),
            cart: {
                cartType: 'mario cart',
                items: [
                    {
                        productId: 'testproductid',
                        title: 'testtitle',
                        collection: 'default',
                        quantity: 1,
                    },
                ],
            },
            searchAttributionToken: 'abc123',
        };

        await visitSiteAndAssert(page, expectedReceivedBeacon);
    }).timeout(TIMEOUT_MS);

    // RemoveFromCart
    it('sends a valid RemoveFromCart beacon to a web API consumer app, which successfully receives the beacon', async () => {
        const eventType = 'removeFromCart';

        build(eventType);

        const page = await startServersAndBrowser();

        const expectedReceivedBeacon = {
            ...expectedReceivedBeaconBase(eventType),
            cart: {
                cartType: 'mario cart',
                items: [
                    {
                        productId: 'testproductid',
                        title: 'testtitle',
                        collection: 'default',
                        quantity: 1,
                    },
                ],
            },
        };

        await visitSiteAndAssert(page, expectedReceivedBeacon);
    }).timeout(TIMEOUT_MS);

    // Order
    it('sends a valid Order beacon to a web API consumer app, which successfully receives the beacon', async () => {
        const eventType = EVENT_TYPE_ORDER;

        build(eventType);

        const page = await startServersAndBrowser();

        const expectedReceivedBeacon = {
            ...expectedReceivedBeaconBase(eventType),
            cart: {
                cartType: 'mario cart',
                items: [
                    {
                        productId: 'testproductid',
                        title: 'testtitle',
                        collection: 'default',
                        quantity: 1,
                    },
                ],
            },
            searchAttributionToken: 'abc123',
        };

        await visitSiteAndAssert(page, expectedReceivedBeacon);
    }).timeout(TIMEOUT_MS);

    // Impression
    it('sends a valid Impression beacon to a web API consumer app, which successfully receives the beacon', async () => {
        build('impression');

        const page = await startServersAndBrowser();

        const expectedReceivedBeacon = {
            ...expectedReceivedBeaconBase('impression'),
            impression: {
                impressionType: 'recommendation',
                products: [{
                    productId: 'asdfasd',
                    category: 'boats',
                    collection: 'boatssrus',
                    title: 'boats',
                    sku: 'asdfasf98',
                    price: 100.21,
                }],
            },

        };

        await visitSiteAndAssert(page, expectedReceivedBeacon);
    }).timeout(TIMEOUT_MS);

});
