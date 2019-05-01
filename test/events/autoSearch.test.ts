// tslint:disable:no-unused-expression
import { expect } from 'chai';

const GbTrackerCore = require('../../src');
const GbTrackerSlim = require('../../src/slim');

(window as any) = false;
(document as any) = false;
(navigator as any) = {};
(navigator as any).appCodeName = 'Microsoft Internet Explorer';
(navigator as any).userAgent = 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)';

describe('autoSearch tests', () => {
  it('should accept valid search event containing only origin and search id', (done) => {
    const expectedEvent = {
      search: {
        id: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        origin: {
          sayt: true,
        },
      },
      eventType: 'autoSearch',
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

    const gbTrackerCore = new GbTrackerCore(expectedEvent.customer.id, expectedEvent.customer.area);

    gbTrackerCore.setInvalidEventCallback(() => {
      done('fail');
    });

    gbTrackerCore.__getInternals().sendEvent = (event: any) => {

      expect(event.search).to.eql({
        ...expectedEvent.search,
        origin: {
          dym: false,
          sayt: true,
          search: false,
          recommendations: false,
          autosearch: false,
          navigation: false,
          collectionSwitcher: false,
        },
      });

      expect(event.clientVersion.raw).to.not.be.undefined;
      expect(event.eventType).to.eql(expectedEvent.eventType);
      expect(event.customer).to.eql(expectedEvent.customer);
      expect(event.visit.customerData).to.eql(expectedEvent.visit.customerData);
      expect(event.visit.generated.timezoneOffset).to.not.be.undefined;
      expect(event.visit.generated.localTime).to.not.be.undefined;
      done();
    };

    gbTrackerCore.setVisitor(expectedEvent.visit.customerData.visitorId, expectedEvent.visit.customerData.sessionId);

    gbTrackerCore.sendAutoSearchEvent({
      search: expectedEvent.search,
    });
  });

  it('should accept valid search event containing only origin and search id when slim', (done) => {
    const expectedEvent = {
      search: {
        id: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        origin: {
          sayt: true,
        },
      },
      eventType: 'autoSearch',
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

    const gbTrackerCore = new GbTrackerSlim(expectedEvent.customer.id, expectedEvent.customer.area);

    gbTrackerCore.setInvalidEventCallback(() => {
      done('fail');
    });

    gbTrackerCore.__getInternals().sendEvent = (event: any) => {

      expect(event.search).to.eql({
        ...expectedEvent.search,
        origin: {
          dym: false,
          sayt: true,
          search: false,
          recommendations: false,
          autosearch: false,
          navigation: false,
          collectionSwitcher: false,
        },
      });

      expect(event.clientVersion.raw).to.not.be.undefined;
      expect(event.eventType).to.eql(expectedEvent.eventType);
      expect(event.customer).to.eql(expectedEvent.customer);
      expect(event.visit.customerData).to.eql(expectedEvent.visit.customerData);
      expect(event.visit.generated.timezoneOffset).to.not.be.undefined;
      expect(event.visit.generated.localTime).to.not.be.undefined;
      done();
    };

    gbTrackerCore.setVisitor(expectedEvent.visit.customerData.visitorId, expectedEvent.visit.customerData.sessionId);

    gbTrackerCore.sendAutoSearchEvent({
      search: expectedEvent.search,
    });
  });

  it('should NOT accept with blank search.id', (done) => {
    const expectedEvent = {
      search: {
        id: '',
        origin: {
          sayt: true,
        },
      },
      eventType: 'autoSearch',
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

    const gbTrackerCore = new GbTrackerCore(expectedEvent.customer.id, expectedEvent.customer.area);

    gbTrackerCore.setInvalidEventCallback(() => {
      done();
    });

    gbTrackerCore.setVisitor(expectedEvent.visit.customerData.visitorId, expectedEvent.visit.customerData.sessionId);

    gbTrackerCore.sendAutoSearchEvent({
      search: expectedEvent.search,
    });
  });

  it('should reject invalid autoSearch event that is not nested in search', (done) => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    gbTrackerCore.__getInternals().sendEvent = (event: any) => {

      done('fail');
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    gbTrackerCore.setInvalidEventCallback((event: any, error: any) => {
      expect(error).to.match(/search: is missing/);
      done();
    });

    gbTrackerCore.sendAutoSearchEvent({
      responseId: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      origin: {
        sayt: true,
      },
    } as any);
  });

  it('should reject invalid autoSearch event that has search id', (done) => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    gbTrackerCore.__getInternals().sendEvent = (event: any) => {

      done('fail');
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    gbTrackerCore.setInvalidEventCallback((event: any, error: any) => {
      expect(error).to.match(/search\.id: is missing/);
      done();
    });

    gbTrackerCore.sendAutoSearchEvent({
      // responseId: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      search: {
        origin: {
          sayt: true,
        },
      },
    } as any);
  });

  it('should accept autoSearch event that has only search id', (done) => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    gbTrackerCore.__getInternals().sendEvent = (event: any) => {

      done();
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    gbTrackerCore.setInvalidEventCallback(() => {
      done('fail');
    });

    gbTrackerCore.sendAutoSearchEvent({
      search: {
        id: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        origin: {
          sayt: true,
        },
      },
    });
  });

  it('should reject invalid autoSearch event that has no origin', (done) => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    gbTrackerCore.__getInternals().sendEvent = (event: any) => {

      done('fail');
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    gbTrackerCore.setInvalidEventCallback((event: any, error: any) => {
      expect(error).to.match(/origin: is missing/);
      done();
    });

    gbTrackerCore.sendAutoSearchEvent({
      responseId: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      search: {
        // origin: {
        //   sayt: true
        // }
      },
    } as any);
  });
});
