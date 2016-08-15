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
  it('should accept valid order event', (done) => {
    const expectedEvent = {
      products:  [
        {
          id:         'asdfasd',
          category:   'boats',
          collection: 'kayaksrus',
          title:      'kayak',
          sku:        'asdfasf98',
          qty:        10,
          price:      100.21
        },
        {
          id:         'anotherId',
          category:   'boats',
          collection: 'kayaksrus',
          title:      'kayak2',
          sku:        'asdfasf65',
          qty:        5,
          price:      200.21
        }
      ],
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

    const gbTrackerCore = new GbTrackerCore(expectedEvent.customer.id, expectedEvent.customer.area);

    gbTrackerCore.setInvalidEventCallback(() => {
      done('fail');
    });

    gbTrackerCore.__private.sendEvent = (event) => {
      if (event.eventType === 'sessionChange') {
        return;
      }

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
      products: expectedEvent.products
    });
  });

  it('should reject invalid addToBasket event', (done) => {
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
        expect(error).to.match(/products: is missing/);
        sendNoProductId();
      });

      gbTrackerCore.sendOrderEvent({
        id:         'asdfasd',
        category:   'boats',
        collection: 'kayaksrus',
        title:      'kayak',
        sku:        'asdfasf98',
        qty:        10,
        price:      100.21
      });
    };

    const sendNoProductId = () => {
      gbTrackerCore.setInvalidEventCallback((event, error) => {
        expect(error).to.match(/products\[0]\.id: is missing/);
        sendNoQty()
      });

      gbTrackerCore.sendOrderEvent({
        products: [
          {
            // id:         'asdfasd',
            category:   'boats',
            collection: 'kayaksrus',
            title:      'kayak',
            sku:        'asdfasf98',
            qty:        10,
            price:      100.21
          },
          {
            id:         'anotherId',
            category:   'boats',
            collection: 'kayaksrus',
            title:      'kayak2',
            sku:        'asdfasf65',
            qty:        5,
            price:      200.21
          }
        ]
      });
    };

    const sendNoQty = () => {
      gbTrackerCore.setInvalidEventCallback((event, error) => {
        expect(error).to.match(/products\[1]\.qty: is missing/);
        sendNoPrice();
      });

      gbTrackerCore.sendOrderEvent({
        products: [
          {
            id:         'asdfasd',
            category:   'boats',
            collection: 'kayaksrus',
            title:      'kayak',
            sku:        'asdfasf98',
            qty:        10,
            price:      100.21
          },
          {
            id:         'anotherId',
            category:   'boats',
            collection: 'kayaksrus',
            title:      'kayak2',
            sku:        'asdfasf65', // qty:        5,
            price:      200.21
          }
        ]
      });
    };

    const sendNoPrice = () => {
      gbTrackerCore.setInvalidEventCallback((event, error) => {
        expect(error).to.match(/products\[0]\.price: is missing/);
        sendNoTitle();
      });

      gbTrackerCore.sendOrderEvent({
        products: [
          {
            id:         'asdfasd',
            category:   'boats',
            collection: 'kayaksrus',
            title:      'kayak',
            sku:        'asdfasf98',
            qty:        10, // price:      100.21
          },
          {
            id:         'anotherId',
            category:   'boats',
            collection: 'kayaksrus',
            title:      'kayak2',
            sku:        'asdfasf65',
            qty:        5,
            price:      200.21
          }
        ]
      });
    };

    const sendNoTitle = () => {
      gbTrackerCore.setInvalidEventCallback((event, error) => {
        expect(error).to.match(/products\[1]\.title: is missing/);
        sendNoCategory();
      });

      gbTrackerCore.sendOrderEvent({
        products: [
          {
            id:         'asdfasd',
            category:   'boats',
            collection: 'kayaksrus',
            title:      'kayak',
            sku:        'asdfasf98',
            qty:        10,
            price:      100.21
          },
          {
            id:         'anotherId',
            category:   'boats',
            collection: 'kayaksrus', // title:      'kayak2',
            sku:        'asdfasf65',
            qty:        5,
            price:      200.21
          }
        ]
      });
    };

    const sendNoCategory = (event, error) => {
      gbTrackerCore.setInvalidEventCallback((event, error) => {
        expect(error).to.match(/products\[0]\.category: is missing/);
        done();
      });

      gbTrackerCore.sendOrderEvent({
        products: [
          {
            id:         'asdfasd', // category:   'boats',
            collection: 'kayaksrus',
            title:      'kayak',
            sku:        'asdfasf98',
            qty:        10,
            price:      100.21
          },
          {
            id:         'anotherId',
            category:   'boats',
            collection: 'kayaksrus',
            title:      'kayak2',
            sku:        'asdfasf65',
            qty:        5,
            price:      200.21
          }
        ]
      });
    };

    sendNotNested();
  });
});