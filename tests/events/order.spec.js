/*eslint  no-global-assign: "off"*/
const chai   = require('chai');
const expect = chai.expect;

window                = false;
document              = false;
navigator             = {};
navigator.appCodeName = 'Microsoft Internet Explorer';
navigator.userAgent   = 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)';

const GbTracker = require('../../lib/gb-tracker-full');

describe('order tests', () => {
  it('should accept valid order event', (done) => {
    const expectedEvent = {
      cart:      {
        items: [
          {
            productId:  'asdfasd',
            category:   'boats',
            collection: 'boatssrus',
            title:      'boats',
            sku:        'asdfasf98',
            quantity:   10,
            price:      100.21
          },
          {
            productId:  'anotherId',
            category:   'boats',
            collection: 'boatssrus',
            title:      'boats2',
            sku:        'asdfasf65',
            quantity:   5,
            price:      200.21
          }
        ]
      },
      eventType: 'order',
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

    const gbTrackerCore = new GbTracker(expectedEvent.customer.id, expectedEvent.customer.area);

    gbTrackerCore.setInvalidEventCallback(() => {
      done('fail');
    });

    gbTrackerCore.__private.sendEvent = (event) => {
      if (event.eventType === 'sessionChange') {
        return;
      }

      expect(event.clientVersion.raw).to.not.be.undefined;
      expect(event.products).to.eql(expectedEvent.products);
      expect(event.eventType).to.eql(expectedEvent.eventType);
      expect(event.customer).to.eql(expectedEvent.customer);
      expect(event.visit.customerData).to.eql(expectedEvent.visit.customerData);
      expect(event.visit.generated.timezoneOffset).to.not.be.undefined;
      expect(event.visit.generated.localTime).to.not.be.undefined;
      done();
    };

    gbTrackerCore.setVisitor(expectedEvent.visit.customerData.visitorId, expectedEvent.visit.customerData.sessionId);

    gbTrackerCore.sendOrderEvent({
      cart: expectedEvent.cart
    });
  });

  it('should reject invalid order event that is not nested in cart', (done) => {
    const gbTrackerCore = new GbTracker('testcustomer', 'area');

    gbTrackerCore.__private.sendEvent = (event) => {
      if (event.eventType === 'sessionChange') {
        return;
      }

      done('fail');
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    gbTrackerCore.setInvalidEventCallback((event, error) => {
      expect(error).to.match(/cart: is missing/);
      done();
    });

    gbTrackerCore.sendOrderEvent({
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
    });
  });

  it('should reject invalid order event missing product ID', (done) => {
    const gbTrackerCore = new GbTracker('testcustomer', 'area');

    gbTrackerCore.__private.sendEvent = (event) => {
      if (event.eventType === 'sessionChange') {
        return;
      }

      done('fail');
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    gbTrackerCore.setInvalidEventCallback((event, error) => {
      expect(error).to.match(/productId: is missing/);
      done();
    });

    gbTrackerCore.sendOrderEvent({
      cart: {
        items: [
          {
            // productId:  'asdfasd',
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

  it('should reject invalid order event missing quantity', (done) => {
    const gbTrackerCore = new GbTracker('testcustomer', 'area');

    gbTrackerCore.__private.sendEvent = (event) => {
      if (event.eventType === 'sessionChange') {
        return;
      }

      done('fail');
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    gbTrackerCore.setInvalidEventCallback((event, error) => {
      expect(error).to.match(/quantity: is missing/);
      done();
    });

    gbTrackerCore.sendOrderEvent({
      cart: {
        items: [
          {
            productId:  'asdfasd',
            category:   'boats',
            collection: 'boatssrus',
            title:      'boats',
            sku:        'asdfasf98',
            // quantity:   10,
            price:      100.21
          }
        ]
      }
    });
  });

  it('should reject invalid order event missing price', (done) => {
    const gbTrackerCore = new GbTracker('testcustomer', 'area');

    gbTrackerCore.__private.sendEvent = (event) => {
      if (event.eventType === 'sessionChange') {
        return;
      }

      done('fail');
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    gbTrackerCore.setInvalidEventCallback((event, error) => {
      expect(error).to.match(/price: is missing/);
      done();
    });

    gbTrackerCore.sendOrderEvent({
      cart: {
        items: [
          {
            productId:  'asdfasd',
            category:   'boats',
            collection: 'boatssrus',
            title:      'boats',
            sku:        'asdfasf98',
            quantity:   10,
            // price:      100.21
          }
        ]
      }
    });
  });

  it('should reject invalid order event missing title', (done) => {
    const gbTrackerCore = new GbTracker('testcustomer', 'area');

    gbTrackerCore.__private.sendEvent = (event) => {
      if (event.eventType === 'sessionChange') {
        return;
      }

      done('fail');
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    gbTrackerCore.setInvalidEventCallback((event, error) => {
      expect(error).to.match(/title: is missing/);
      done();
    });

    gbTrackerCore.sendOrderEvent({
      cart: {
        items: [
          {
            productId:  'asdfasd',
            category:   'boats',
            collection: 'boatssrus',
            // title:      'boats',
            sku:        'asdfasf98',
            quantity:   10,
            price:      100.21
          }
        ]
      }
    });
  });

  it('should NOT reject order event missing category', (done) => {
    const gbTrackerCore = new GbTracker('testcustomer', 'area');

    gbTrackerCore.__private.sendEvent = (event) => {
      if (event.eventType === 'sessionChange') {
        return;
      }

      expect(event.cart.items).to.eql([
        {
          productId:  'asdfasd',
          // category:   'boats',
          collection: 'boatssrus',
          title:      'boats',
          sku:        'asdfasf98',
          quantity:   10,
          price:      100.21
        }
      ]);

      done();
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    gbTrackerCore.setInvalidEventCallback((event, error) => {
      done(error || 'fail');
    });

    gbTrackerCore.sendOrderEvent({
      cart: {
        items: [
          {
            productId:  'asdfasd',
            // category:   'boats',
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
});
