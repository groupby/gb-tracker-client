const chai   = require('chai');
const expect = chai.expect;
const diff   = require('deep-diff').diff;

window                = false;
document              = false;
navigator             = {};
navigator.appCodeName = 'Microsoft Internet Explorer';
navigator.userAgent   = 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)';

const GbTrackerCore = require('../../lib/gb-tracker-core');

describe('gb-tracker-core tests', ()=> {
  it('should accept valid search event containing only origin and id', (done) => {
    const expectedEvent = {
      search:    {
        searchId: 'asdfasdf',
        origin:   {
          sayt: true
        }
      },
      eventType: 'searchWithId',
      customer:  {
        id:   'testcustomer',
        area: 'area'
      },
      visit:     {
        customerData: {
          visitorId: 'visitor',
          sessionId: 'session'
        },
        generated:    {
          uri:            '',
          timezoneOffset: 240,
          localTime:      '2016-08-14T14:05:26.872Z'
        }
      }
    };

    const gbTrackerCore = new GbTrackerCore(expectedEvent.customer.id, expectedEvent.customer.area);

    gbTrackerCore.setInvalidEventCallback(() => {
      done('fail');
    });

    gbTrackerCore.__private.sendEvent = (event) => {
      if (event.eventType === 'sessionChange') {
        return;
      }

      expect(event.search).to.eql(Object.assign({}, expectedEvent.search, {
        origin: {
          dym:    false,
          sayt:   true,
          search: false,
          wisdom: false
        }
      }));
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

  it('should reject invalid searchWithId event', (done) => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    gbTrackerCore.__private.sendEvent = (event) => {
      if (event.eventType === 'sessionChange') {
        return;
      }

      done('fail');
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    const sendNotNested = () => {
      gbTrackerCore.setInvalidEventCallback((event, error) => {
        expect(error).to.match(/search: is missing/);
        sendNoSearchId();
      });

      gbTrackerCore.sendSearchEvent({
        searchId: 'asdfasdf',
        origin:   {
          sayt: true
        }
      });
    };

    const sendNoSearchId = () => {
      gbTrackerCore.setInvalidEventCallback((event, error) => {
        // If the searchId field is missing, it thinks it's a searchWithoutId event
        expect(error).to.match(/search.totalRecordCount: is missing/);
        sendNoOrigin()
      });

      gbTrackerCore.sendSearchEvent({
        search: {
          // searchId: 'asdfasdf',
          origin:   {
            sayt: true
          }
        }
      });
    };

    const sendNoOrigin = () => {
      gbTrackerCore.setInvalidEventCallback((event, error) => {
        expect(error).to.match(/search.origin: is missing/);
        done();
      });

      gbTrackerCore.sendSearchEvent({
        search: {
          searchId: 'asdfasdf',
          // origin:   {
          //   sayt: true
          // }
        }
      });
    };

    sendNotNested();
  });
});