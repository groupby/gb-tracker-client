// tslint:disable:no-unused-expression
import { expect } from 'chai';
import _ from 'lodash';
import jsdom from 'jsdom';
import moment from 'moment';
import cuid from 'cuid';
import { AnySendableEvent, Tracker, TrackerCore } from '../src/core';
import { SITE_FILTER_METADATA_KEY } from '../src/constants';
import { EVENT_TYPE_ADD_TO_CART, EVENT_TYPE_AUTO_SEARCH, EVENT_TYPE_IMPRESSION, EVENT_TYPE_MORE_REFINEMENTS, EVENT_TYPE_ORDER, EVENT_TYPE_REMOVE_FROM_CART, EVENT_TYPE_SEARCH, EVENT_TYPE_VIEW_CART, EVENT_TYPE_VIEW_PRODUCT } from '../src/eventTypes';

const GbTracker = TrackerCore({} as any, () => null);

const CUID_REGEX = /^c[0-9a-z]{8}[0-9a-z]{4}[0-9a-z]{4}[0-9a-z]{8}$/i;

describe('gb-tracker-core tests', () => {

  it('should return the fields not present on the sanitised object', () => {
    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    gbTrackerCore.__getInternals().sendEvent = () => { /* */ };
    gbTrackerCore.setVisitor('visitor', 'session');

    const first = {
      thing: 'soomething',
      ignore: 'not a thing',
      deep: {
        other: 'banana',
        arrayThing: [
          {
            included: 'other',
          },
          {
            included: 'other2',
          },
        ],
      },
    };

    const second = {
      thing: 'soomething',
      anExtraThing: 'yo',
      deep: {
        other: 'banana',
        manyExtraThings: 'fo sho',
        arrayThing: [
          {
            included: 'other',
            extra: 'yo',
          },
          {
            included: 'other2',
            extra: 'yo2',
          },
        ],
      },
    };

    const removedFields = gbTrackerCore.__getInternals().getRemovedFields(first, second);

    expect(removedFields).to.eql([
      'deep.arrayThing.[].extra',
      'deep.manyExtraThings',
      'anExtraThing',
    ]);
  });

  it('should throw if invalid callback is set to not a function', () => {
    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    expect(() => gbTrackerCore.setInvalidEventCallback('' as any)).to.throw();
    expect(() => gbTrackerCore.setInvalidEventCallback(null as any)).to.throw();
    expect(() => gbTrackerCore.setInvalidEventCallback(undefined as any)).to.throw();
    expect(() => gbTrackerCore.setInvalidEventCallback(9 as any)).to.throw();
  });

  it('should throw if customerId is not a string with length', () => {
    expect(() => new GbTracker(null as any, 'default')).to.throw(/customerId/);
    expect(() => new GbTracker('' as any, 'default')).to.throw(/customerId/);
    expect(() => new GbTracker({} as any, 'default')).to.throw(/customerId/);
    expect(() => new GbTracker(7 as any, 'default')).to.throw(/customerId/);
    expect(() => new GbTracker([] as any, 'default')).to.throw(/customerId/);
  });

  it('should require that visitor information is set before events are sent', () => {
    const gbTrackerCore = new GbTracker('testcustomer', 'area');

    expect(() => gbTrackerCore.sendAddToCartEvent({} as any)).to.throw(/autoSetVisitor/);
  });

  it('should validate input to setVisitor', () => {
    expect(() => new GbTracker('testcustomer', 'area').setVisitor(null as any, 'session')).to.throw(/visitor/);
    expect(() => new GbTracker('testcustomer', 'area').setVisitor('' as any, 'session')).to.throw(/visitor/);
    expect(() => new GbTracker('testcustomer', 'area').setVisitor({} as any, 'session')).to.throw(/visitor/);
    expect(() => new GbTracker('testcustomer', 'area').setVisitor([] as any, 'session')).to.throw(/visitor/);

    expect(() => new GbTracker('testcustomer', 'area').setVisitor('visitor', null as any)).to.throw(/session/);
    expect(() => new GbTracker('testcustomer', 'area').setVisitor('visitor', '')).to.throw(/session/);
    expect(() => new GbTracker('testcustomer', 'area').setVisitor('visitor', {} as any)).to.throw(/session/);
    expect(() => new GbTracker('testcustomer', 'area').setVisitor('visitor', [] as any)).to.throw(/session/);
  });

  it('sets visitor and session cookies', () => {
    const cookieJar = new jsdom.CookieJar();

    const window = new jsdom.JSDOM(undefined, { cookieJar }).window;

    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    const CookiesLib = gbTrackerCore.__getInternals().COOKIES_LIB as any;
    CookiesLib._document = window.document;

    expect(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY)).to.be.undefined;
    expect(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY)).to.be.undefined;

    gbTrackerCore.autoSetVisitor();

    expect(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY)).to.match(CUID_REGEX);
    expect(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY)).to.match(CUID_REGEX);
    expect(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY)).to.not.eql(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY));

    expect(gbTrackerCore.getVisitorId()).to.eql(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY));
    expect(gbTrackerCore.getSessionId()).to.eql(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY));
    expect(gbTrackerCore.getLoginId()).to.be.undefined;

    expect(cookieJar.toJSON().cookies.length).to.eql(2);
    const sessionCookie = _.find(cookieJar.toJSON().cookies, { key: gbTrackerCore.__getInternals().SESSION_COOKIE_KEY });
    const visitorCookie = _.find(cookieJar.toJSON().cookies, { key: gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY });

    expect(moment((sessionCookie as any).expires).valueOf()).to.be.most(moment().add(gbTrackerCore.__getInternals().SESSION_TIMEOUT_SEC, 'seconds').valueOf());
    expect(moment((visitorCookie as any).expires).year()).to.eql(moment().add(gbTrackerCore.__getInternals().VISITOR_TIMEOUT_SEC, 'seconds').year());
  });

  it('reads existing visitor and session cookies', () => {
    const cookieJar = new jsdom.CookieJar();

    const window = new jsdom.JSDOM(undefined, { cookieJar }).window;

    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    const CookiesLib = gbTrackerCore.__getInternals().COOKIES_LIB as any;
    CookiesLib._document = window.document;

    expect(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY)).to.be.undefined;
    expect(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY)).to.be.undefined;

    const visitorCookieValue = cuid();
    const sessionCookieValue = cuid();
    CookiesLib.set(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY, visitorCookieValue, { expires: Infinity });
    CookiesLib.set(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY, sessionCookieValue, { expires: gbTrackerCore.__getInternals().SESSION_TIMEOUT_SEC });

    expect(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY)).to.eql(visitorCookieValue);
    expect(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY)).to.eql(sessionCookieValue);

    gbTrackerCore.autoSetVisitor();

    expect(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY)).to.eql(visitorCookieValue);
    expect(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY)).to.eql(sessionCookieValue);
    expect(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY)).to.not.eql(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY));

    expect(gbTrackerCore.getVisitorId()).to.eql(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY));
    expect(gbTrackerCore.getSessionId()).to.eql(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY));
    expect(gbTrackerCore.getLoginId()).to.be.undefined;

    expect(cookieJar.toJSON().cookies.length).to.eql(2);
    const sessionCookie = _.find(cookieJar.toJSON().cookies, { key: gbTrackerCore.__getInternals().SESSION_COOKIE_KEY });
    const visitorCookie = _.find(cookieJar.toJSON().cookies, { key: gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY });

    expect(moment((sessionCookie as any).expires).valueOf()).to.be.most(moment().add(gbTrackerCore.__getInternals().SESSION_TIMEOUT_SEC, 'seconds').valueOf());
    expect(moment((visitorCookie as any).expires).year()).to.eql(moment().add(gbTrackerCore.__getInternals().VISITOR_TIMEOUT_SEC, 'seconds').year());
  });

  it('reads existing visitor and session cookies and updates to valid expiry', () => {
    const cookieJar = new jsdom.CookieJar();

    const window = new jsdom.JSDOM(undefined, { cookieJar }).window;

    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    const CookiesLib = gbTrackerCore.__getInternals().COOKIES_LIB as any;
    CookiesLib._document = window.document;

    expect(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY)).to.be.undefined;
    expect(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY)).to.be.undefined;

    const visitorCookieValue = cuid();
    const sessionCookieValue = cuid();
    CookiesLib.set(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY, visitorCookieValue);
    CookiesLib.set(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY, sessionCookieValue);

    expect(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY)).to.eql(visitorCookieValue);
    expect(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY)).to.eql(sessionCookieValue);

    gbTrackerCore.autoSetVisitor();

    expect(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY)).to.eql(visitorCookieValue);
    expect(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY)).to.eql(sessionCookieValue);
    expect(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY)).to.not.eql(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY));

    expect(gbTrackerCore.getVisitorId()).to.eql(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY));
    expect(gbTrackerCore.getSessionId()).to.eql(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY));
    expect(gbTrackerCore.getLoginId()).to.be.undefined;

    expect(cookieJar.toJSON().cookies.length).to.eql(2);
    const sessionCookie = _.find(cookieJar.toJSON().cookies, { key: gbTrackerCore.__getInternals().SESSION_COOKIE_KEY });
    const visitorCookie = _.find(cookieJar.toJSON().cookies, { key: gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY });

    expect(moment((sessionCookie as any).expires).valueOf()).to.be.most(moment().add(gbTrackerCore.__getInternals().SESSION_TIMEOUT_SEC, 'seconds').valueOf());
    expect(moment((visitorCookie as any).expires).year()).to.eql(moment().add(gbTrackerCore.__getInternals().VISITOR_TIMEOUT_SEC, 'seconds').year());
  });

  it('sets visitor and session cookies, and keeps loginId locally', () => {
    const cookieJar = new jsdom.CookieJar();

    const window = new jsdom.JSDOM(undefined, { cookieJar }).window;

    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    const CookiesLib = gbTrackerCore.__getInternals().COOKIES_LIB as any;
    CookiesLib._document = window.document;

    expect(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY)).to.be.undefined;
    expect(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY)).to.be.undefined;

    const loginId = 'some user';
    gbTrackerCore.autoSetVisitor(loginId);

    expect(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY)).to.match(CUID_REGEX);
    expect(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY)).to.match(CUID_REGEX);
    expect(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY)).to.not.eql(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY));

    expect(gbTrackerCore.getVisitorId()).to.eql(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY));
    expect(gbTrackerCore.getSessionId()).to.eql(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY));
    expect(gbTrackerCore.getLoginId()).to.eql(loginId);

    expect(cookieJar.toJSON().cookies.length).to.eql(2);
    const sessionCookie = _.find(cookieJar.toJSON().cookies, { key: gbTrackerCore.__getInternals().SESSION_COOKIE_KEY });
    const visitorCookie = _.find(cookieJar.toJSON().cookies, { key: gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY });

    expect(moment((sessionCookie as any).expires).valueOf()).to.be.most(moment().add(gbTrackerCore.__getInternals().SESSION_TIMEOUT_SEC, 'seconds').valueOf());
    expect(moment((visitorCookie as any).expires).year()).to.eql(moment().add(gbTrackerCore.__getInternals().VISITOR_TIMEOUT_SEC, 'seconds').year());
  });

  it('autoSetVisitor overrides setVisitor with cuid if no AMP Linker param provided and no cookie set', () => {
    const cookieJar = new jsdom.CookieJar();

    const window = new jsdom.JSDOM(undefined, { cookieJar }).window;

    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    const CookiesLib = gbTrackerCore.__getInternals().COOKIES_LIB as any;
    CookiesLib._document = window.document;

    gbTrackerCore.setVisitor(1 as any, 1 as any);
    gbTrackerCore.autoSetVisitor();

    expect(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY)).to.match(CUID_REGEX);
    expect(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY)).to.match(CUID_REGEX);
  });

  it('autoSetVisitor overrides setVisitor with cookie if no AMP Linker param provided but visitor ID cookie set', () => {
    const cookieJar = new jsdom.CookieJar();
    const window = new jsdom.JSDOM(undefined, { cookieJar }).window;
    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    const CookiesLib = gbTrackerCore.__getInternals().COOKIES_LIB as any;

    const visitorCookieKey = gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY;

    CookiesLib._document = window.document;

    CookiesLib.set(visitorCookieKey, 'abc123');

    gbTrackerCore.setVisitor(1 as any, 1 as any);
    gbTrackerCore.autoSetVisitor();

    expect(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY)).to.eql('abc123');
    expect(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY)).to.match(CUID_REGEX);
  });

  it('autoSetVisitor overrides setVisitor with AMP Linker param if AMP linker param provided and visitor ID cookie set', () => {
    const cookieJar = new jsdom.CookieJar();
    const window = new jsdom.JSDOM(undefined, {
      url: 'http://exampleampsite.com/products/red-boat?gbi=1*1u74ubq*gbivid*LU55Q2M3TkQyT2Y2VU5rMjlNekxpMXJjQ2g0MEYtNnRjbFhoaFhzLTQ0NDVYc0pXVWhiclFvNUNUbFNUMDFjSA..',
      cookieJar,
    }).window;
    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    const internals = gbTrackerCore.__getInternals();
    internals.WINDOW = window as unknown as Window;
    const CookiesLib = internals.COOKIES_LIB as any;

    const visitorCookieKey = internals.VISITOR_COOKIE_KEY;

    CookiesLib._document = window.document;

    CookiesLib.set(visitorCookieKey, 'abc123');

    gbTrackerCore.setVisitor(1 as any, 1 as any);
    gbTrackerCore.autoSetVisitor();

    expect(CookiesLib.get(internals.VISITOR_COOKIE_KEY)).to.eql('-NyCc7ND2Of6UNk29MzLi1rcCh40F-6tclXhhXs-4445XsJWUhbrQo5CTlST01cH');
    expect(CookiesLib.get(internals.SESSION_COOKIE_KEY)).to.match(CUID_REGEX);
  });

  it('autoSetVisitor overrides setVisitor with AMP Linker param if AMP linker param provided and no visitor ID cookie set', () => {
    const cookieJar = new jsdom.CookieJar();
    const window = new jsdom.JSDOM(undefined, {
      url: 'http://exampleampsite.com/products/red-boat?gbi=1*1u74ubq*gbivid*LU55Q2M3TkQyT2Y2VU5rMjlNekxpMXJjQ2g0MEYtNnRjbFhoaFhzLTQ0NDVYc0pXVWhiclFvNUNUbFNUMDFjSA..',
      cookieJar,
    }).window;
    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    const internals = gbTrackerCore.__getInternals();
    internals.WINDOW = window as unknown as Window;
    const CookiesLib = internals.COOKIES_LIB as any;

    CookiesLib._document = window.document;

    const visitorCookieKey = internals.VISITOR_COOKIE_KEY;

    CookiesLib.set(visitorCookieKey, 'abc123');

    gbTrackerCore.setVisitor(1 as any, 1 as any);
    gbTrackerCore.autoSetVisitor();

    expect(CookiesLib.get(internals.VISITOR_COOKIE_KEY)).to.eql('-NyCc7ND2Of6UNk29MzLi1rcCh40F-6tclXhhXs-4445XsJWUhbrQo5CTlST01cH');
    expect(CookiesLib.get(internals.SESSION_COOKIE_KEY)).to.match(CUID_REGEX);
  });

  it('autoSetVisitor overrides setVisitor with cookie without throwing an error if malformed AMP Linker param set and visitor ID cookie set', () => {
    const cookieJar = new jsdom.CookieJar();
    const window = new jsdom.JSDOM(undefined, {
      url: 'http://exampleampsite.com/products/red-boat?gbi=1*1u74ubq*gbivid*LU55Q2M3TkQyT2Y2VU5rMjlNekxpMXJjQ2g0MEYtNnRjbFhoaFhzLTQ0NDVYc0pXVWhiclFvNUNUbFNUMDFjSA.',
      cookieJar,
    }).window;
    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    const internals = gbTrackerCore.__getInternals();
    internals.WINDOW = window as unknown as Window;
    const CookiesLib = internals.COOKIES_LIB as any;

    CookiesLib._document = window.document;
    CookiesLib.set(internals.VISITOR_COOKIE_KEY, 'abc123');

    gbTrackerCore.setVisitor(1 as any, 1 as any);

    expect(() => {
      gbTrackerCore.autoSetVisitor();
      expect(CookiesLib.get(internals.VISITOR_COOKIE_KEY)).to.eql('abc123');
      expect(CookiesLib.get(internals.SESSION_COOKIE_KEY)).to.match(CUID_REGEX);
    }).to.not.throw();
  });

  it('autoSetVisitor ignores setVisitor', () => {
    const cookieJar = new jsdom.CookieJar();

    const window = new jsdom.JSDOM(undefined, { cookieJar }).window;

    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    const CookiesLib = gbTrackerCore.__getInternals().COOKIES_LIB as any;
    CookiesLib._document = window.document;

    gbTrackerCore.autoSetVisitor();
    gbTrackerCore.setVisitor(1 as any, 1 as any);

    expect(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY)).to.match(CUID_REGEX);
    expect(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY)).to.match(CUID_REGEX);
  });

  it('should push back the cookie expiry every time autoSetVisitor is used', () => {
    const cookieJar = new jsdom.CookieJar();

    const window = new jsdom.JSDOM(undefined, { cookieJar }).window;

    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    const CookiesLib = gbTrackerCore.__getInternals().COOKIES_LIB as any;
    CookiesLib._document = window.document;

    expect(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY)).to.be.undefined;
    expect(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY)).to.be.undefined;

    const SHORT_EXPIRY = 5;

    const visitorCookieValue = cuid();
    CookiesLib.set(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY, visitorCookieValue, { expires: SHORT_EXPIRY });

    let visitorCookie = _.find(cookieJar.toJSON().cookies, { key: gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY });

    const initialTime = moment((visitorCookie as any).expires).valueOf();
    const currentMoment = moment();

    expect(initialTime).to.be.most(moment(currentMoment).add(SHORT_EXPIRY + 1, 'seconds').valueOf());
    gbTrackerCore.autoSetVisitor();

    visitorCookie = _.find(cookieJar.toJSON().cookies, { key: gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY });
    const laterTime = moment((visitorCookie as any).expires).valueOf();
    expect(laterTime).to.be.least(moment(currentMoment).add(gbTrackerCore.__getInternals().VISITOR_TIMEOUT_SEC - 1, 'seconds').valueOf());
    expect(laterTime).to.be.most(moment(currentMoment).add(gbTrackerCore.__getInternals().VISITOR_TIMEOUT_SEC + 5, 'seconds').valueOf());
  });

  it('should allow visitor or session IDs as numbers and coerce to strings', () => {
    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    gbTrackerCore.__getInternals().sendEvent = () => { /* */ };

    gbTrackerCore.setVisitor(7 as any, 5 as any);
    const visit = gbTrackerCore.__getInternals().VISIT;
    expect(visit.customerData.visitorId).to.eql('7');
    expect(visit.customerData.sessionId).to.eql('5');
  });

  it('should use document\'s protocol, but only if known', () => {
    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    [
      { arg: undefined, expected: 'https:' },
      { arg: {}, expected: 'https:' },
      { arg: { location: undefined }, expected: 'https:' },
      { arg: { location: {} }, expected: 'https:' },
      { arg: { location: { protocol: undefined } }, expected: 'https:' },
      { arg: { location: { protocol: 'https:' } }, expected: 'https:' },
      { arg: { location: { protocol: 'http:' } }, expected: 'http:' },
      { arg: { location: { protocol: 'about:' } }, expected: 'https:' },
      { arg: { location: { protocol: 'https' } }, expected: 'https:' },
      { arg: { location: { protocol: 'http' } }, expected: 'https:' },
      { arg: { location: { protocol: 'about' } }, expected: 'https:' },
      { arg: { location: { protocol: 123456 } }, expected: 'https:' },
    ].forEach(({ arg, expected }) => {
      const got = gbTrackerCore.__getInternals().getProtocol(arg as any);
      expect(got).to.eql(expected);
    });
  });

  describe('Site Filter', () => {
    const siteFilter = 'site';

    const anySendableEvent: AnySendableEvent = {
      cart: {
        items: [
          {
            productId: 'asdfasd',
            collection: 'boatssrus',
            title: 'boats',
            sku: 'asdfasf98',
            quantity: 10,
            price: 100.21,
          },
        ],
      }
    };

    let gbTrackerCore: Tracker;

    beforeEach(() => {
      gbTrackerCore = new GbTracker('testcustomer', 'area');
      gbTrackerCore.autoSetVisitor();
    })

    it('should initialize siteFilter parameter', () => {
      expect(gbTrackerCore.__getInternals().SITE_FILTER).to.be.undefined;

      gbTrackerCore.setSite(siteFilter);
      expect(gbTrackerCore.__getInternals().SITE_FILTER).to.equal(siteFilter);
    });

    it('should add siteFilter to metadata if it exists', (done) => {
      gbTrackerCore.setSite(siteFilter);
  
      gbTrackerCore.__getInternals().sendEvent = (event: any) => {
        console.log('<<<', JSON.stringify(event.metadata));
        expect(event.metadata[0].key).to.be.equal(SITE_FILTER_METADATA_KEY);
        expect(event.metadata[0].value).to.be.equal(siteFilter);
        done();
      };
  
      gbTrackerCore.sendAddToCartEvent(anySendableEvent);
    });

    it('should NOT add siteFilter to metadata if it is empty', (done) => {
      console.log('***', JSON.stringify(gbTrackerCore.prepareEvent(anySendableEvent, EVENT_TYPE_ADD_TO_CART)));
      gbTrackerCore.__getInternals().sendEvent = (event: any) => {
        console.log('!!!', JSON.stringify(event.metadata));
        expect(event.metadata).to.be.undefined;
        done();
      };
  
      gbTrackerCore.sendAddToCartEvent(anySendableEvent);
    });

    it('should remove all metadata items with siteFilter key and add an initialized siteFilter if it exists', (done) => {
      gbTrackerCore.setSite(siteFilter);
  
      gbTrackerCore.__getInternals().sendEvent = (event: any) => {
        expect(event.metadata[0].key).to.be.equal(SITE_FILTER_METADATA_KEY);
        expect(event.metadata[0].value).to.be.equal(siteFilter);
        done();
      };
  
      gbTrackerCore.sendAddToCartEvent({
        ...anySendableEvent,
        metadata: [
          {
            key: 'siteFilter',
            value: 'test',
          },
          {
            key: 'sIteFiltEr',
            value: 'test',
          },
          {
            key: 'sitefilter',
            value: 'test',
          }
        ]
      });
    });

    it('should pass all metadata items with siteFilter key if siteFilter was not initialized', (done) => {
      gbTrackerCore.__getInternals().sendEvent = (event: any) => {
        expect(event.metadata[0].key).to.be.equal('siteFilter');
        expect(event.metadata[1].key).to.be.equal('sIteFiltEr');
        expect(event.metadata[2].key).to.be.equal('sitefilter');
        done();
      };
  
      gbTrackerCore.sendAddToCartEvent({
        ...anySendableEvent,
        metadata: [
          {
            key: 'siteFilter',
            value: 'test',
          },
          {
            key: 'sIteFiltEr',
            value: 'test',
          },
          {
            key: 'sitefilter',
            value: 'test',
          }
        ]
      });
    });

    it('should add siteFilter metadata item to all events', () => {
      gbTrackerCore.setSite('site');

      const siteFilterMetadataItem = { key: SITE_FILTER_METADATA_KEY, value: 'site' };

      expect(gbTrackerCore.prepareEvent(anySendableEvent, EVENT_TYPE_ADD_TO_CART).metadata).to.deep.equal([siteFilterMetadataItem]);
      expect(gbTrackerCore.prepareEvent(anySendableEvent, EVENT_TYPE_AUTO_SEARCH).metadata).to.deep.equal([siteFilterMetadataItem]);
      expect(gbTrackerCore.prepareEvent(anySendableEvent, EVENT_TYPE_IMPRESSION).metadata).to.deep.equal([siteFilterMetadataItem]);
      expect(gbTrackerCore.prepareEvent(anySendableEvent, EVENT_TYPE_ORDER).metadata).to.deep.equal([siteFilterMetadataItem]);
      expect(gbTrackerCore.prepareEvent(anySendableEvent, EVENT_TYPE_REMOVE_FROM_CART).metadata).to.deep.equal([siteFilterMetadataItem]);
      expect(gbTrackerCore.prepareEvent(anySendableEvent, EVENT_TYPE_SEARCH).metadata).to.deep.equal([siteFilterMetadataItem]);
      expect(gbTrackerCore.prepareEvent(anySendableEvent, EVENT_TYPE_VIEW_PRODUCT).metadata).to.deep.equal([siteFilterMetadataItem]);
    });

  });
});
