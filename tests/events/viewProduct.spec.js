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
  it('should accept valid viewProduct event', (done) => {
    const expectedEvent = {
      product:   {
        id:         'asdfasd',
        category:   'boats',
        collection: 'kayaksrus',
        title:      'kayak',
        sku:        'asdfasf98',
        price:      100.21
      },
      eventType: 'viewProduct',
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

      expect(event.product).to.eql(expectedEvent.product);
      expect(event.eventType).to.eql(expectedEvent.eventType);
      expect(event.customer).to.eql(expectedEvent.customer);
      expect(event.visit.customerData).to.eql(expectedEvent.visit.customerData);
      expect(event.visit.generated.timezoneOffset).to.not.be.undefined;
      expect(event.visit.generated.localTime).to.not.be.undefined;
      done();
    };

    gbTrackerCore.setVisitor(expectedEvent.visit.customerData.visitorId, expectedEvent.visit.customerData.sessionId);

    gbTrackerCore.sendViewProductEvent({
      product: expectedEvent.product
    });
  });

  it('should reject invalid viewProduct event', (done) => {
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
        expect(error).to.match(/product: is missing/);
        sendNoProductId();
      });
      gbTrackerCore.sendViewProductEvent({
        id:         'asdfasd',
        category:   'boats',
        collection: 'kayaksrus',
        title:      'kayak',
        sku:        'asdfasf98',
        price:      100.21
      });
    };

    const sendNoProductId = () => {
      gbTrackerCore.setInvalidEventCallback((event, error) => {
        expect(error).to.match(/product\.id: is missing/);
        sendNoPrice();
      });
      gbTrackerCore.sendViewProductEvent({
        product: {
          // id: 'asdfasd',
          category:   'boats',
          collection: 'kayaksrus',
          title:      'kayak',
          sku:        'asdfasf98',
          price:      100.21
        }
      });
    };

    const sendNoPrice = () => {
      gbTrackerCore.setInvalidEventCallback((event, error) => {
        expect(error).to.match(/product\.price: is missing/);
        sendNoTitle();
      });
      gbTrackerCore.sendViewProductEvent({
        product: {
          id:         'asdfasd',
          category:   'boats',
          collection: 'kayaksrus',
          title:      'kayak',
          sku:        'asdfasf98',
          // price: 100.21
        }
      });
    };

    const sendNoTitle = () => {
      gbTrackerCore.setInvalidEventCallback((event, error) => {
        expect(error).to.match(/product\.title: is missing/);
        sendNoCategory();
      });
      gbTrackerCore.sendViewProductEvent({
        product: {
          id:         'asdfasd',
          category:   'boats',
          collection: 'kayaksrus', // title: 'kayak',
          sku:        'asdfasf98',
          price:      100.21
        }
      });
    };

    const sendNoCategory = () => {
      gbTrackerCore.setInvalidEventCallback((event, error) => {
        expect(error).to.match(/product\.category: is missing/);
        done();
      });
      gbTrackerCore.sendViewProductEvent({
        product: {
          id:         'asdfasd', // category: 'boats',
          collection: 'kayaksrus',
          title:      'kayak',
          sku:        'asdfasf98',
          price:      100.21
        }
      });
    };

    sendNotNested();
  });
});