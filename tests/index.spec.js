/*eslint  no-global-assign: "off"*/
const chai = require('chai');
const expect = chai.expect;
const jsdom = require('jsdom');
const _ = require('lodash');
const moment = require('moment');

window = {};
document = false;
navigator = {};
navigator.appCodeName = 'Microsoft Internet Explorer';
navigator.userAgent = 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)';

const GbTracker = require('../index');

const CUID_REGEX = /^c[0-9a-z]{8}[0-9a-z]{4}[0-9a-z]{4}[0-9a-z]{8}$/i;

describe('gb-tracker-core index tests', () => {
  it('sets visitor and session cookies', () => {
    const cookieJar = jsdom.createCookieJar();

    const window = jsdom.jsdom(undefined, { cookieJar }).defaultView;
    const CookiesLib = require('cookies-js')(window);

    expect(CookiesLib.get(GbTracker.VISITOR_COOKIE_KEY)).to.be.undefined;
    expect(CookiesLib.get(GbTracker.SESSION_COOKIE_KEY)).to.be.undefined;

    GbTracker.__overrideCookiesLib(CookiesLib);
    const gbTrackerCore = new GbTracker('testcustomer', 'area');
    gbTrackerCore.autoSetVisitor();

    expect(CookiesLib.get(GbTracker.VISITOR_COOKIE_KEY)).to.match(CUID_REGEX);
    expect(CookiesLib.get(GbTracker.SESSION_COOKIE_KEY)).to.match(CUID_REGEX);
    expect(CookiesLib.get(GbTracker.VISITOR_COOKIE_KEY)).to.not.eql(CookiesLib.get(GbTracker.SESSION_COOKIE_KEY));

    expect(gbTrackerCore.getVisitorId()).to.eql(CookiesLib.get(GbTracker.VISITOR_COOKIE_KEY));
    expect(gbTrackerCore.getSessionId()).to.eql(CookiesLib.get(GbTracker.SESSION_COOKIE_KEY));
    expect(gbTrackerCore.getLoginId()).to.be.undefined;

    expect(cookieJar.toJSON().cookies.length).to.eql(2);
    const sessionCookie = _.find(cookieJar.toJSON().cookies, { key: GbTracker.SESSION_COOKIE_KEY });
    const visitorCookie = _.find(cookieJar.toJSON().cookies, { key: GbTracker.VISITOR_COOKIE_KEY });

    expect(moment(sessionCookie.expires).valueOf()).to.be.most(moment().add(GbTracker.SESSION_TIMEOUT_SEC, 'seconds').valueOf());
    expect(moment(visitorCookie.expires).year()).to.eql(moment().add(GbTracker.VISITOR_TIMEOUT_SEC, 'seconds').year());
  });

  it('should accept valid search event without search id', (done) => {
    const expectedEvent = {
      search: {
        totalRecordCount: 10,
        pageInfo: {
          recordEnd: 10,
          recordStart: 5
        },
        selectedNavigation: [{
          name: 'refined 1',
          displayName: 'refined 1',
          or: false,
          refinements: [{
            type: 'value',
            value: 'something',
            count: 9823
          }]
        }],
        origin: {
          search: true,
          dym: false,
          sayt: false,
          recommendations: false,
          autosearch: false,
          navigation: false,
          collectionSwitcher: false
        },
        query: 'searchy searchface < > no angles or trailing spaces    '
      },
      eventType: 'search',
      customer: {
        id: 'testcustomer',
        area: 'area'
      },
      visit: {
        customerData: {
          visitorId: 'visitor',
          sessionId: 'session'
        },
        generated: {
          uri: '',
          timezoneOffset: 240,
          localTime: '2016-08-14T14:05:26.872Z'
        }
      }
    };

    const gbTrackerCore = new GbTracker(expectedEvent.customer.id, expectedEvent.customer.area);

    gbTrackerCore.setInvalidEventCallback(() => {
      done('fail');
    });

    gbTrackerCore.__private.sendEvent = (event) => {
      if (event.eventType === 'sessionChange') {
        return;
      }

      expectedEvent.search.query = 'searchy searchface no angles or trailing spaces';

      expect(event.clientVersion.raw).to.not.be.undefined;
      expect(event.search).to.eql(expectedEvent.search);
      expect(event.eventType).to.eql(expectedEvent.eventType);
      expect(event.customer).to.eql(expectedEvent.customer);
      expect(event.visit.customerData).to.eql(expectedEvent.visit.customerData);
      expect(event.visit.generated.timezoneOffset).to.not.be.undefined;
      expect(event.visit.generated.localTime).to.not.be.undefined;
      done();
    };

    gbTrackerCore.setVisitor(expectedEvent.visit.customerData.visitorId, expectedEvent.visit.customerData.sessionId);

    gbTrackerCore.sendSearchEvent({
      search: expectedEvent.search
    });
  });

});
