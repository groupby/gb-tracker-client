/*eslint  no-global-assign: "off"*/
const chai     = require('chai');
const expect   = chai.expect;
const LZString = require('lz-string/libs/lz-string.min.js');
const jsdom    = require('jsdom');
const _        = require('lodash');
const moment   = require('moment');
const uuid     = require('uuid');

window                = false;
document              = false;
navigator             = {};
navigator.appCodeName = 'Microsoft Internet Explorer';
navigator.userAgent   = 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)';

const GbTracker = require('../index');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('gb-tracker-core tests', () => {

  it('should return the fields not present on the sanitised object', () => {
    const gbTrackerCore               = new GbTracker('testcustomer', 'area');
    gbTrackerCore.__private.sendEvent = () => {};
    gbTrackerCore.setVisitor('visitor', 'session');

    const first = {
      thing:  'soomething',
      ignore: 'not a thing',
      deep:   {
        other:      'banana',
        arrayThing: [
          {
            included: 'other'
          },
          {
            included: 'other2'
          }
        ]
      }
    };

    const second = {
      thing:        'soomething',
      anExtraThing: 'yo',
      deep:         {
        other:           'banana',
        manyExtraThings: 'fo sho',
        arrayThing:      [
          {
            included: 'other',
            extra:    'yo'
          },
          {
            included: 'other2',
            extra:    'yo2'
          }
        ]
      }
    };

    const removedFields = gbTrackerCore.__private.getRemovedFields(first, second);

    expect(removedFields).to.eql([
      'deep.arrayThing.[].extra',
      'deep.manyExtraThings',
      'anExtraThing'
    ]);
  });

  it('should throw if invalid callback is set to not a function', () => {
    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    expect(() => gbTrackerCore.setInvalidEventCallback('')).to.throw();
    expect(() => gbTrackerCore.setInvalidEventCallback(null)).to.throw();
    expect(() => gbTrackerCore.setInvalidEventCallback()).to.throw();
    expect(() => gbTrackerCore.setInvalidEventCallback(9)).to.throw();
  });

  it('should throw if customerId is not a string with lenght', () => {
    expect(() => new GbTracker(null, 'default')).to.throw(/customerId/);
    expect(() => new GbTracker('', 'default')).to.throw(/customerId/);
    expect(() => new GbTracker({}, 'default')).to.throw(/customerId/);
    expect(() => new GbTracker(7, 'default')).to.throw(/customerId/);
    expect(() => new GbTracker([], 'default')).to.throw(/customerId/);
  });

  it('should require that visitor information is set before events are sent', () => {
    const gbTrackerCore = new GbTracker('testcustomer', 'area');

    expect(() => gbTrackerCore.sendAddToCartEvent({})).to.throw(/autoSetVisitor/);
  });

  it('should validate input to setVisitor', () => {
    expect(() => new GbTracker('testcustomer', 'area').setVisitor(null, 'session')).to.throw(/visitor/);
    expect(() => new GbTracker('testcustomer', 'area').setVisitor('', 'session')).to.throw(/visitor/);
    expect(() => new GbTracker('testcustomer', 'area').setVisitor({}, 'session')).to.throw(/visitor/);
    expect(() => new GbTracker('testcustomer', 'area').setVisitor([], 'session')).to.throw(/visitor/);

    expect(() => new GbTracker('testcustomer', 'area').setVisitor('visitor', null)).to.throw(/session/);
    expect(() => new GbTracker('testcustomer', 'area').setVisitor('visitor', '')).to.throw(/session/);
    expect(() => new GbTracker('testcustomer', 'area').setVisitor('visitor', {})).to.throw(/session/);
    expect(() => new GbTracker('testcustomer', 'area').setVisitor('visitor', [])).to.throw(/session/);
  });

  it('should NOT send visitor event the first time setVisitor is called', (done) => {
    const gbTrackerCore = new GbTracker('testcustomer', 'area');

    const sessionChangeEvent = {
      previousVisitorId: 'prevVisitor',
      previousSessionId: 'prevSession',
      newVisitorId:      'newVisitor',
      newSessionId:      'newSession'
    };

    gbTrackerCore.__private.sendSessionChangeEvent = (event) => {
      expect(event).to.eql({
        session: {
          newVisitorId:      sessionChangeEvent.newVisitorId,
          newSessionId:      sessionChangeEvent.newSessionId,
          previousVisitorId: sessionChangeEvent.previousVisitorId,
          previousSessionId: sessionChangeEvent.previousSessionId
        }
      });

      done();
    };

    gbTrackerCore.setVisitor(sessionChangeEvent.previousVisitorId, sessionChangeEvent.previousSessionId);
    gbTrackerCore.setVisitor(sessionChangeEvent.newVisitorId, sessionChangeEvent.newSessionId);
  });

  it('should send visitor event after the visitor is already set once', (done) => {
    const gbTrackerCore = new GbTracker('testcustomer', 'area');

    const sessionChangeEvent = {
      previousVisitorId: 'prevVisitor',
      previousSessionId: 'prevSession',
      newVisitorId:      'newVisitor',
      newSessionId:      'newSession'
    };

    gbTrackerCore.__private.sendSessionChangeEvent = (event) => {
      expect(event).to.eql({
        session: {
          newVisitorId:      sessionChangeEvent.newVisitorId,
          newSessionId:      sessionChangeEvent.newSessionId,
          previousVisitorId: sessionChangeEvent.previousVisitorId,
          previousSessionId: sessionChangeEvent.previousSessionId
        }
      });

      done();
    };

    gbTrackerCore.setVisitor(sessionChangeEvent.previousVisitorId, sessionChangeEvent.previousSessionId);
    gbTrackerCore.setVisitor(sessionChangeEvent.newVisitorId, sessionChangeEvent.newSessionId);
  });

  it('should NOT send visitor event when the visitor is set but not changed', (done) => {
    const gbTrackerCore = new GbTracker('testcustomer', 'area');

    const sessionChangeEvent = {
      previousVisitorId: 'prevVisitor',
      previousSessionId: 'prevSession',
      newVisitorId:      'prevVisitor', // New same as previous
      newSessionId:      'prevSession'
    };

    let firstCall = true;

    gbTrackerCore.__private.sendSessionChangeEvent = (event) => {
      if (firstCall) {
        firstCall = false;

        expect(event).to.eql({
          session: {
            newVisitorId: sessionChangeEvent.previousVisitorId,
            newSessionId: sessionChangeEvent.previousSessionId
          }
        });

        gbTrackerCore.setVisitor(sessionChangeEvent.newVisitorId, sessionChangeEvent.newSessionId);
      } else {
        done('fail');
      }
    };

    gbTrackerCore.setVisitor(sessionChangeEvent.previousVisitorId, sessionChangeEvent.previousSessionId);

    // Just needs to allow a couple clock cycles to see if sendSessionChangeEvent is called again
    setTimeout(() => done(), 2);
  });

  it('sets visitor and session cookies', () => {
    const cookieJar = jsdom.createCookieJar();

    const window     = jsdom.jsdom(undefined, {cookieJar}).defaultView;
    const CookiesLib = require('cookies-js')(window);

    expect(CookiesLib.get(GbTracker.VISITOR_COOKIE_KEY)).to.be.undefined;
    expect(CookiesLib.get(GbTracker.SESSION_COOKIE_KEY)).to.be.undefined;

    GbTracker.__overrideCookiesLib(CookiesLib);
    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    gbTrackerCore.autoSetVisitor();

    expect(CookiesLib.get(GbTracker.VISITOR_COOKIE_KEY)).to.match(UUID_REGEX);
    expect(CookiesLib.get(GbTracker.SESSION_COOKIE_KEY)).to.match(UUID_REGEX);
    expect(CookiesLib.get(GbTracker.VISITOR_COOKIE_KEY)).to.not.eql(CookiesLib.get(GbTracker.SESSION_COOKIE_KEY));

    expect(gbTrackerCore.getVisitorId()).to.eql(CookiesLib.get(GbTracker.VISITOR_COOKIE_KEY));
    expect(gbTrackerCore.getSessionId()).to.eql(CookiesLib.get(GbTracker.SESSION_COOKIE_KEY));
    expect(gbTrackerCore.getLoginId()).to.be.undefined;

    expect(cookieJar.toJSON().cookies.length).to.eql(2);
    const sessionCookie = _.find(cookieJar.toJSON().cookies, {key: GbTracker.SESSION_COOKIE_KEY});
    const visitorCookie = _.find(cookieJar.toJSON().cookies, {key: GbTracker.VISITOR_COOKIE_KEY});

    expect(moment(sessionCookie.expires).valueOf()).to.be.most(moment().add(GbTracker.SESSION_TIMEOUT_SEC, 'seconds').valueOf());
    expect(moment(visitorCookie.expires).year()).to.eql(9999);
  });

  it('reads existing visitor and session cookies', () => {
    const cookieJar = jsdom.createCookieJar();

    const window     = jsdom.jsdom(undefined, {cookieJar}).defaultView;
    const CookiesLib = require('cookies-js')(window);

    expect(CookiesLib.get(GbTracker.VISITOR_COOKIE_KEY)).to.be.undefined;
    expect(CookiesLib.get(GbTracker.SESSION_COOKIE_KEY)).to.be.undefined;

    const visitorCookieValue = uuid.v4();
    const sessionCookieValue = uuid.v4();
    CookiesLib.set(GbTracker.VISITOR_COOKIE_KEY, visitorCookieValue, {expires: Infinity});
    CookiesLib.set(GbTracker.SESSION_COOKIE_KEY, sessionCookieValue, {expires: GbTracker.SESSION_TIMEOUT_SEC});

    expect(CookiesLib.get(GbTracker.VISITOR_COOKIE_KEY)).to.eql(visitorCookieValue);
    expect(CookiesLib.get(GbTracker.SESSION_COOKIE_KEY)).to.eql(sessionCookieValue);

    GbTracker.__overrideCookiesLib(CookiesLib);
    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    gbTrackerCore.autoSetVisitor();

    expect(CookiesLib.get(GbTracker.VISITOR_COOKIE_KEY)).to.eql(visitorCookieValue);
    expect(CookiesLib.get(GbTracker.SESSION_COOKIE_KEY)).to.eql(sessionCookieValue);
    expect(CookiesLib.get(GbTracker.VISITOR_COOKIE_KEY)).to.not.eql(CookiesLib.get(GbTracker.SESSION_COOKIE_KEY));

    expect(gbTrackerCore.getVisitorId()).to.eql(CookiesLib.get(GbTracker.VISITOR_COOKIE_KEY));
    expect(gbTrackerCore.getSessionId()).to.eql(CookiesLib.get(GbTracker.SESSION_COOKIE_KEY));
    expect(gbTrackerCore.getLoginId()).to.be.undefined;

    expect(cookieJar.toJSON().cookies.length).to.eql(2);
    const sessionCookie = _.find(cookieJar.toJSON().cookies, {key: GbTracker.SESSION_COOKIE_KEY});
    const visitorCookie = _.find(cookieJar.toJSON().cookies, {key: GbTracker.VISITOR_COOKIE_KEY});

    expect(moment(sessionCookie.expires).valueOf()).to.be.most(moment().add(GbTracker.SESSION_TIMEOUT_SEC, 'seconds').valueOf());
    expect(moment(visitorCookie.expires).year()).to.eql(9999);
  });

  it('sets visitor and session cookies, and keeps loginId locally', () => {
    const cookieJar = jsdom.createCookieJar();

    const window     = jsdom.jsdom(undefined, {cookieJar}).defaultView;
    const CookiesLib = require('cookies-js')(window);

    expect(CookiesLib.get(GbTracker.VISITOR_COOKIE_KEY)).to.be.undefined;
    expect(CookiesLib.get(GbTracker.SESSION_COOKIE_KEY)).to.be.undefined;

    GbTracker.__overrideCookiesLib(CookiesLib);
    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    const loginId       = 'some user';
    gbTrackerCore.autoSetVisitor(loginId);

    expect(CookiesLib.get(GbTracker.VISITOR_COOKIE_KEY)).to.match(UUID_REGEX);
    expect(CookiesLib.get(GbTracker.SESSION_COOKIE_KEY)).to.match(UUID_REGEX);
    expect(CookiesLib.get(GbTracker.VISITOR_COOKIE_KEY)).to.not.eql(CookiesLib.get(GbTracker.SESSION_COOKIE_KEY));

    expect(gbTrackerCore.getVisitorId()).to.eql(CookiesLib.get(GbTracker.VISITOR_COOKIE_KEY));
    expect(gbTrackerCore.getSessionId()).to.eql(CookiesLib.get(GbTracker.SESSION_COOKIE_KEY));
    expect(gbTrackerCore.getLoginId()).to.eql(loginId);

    expect(cookieJar.toJSON().cookies.length).to.eql(2);
    const sessionCookie = _.find(cookieJar.toJSON().cookies, {key: GbTracker.SESSION_COOKIE_KEY});
    const visitorCookie = _.find(cookieJar.toJSON().cookies, {key: GbTracker.VISITOR_COOKIE_KEY});

    expect(moment(sessionCookie.expires).valueOf()).to.be.most(moment().add(GbTracker.SESSION_TIMEOUT_SEC, 'seconds').valueOf());
    expect(moment(visitorCookie.expires).year()).to.eql(9999);
  });

  it('autoSetVisitor overrides setVisitor', () => {
    const window     = jsdom.jsdom().defaultView;
    const CookiesLib = require('cookies-js')(window);

    GbTracker.__overrideCookiesLib(CookiesLib);
    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    gbTrackerCore.setVisitor(1, 1);
    gbTrackerCore.autoSetVisitor();

    expect(CookiesLib.get(GbTracker.VISITOR_COOKIE_KEY)).to.match(UUID_REGEX);
    expect(CookiesLib.get(GbTracker.SESSION_COOKIE_KEY)).to.match(UUID_REGEX);
  });

  it('autoSetVisitor ignores setVisitor', () => {
    const window     = jsdom.jsdom().defaultView;
    const CookiesLib = require('cookies-js')(window);

    GbTracker.__overrideCookiesLib(CookiesLib);
    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    gbTrackerCore.autoSetVisitor();
    gbTrackerCore.setVisitor(1, 1);

    expect(CookiesLib.get(GbTracker.VISITOR_COOKIE_KEY)).to.match(UUID_REGEX);
    expect(CookiesLib.get(GbTracker.SESSION_COOKIE_KEY)).to.match(UUID_REGEX);
  });

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
    gbTrackerCore.autoSetVisitor();

    let sessionCookie = _.find(cookieJar.toJSON().cookies, {key: GbTracker.SESSION_COOKIE_KEY});
    expect(moment(sessionCookie.expires).valueOf()).to.be.most(moment().add(SHORT_EXPIRY_SEC, 'seconds').valueOf());

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

  it('should allow visitor or session IDs as numbers and coerce to strings', () => {
    const gbTrackerCore               = new GbTracker('testcustomer', 'area');
    gbTrackerCore.__private.sendEvent = () => {};

    gbTrackerCore.setVisitor(7, 5);
    const visit = gbTrackerCore.__private.getVisitor();
    expect(visit.customerData.visitorId).to.eql('7');
    expect(visit.customerData.sessionId).to.eql('5');
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

  it('should sendEvent using sendSegment', (done) => {
    const gbTrackerCore = new GbTracker('testcustomer', 'area');

    const sendSegment = (segment) => {
      expect(segment.segment).to.eql(LZString.compressToEncodedURIComponent(JSON.stringify(event)));
      expect(segment.id).to.eql(0);
      expect(segment.total).to.eql(1);
      expect(segment.clientVersion).to.not.be.undefined;
      expect(segment.uuid).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      done();
    };

    const event = {
      first:  'this',
      second: 'that'
    };

    gbTrackerCore.__private.sendEvent(event, sendSegment);
  });

  // it('should attach eventListeners for mozilla', () => {
  //   const eventListener          = {};
  //   thisDoc.removeEventListener = (type) => {
  //     delete eventListener[type];
  //   };
  //
  //   thisDoc.addEventListener = (type, listener) => {
  //     eventListener[type] = listener;
  //   };
  //
  //
  //   expect(Object.keys(eventListener).length).to.eql(0);
  //   const gbTrackerCore = new GbTracker('testcustomer', 'area');
  //   expect(Object.keys(eventListener).length).to.eql(1);
  // });
});