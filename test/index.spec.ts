// tslint:disable:no-unused-expression
import { expect } from 'chai';
import _ from 'lodash';
import jsdom from 'jsdom';
import moment from 'moment';
import { EVENT_TYPE_SEARCH } from '../src/eventTypes';

// tslint:disable-next-line:no-var-requires
const GbTracker: any = require('../src');

(window as any) = {};
(document as any) = false;
(navigator as any) = {};
(navigator as any).appCodeName = 'Microsoft Internet Explorer';
(navigator as any).userAgent = 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)';

const CUID_REGEX = /^c[0-9a-z]{8}[0-9a-z]{4}[0-9a-z]{4}[0-9a-z]{8}$/i;

describe('gb-tracker-core index tests', () => {
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

  it('should accept valid search event without search id', (done) => {
    const expectedEvent = {
      search: {
        totalRecordCount: 10,
        pageInfo: {
          recordEnd: 10,
          recordStart: 5,
        },
        selectedNavigation: [
          {
            name: 'refined 1',
            displayName: 'refined 1',
            or: false,
            refinements: [
              {
                type: 'value',
                value: 'something',
                count: 9823,
              },
            ],
          },
        ],
        origin: {
          search: true,
          dym: false,
          sayt: false,
          recommendations: false,
          autosearch: false,
          navigation: false,
          collectionSwitcher: false,
        },
        query: 'searchy searchface < > no angles or trailing spaces    ',
      },
      eventType: EVENT_TYPE_SEARCH,
      customer: {
        id: 'testcustomer',
        area: 'area',
      },
      visit: {
        customerData: {
          visitorId: 'visitor',
          sessionId: 'session',
        },
        generated: {
          uri: '',
          timezoneOffset: 240,
          localTime: '2016-08-14T14:05:26.872Z',
        },
      },
    };

    const gbTrackerCore = new GbTracker(expectedEvent.customer.id, expectedEvent.customer.area);

    gbTrackerCore.setInvalidEventCallback(() => {
      done('fail');
    });

    gbTrackerCore.__getInternals().sendEvent = (event: any) => {
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
      search: expectedEvent.search,
    });
  });

});
