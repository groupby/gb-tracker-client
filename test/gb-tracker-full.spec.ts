// tslint:disable:no-unused-expression
import { expect } from 'chai';
import _ from 'lodash';
import jsdom from 'jsdom';
import moment from 'moment';
import uuid from 'uuid';

const GbTracker = require('../src');

describe('gb-tracker-full tests', () => {

  it('sending events refreshes session expiry when autoSetVisitor is used', (done) => {
    const cookieJar = new jsdom.CookieJar();

    const window = new jsdom.JSDOM(undefined, { cookieJar }).window;

    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    const CookiesLib = gbTrackerCore.__getInternals().COOKIES_LIB;
    CookiesLib._document = window.document;

    expect(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY)).to.be.undefined;
    expect(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY)).to.be.undefined;

    const SHORT_EXPIRY_SEC = 5;

    const visitorCookieValue = uuid.v4();
    const sessionCookieValue = uuid.v4();
    CookiesLib.set(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY, visitorCookieValue, { expires: Infinity });
    CookiesLib.set(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY, sessionCookieValue, { expires: SHORT_EXPIRY_SEC });

    let sessionCookie = _.find(cookieJar.toJSON().cookies, { key: gbTrackerCore.__getInternals().SESSION_COOKIE_KEY });
    console.log((sessionCookie as any).expires);
    expect(moment((sessionCookie as any).expires).valueOf()).to.be.most(moment().add(SHORT_EXPIRY_SEC, 'seconds').valueOf());
    expect(moment((sessionCookie as any).expires).valueOf()).to.be.least(moment().add(SHORT_EXPIRY_SEC - 2, 'seconds').valueOf());

    gbTrackerCore.autoSetVisitor();

    sessionCookie = _.find(cookieJar.toJSON().cookies, { key: gbTrackerCore.__getInternals().SESSION_COOKIE_KEY });
    // Minus 2 just to allow for a bit of lag between setting and checking the value
    expect(moment((sessionCookie as any).expires).valueOf()).to.be.least(moment().add(gbTrackerCore.__getInternals().SESSION_TIMEOUT_SEC - 2, 'seconds').valueOf());

    gbTrackerCore.__getInternals().sendEvent = () => {
      sessionCookie = _.find(cookieJar.toJSON().cookies, { key: gbTrackerCore.__getInternals().SESSION_COOKIE_KEY });
      expect(moment((sessionCookie as any).expires).valueOf()).to.be.most(moment().add(gbTrackerCore.__getInternals().SESSION_TIMEOUT_SEC, 'seconds').valueOf());
      done();
    };

    gbTrackerCore.sendAddToCartEvent({
      cart: {
        items: [
          {
            productId: 'asdfasd',
            category: 'boats',
            collection: 'boatssrus',
            title: 'boats',
            sku: 'asdfasf98',
            quantity: 10,
            price: 100.21,
          },
        ],
      },
    });
  });

  it('sending events does not set session when autoSetVisitor is not used', (done) => {
    const cookieJar = new jsdom.CookieJar();

    const window = new jsdom.JSDOM(undefined, { cookieJar }).window;

    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    const CookiesLib = gbTrackerCore.__getInternals().COOKIES_LIB;
    CookiesLib._document = window.document;

    expect(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY)).to.be.undefined;
    expect(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY)).to.be.undefined;

    gbTrackerCore.setVisitor(1 as any, 1 as any);

    let sessionCookie = _.find(cookieJar.toJSON().cookies, { key: gbTrackerCore.__getInternals().SESSION_COOKIE_KEY });
    expect(sessionCookie).to.be.undefined;

    gbTrackerCore.__getInternals().sendEvent = () => {
      sessionCookie = _.find(cookieJar.toJSON().cookies, { key: gbTrackerCore.__getInternals().SESSION_COOKIE_KEY });
      expect(sessionCookie).to.be.undefined;
      done();
    };

    gbTrackerCore.sendAddToCartEvent({
      cart: {
        items: [
          {
            productId: 'asdfasd',
            category: 'boats',
            collection: 'boatssrus',
            title: 'boats',
            sku: 'asdfasf98',
            quantity: 10,
            price: 100.21,
          },
        ],
      },
    });
  });

  it('throws during validation if strictMode is on and there are extra fields in event', () => {
    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    gbTrackerCore.setStrictMode(true);

    const validationSchema = {
      type: 'object',
      strict: true,
      properties: {
        eventType: {
          type: 'string',
        },
        thing: {
          type: 'string',
        },
        anotherThing: {
          type: 'integer',
        },
      },
    };

    const sanitizationSchema = {
      strict: true,
      properties: {
        eventType: {},
        thing: {},
        anotherThing: {},
      },
    };

    const schemas = {
      sanitization: sanitizationSchema,
    };

    const event: any = {
      eventType: 'eventType',
      thing: 'string',
      anotherThing: 190,
      extraThing: {
        subExtra: 'fo sho',
      },
    };

    expect(() => gbTrackerCore.__getInternals().validateEvent(event, schemas)).to.throw('Unexpected fields ["extraThing"] in eventType: eventType');
  });

  it('appends warnings about stripped fields to metadata', () => {
    const gbTrackerCore = new GbTracker('testcustomer', 'area');

    const validationSchema = {
      type: 'object',
      strict: true,
      properties: {
        eventType: {
          type: 'string',
        },
        thing: {
          type: 'string',
        },
        anotherThing: {
          type: 'integer',
        },
      },
    };

    const sanitizationSchema = {
      strict: true,
      properties: {
        eventType: {},
        thing: {},
        anotherThing: {},
      },
    };

    const schemas = {
      sanitization: sanitizationSchema,
    };

    const event: any = {
      eventType: 'eventType',
      thing: 'string',
      anotherThing: 190,
      extraThing: {
        subExtra: 'fo sho',
      },
    };

    const validated = gbTrackerCore.__getInternals().validateEvent(event, schemas);

    expect((validated.event as any).metadata).to.eql([
      {
        key: 'gbi-field-warning',
        value: 'extraThing',
      },
    ]);
  });
});
