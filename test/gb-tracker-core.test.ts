// tslint:disable:no-unused-expression
import { expect } from 'chai';
import _ from 'lodash';
import LZString from 'lz-string';
import jsdom from 'jsdom';
import moment from 'moment';
import cuid from 'cuid';
import { TrackerCore } from '../src/core';

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
    const CookiesLib = gbTrackerCore.__getInternals().COOKIES_LIB;
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
    const CookiesLib = gbTrackerCore.__getInternals().COOKIES_LIB;
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
    const CookiesLib = gbTrackerCore.__getInternals().COOKIES_LIB;
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
    const CookiesLib = gbTrackerCore.__getInternals().COOKIES_LIB;
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

  it('autoSetVisitor overrides setVisitor', () => {
    const cookieJar = new jsdom.CookieJar();

    const window = new jsdom.JSDOM(undefined, { cookieJar }).window;

    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    const CookiesLib = gbTrackerCore.__getInternals().COOKIES_LIB;
    CookiesLib._document = window.document;

    gbTrackerCore.setVisitor(1 as any, 1 as any);
    gbTrackerCore.autoSetVisitor();

    expect(CookiesLib.get(gbTrackerCore.__getInternals().VISITOR_COOKIE_KEY)).to.match(CUID_REGEX);
    expect(CookiesLib.get(gbTrackerCore.__getInternals().SESSION_COOKIE_KEY)).to.match(CUID_REGEX);
  });

  it('autoSetVisitor ignores setVisitor', () => {
    const cookieJar = new jsdom.CookieJar();

    const window = new jsdom.JSDOM(undefined, { cookieJar }).window;

    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    const CookiesLib = gbTrackerCore.__getInternals().COOKIES_LIB;
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
    const CookiesLib = gbTrackerCore.__getInternals().COOKIES_LIB;
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

  it('should sendEvent using sendSegment', (done) => {
    const gbTrackerCore = new GbTracker('testcustomer', 'area');

    const sendSegment = (segment: any) => {
      expect(segment.segment).to.eql(LZString.compressToEncodedURIComponent(JSON.stringify(event)));
      expect(segment.id).to.eql(0);
      expect(segment.total).to.eql(1);
      expect(segment.clientVersion).to.not.be.undefined;
      expect(segment.uuid).to.match(CUID_REGEX);
      done();
    };

    const event: any = {
      first: 'this',
      second: 'that',
    };

    gbTrackerCore.__getInternals().sendEvent(event, sendSegment);
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
      { arg: { location: { protocol: 'http' } }, expected: 'http:' },
      { arg: { location: { protocol: 'about' } }, expected: 'https:' },
      { arg: { location: { protocol: 123456 } }, expected: 'https:' },
    ].forEach(({ arg, expected }) => {
      const got = gbTrackerCore.__getInternals().getProtocol(arg as any);
      expect(got).to.eql(expected);
    });
  });

});
