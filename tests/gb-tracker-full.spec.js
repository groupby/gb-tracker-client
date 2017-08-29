/*eslint  no-global-assign: "off"*/
const chai     = require('chai');
const expect   = chai.expect;
const jsdom    = require('jsdom');
const _        = require('lodash');
const moment   = require('moment');
const uuid     = require('uuid');

window                = {};
document              = false;
navigator             = {};
navigator.appCodeName = 'Microsoft Internet Explorer';
navigator.userAgent   = 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)';

const GbTracker = require('../lib/gb-tracker-full');

describe('gb-tracker-full tests', () => {

  it('sending events refreshes session expiry when autoSetVisitor is used', (done) => {
    const cookieJar = jsdom.createCookieJar();

    const window     = jsdom.jsdom(undefined, {cookieJar}).defaultView;
    const CookiesLib = require('cookies-js')(window);

    expect(CookiesLib.get(GbTracker.VISITOR_COOKIE_KEY)).to.be.undefined;
    expect(CookiesLib.get(GbTracker.SESSION_COOKIE_KEY)).to.be.undefined;

    const SHORT_EXPIRY_SEC = 5;

    const visitorCookieValue = uuid.v4();
    const sessionCookieValue = uuid.v4();
    CookiesLib.set(GbTracker.VISITOR_COOKIE_KEY, visitorCookieValue, {expires: Infinity});
    CookiesLib.set(GbTracker.SESSION_COOKIE_KEY, sessionCookieValue, {expires: SHORT_EXPIRY_SEC});

    GbTracker.__overrideCookiesLib(CookiesLib);
    const gbTrackerCore = new GbTracker('testcustomer', 'area');

    let sessionCookie = _.find(cookieJar.toJSON().cookies, {key: GbTracker.SESSION_COOKIE_KEY});
    console.log(sessionCookie.expires);
    expect(moment(sessionCookie.expires).valueOf()).to.be.most(moment().add(SHORT_EXPIRY_SEC, 'seconds').valueOf());
    expect(moment(sessionCookie.expires).valueOf()).to.be.least(moment().add(SHORT_EXPIRY_SEC - 2, 'seconds').valueOf());

    gbTrackerCore.autoSetVisitor();

    sessionCookie = _.find(cookieJar.toJSON().cookies, {key: GbTracker.SESSION_COOKIE_KEY});
    // Minus 2 just to allow for a bit of lag between setting and checking the value
    expect(moment(sessionCookie.expires).valueOf()).to.be.least(moment().add(GbTracker.SESSION_TIMEOUT_SEC - 2, 'seconds').valueOf());

    gbTrackerCore.__private.sendEvent = () => {
      sessionCookie = _.find(cookieJar.toJSON().cookies, {key: GbTracker.SESSION_COOKIE_KEY});
      expect(moment(sessionCookie.expires).valueOf()).to.be.most(moment().add(GbTracker.SESSION_TIMEOUT_SEC, 'seconds').valueOf());
      done();
    };

    gbTrackerCore.sendAddToCartEvent({
      cart: {
        items: [
          {
            productId:  'asdfasd',
            category:   'boats',
            collection: 'boatssrus',
            title:      'boats',
            sku:        'asdfasf98',
            quantity:   10,
            price:      100.21
          }
        ]
      }
    });
  });

  it('sending events does not set session when autoSetVisitor is not used', (done) => {
    const cookieJar = jsdom.createCookieJar();

    const window     = jsdom.jsdom(undefined, {cookieJar}).defaultView;
    const CookiesLib = require('cookies-js')(window);

    expect(CookiesLib.get(GbTracker.VISITOR_COOKIE_KEY)).to.be.undefined;
    expect(CookiesLib.get(GbTracker.SESSION_COOKIE_KEY)).to.be.undefined;

    GbTracker.__overrideCookiesLib(CookiesLib);
    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    gbTrackerCore.setVisitor(1, 1);

    let sessionCookie = _.find(cookieJar.toJSON().cookies, {key: GbTracker.SESSION_COOKIE_KEY});
    expect(sessionCookie).to.be.undefined;

    gbTrackerCore.__private.sendEvent = () => {
      sessionCookie = _.find(cookieJar.toJSON().cookies, {key: GbTracker.SESSION_COOKIE_KEY});
      expect(sessionCookie).to.be.undefined;
      done();
    };

    gbTrackerCore.sendAddToCartEvent({
      cart: {
        items: [
          {
            productId:  'asdfasd',
            category:   'boats',
            collection: 'boatssrus',
            title:      'boats',
            sku:        'asdfasf98',
            quantity:   10,
            price:      100.21
          }
        ]
      }
    });
  });

  it('should validate valid event', () => {
    const gbTrackerCore               = new GbTracker('testcustomer', 'area');
    gbTrackerCore.__private.sendEvent = () => {};
    gbTrackerCore.setVisitor('visitor', 'session');

    const validationSchema = {
      type:       'object',
      strict:     true,
      properties: {
        thing:        {
          type: 'string'
        },
        anotherThing: {
          type: 'integer'
        }
      }
    };

    const sanitizationSchema = {
      strict:     true,
      properties: {
        thing:        {},
        anotherThing: {}
      }
    };

    const schemas = {
      validation:   validationSchema,
      sanitization: sanitizationSchema
    };

    const event = {
      thing:        'yo',
      anotherThing: 190,
      extraThing:   {
        subExtra: 'fo sho'
      }
    };

    const validated = gbTrackerCore.__private.validateEvent(event, schemas);

    expect(validated.event.thing).to.eql('yo');
    expect(validated.event.anotherThing).to.eql(190);
    expect(validated.event.extraThing).to.be.undefined;
    expect(validated.event.visit.generated.timezoneOffset).to.not.be.undefined;
  });

  it('throws during validation if strictMode is on and there are extra fields in event', () => {
    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    gbTrackerCore.setStrictMode(true);

    const validationSchema = {
      type:       'object',
      strict:     true,
      properties: {
        eventType:    {
          type: 'string'
        },
        thing:        {
          type: 'string'
        },
        anotherThing: {
          type: 'integer'
        }
      }
    };

    const sanitizationSchema = {
      strict:     true,
      properties: {
        eventType:    {},
        thing:        {},
        anotherThing: {}
      }
    };

    const schemas = {
      validation:   validationSchema,
      sanitization: sanitizationSchema
    };

    const event = {
      eventType:    'eventType',
      thing:        'string',
      anotherThing: 190,
      extraThing:   {
        subExtra: 'fo sho'
      }
    };

    expect(() => gbTrackerCore.__private.validateEvent(event, schemas)).to.throw('Unexpected fields ["extraThing"] in eventType: eventType');
  });

  it('appends warnings about stripped fields to metadata', () => {
    const gbTrackerCore = new GbTracker('testcustomer', 'area');

    const validationSchema = {
      type:       'object',
      strict:     true,
      properties: {
        eventType:    {
          type: 'string'
        },
        thing:        {
          type: 'string'
        },
        anotherThing: {
          type: 'integer'
        }
      }
    };

    const sanitizationSchema = {
      strict:     true,
      properties: {
        eventType:    {},
        thing:        {},
        anotherThing: {}
      }
    };

    const schemas = {
      validation:   validationSchema,
      sanitization: sanitizationSchema
    };

    const event = {
      eventType:    'eventType',
      thing:        'string',
      anotherThing: 190,
      extraThing:   {
        subExtra: 'fo sho'
      }
    };

    const validated = gbTrackerCore.__private.validateEvent(event, schemas);

    expect(validated.event.metadata).to.eql([
      {
        key:   'gbi-field-warning',
        value: 'extraThing'
      }
    ]);
  });

  it('should drop an invalid event', () => {
    const gbTrackerCore               = new GbTracker('testcustomer', 'area');
    gbTrackerCore.__private.sendEvent = () => {};
    gbTrackerCore.setVisitor('visitor', 'session');

    const validationSchema = {
      type:       'object',
      strict:     true,
      properties: {
        thing:        {
          type: 'string'
        },
        anotherThing: {
          type: 'integer'
        }
      }
    };

    const sanitizationSchema = {
      strict:     true,
      properties: {
        thing:        {},
        anotherThing: {}
      }
    };

    const schemas = {
      validation:   validationSchema,
      sanitization: sanitizationSchema
    };

    const event = {
      thing:        {
        shouldNotBeAnObject: 100
      },
      anotherThing: 190,
      extraThing:   {
        subExtra: 'fo sho'
      }
    };

    const invalidated = gbTrackerCore.__private.validateEvent(event, schemas);

    expect(invalidated.event).to.eql(null);
    expect(invalidated.error).to.eql('Property @.thing: must be string, but is object');
  });
});
