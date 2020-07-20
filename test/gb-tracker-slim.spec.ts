// tslint:disable:no-unused-expression
import { expect } from 'chai';
import _ from 'lodash';
import jsdom from 'jsdom';
import moment from 'moment';
import cuid from 'cuid';

const GbTracker = require('../src/slim');

describe('gb-tracker-slim tests', () => {

  it('sending events refreshes session expiry when autoSetVisitor is used', (done) => {
    const cookieJar = new jsdom.CookieJar();

    const window = new jsdom.JSDOM(undefined, {cookieJar}).window;

    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    const CookiesLib = gbTrackerCore.__getInternals().COOKIES_LIB;
    CookiesLib._document = window.document;

    expect(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY)).to.be.undefined;
    expect(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY)).to.be.undefined;

    const SHORT_EXPIRY_SEC = 5;

    const visitorCookieValue = cuid();
    const sessionCookieValue = cuid();
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

    const window = new jsdom.JSDOM(undefined, {cookieJar}).window;

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

  it('should validate valid event', () => {
    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    gbTrackerCore.__getInternals().sendEvent = () => { /* */ };
    gbTrackerCore.setVisitor('visitor', 'session');

    const validationSchema = {
      type: 'object',
      strict: true,
      properties: {
        thing: {
          type: 'string',
        },
        anotherThing: {
          type: 'integer',
        },
      },
    };

    const schemas: any = {
      validation: validationSchema,
    };

    const event: any = {
      thing: 'yo',
      anotherThing: 190,
    };

    const validated = gbTrackerCore.__getInternals().validateEvent(event, schemas);

    expect((validated as any).event.thing).to.eql('yo');
    expect((validated as any).event.anotherThing).to.eql(190);
    expect((validated as any).event.extraThing).to.be.undefined;
    expect((validated as any).event.visit.generated.timezoneOffset).to.not.be.undefined;
  });

  it('should drop an invalid event', () => {
    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    gbTrackerCore.__getInternals().sendEvent = () => { /* */ };
    gbTrackerCore.setVisitor('visitor', 'session');

    const validationSchema = {
      type: 'object',
      strict: true,
      properties: {
        thing: {
          type: 'string',
        },
        anotherThing: {
          type: 'integer',
        },
      },
    };

    const schemas: any = {
      validation: validationSchema,
    };

    const event: any = {
      thing: {
        shouldNotBeAnObject: 100,
      },
      anotherThing: 190,
      extraThing: {
        subExtra: 'fo sho',
      },
    };

    const invalidated = gbTrackerCore.__getInternals().validateEvent(event, schemas);

    expect(invalidated.event).to.be.undefined;
    expect(invalidated.error).to.eql('Property @: should not contains property ["extraThing"]\nProperty @.thing: must be string, but is object');
  });
});
