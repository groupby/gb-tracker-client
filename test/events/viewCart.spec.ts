// tslint:disable:no-unused-expression
import { expect } from 'chai';

const GbTrackerCore = require('../../src');

(window as any) = false;
(document as any) = false;
(navigator as any) = {};
(navigator as any).appCodeName = 'Microsoft Internet Explorer';
(navigator as any).userAgent = 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)';

describe('viewCart tests', () => {
  it('should accept valid viewCart event', (done) => {
    const expectedEvent = {
      cart: {
        items: [
          {
            productId: 'asdfasd',
            category: 'boats',
            collection: 'boatssrus',
            title: 'boats',
            sku: 'asdfasf98',
            quantity: 10,
            price: 100.21,
          },
        ],
      },
      eventType: 'viewCart',
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

      expect(event.clientVersion.raw).to.not.be.undefined;
      expect(event.eventType).to.eql(expectedEvent.eventType);
      expect(event.customer).to.eql(expectedEvent.customer);
      expect(event.visit.customerData).to.eql(expectedEvent.visit.customerData);
      expect(event.visit.generated.timezoneOffset).to.not.be.undefined;
      expect(event.visit.generated.localTime).to.not.be.undefined;
      done();
    };

    gbTrackerCore.setVisitor(expectedEvent.visit.customerData.visitorId, expectedEvent.visit.customerData.sessionId);

    gbTrackerCore.sendViewCartEvent({
      cart: expectedEvent.cart,
    });
  });

  it('should reject invalid viewCart event that is not nested in cart', (done) => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    gbTrackerCore.__getInternals().sendEvent = (event: any) => {

      done('fail');
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    gbTrackerCore.setInvalidEventCallback((event: any, error: any) => {
      expect(error).to.match(/cart: is missing/);
      done();
    });

    gbTrackerCore.sendViewCartEvent({
      items: [
        {
          productId: 'asdfasd',
          category: 'boats',
          collection: 'boatssrus',
          title: 'boats',
          sku: 'asdfasf98',
          quantity: 10,
          price: 100.21,
        },
      ],
    } as any);
  });

  it('should reject invalid viewCart event that is missing productId', (done) => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    gbTrackerCore.__getInternals().sendEvent = (event: any) => {

      done('fail');
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    gbTrackerCore.setInvalidEventCallback((event: any, error: any) => {
      expect(error).to.match(/productId: is missing/);
      done();
    });

    gbTrackerCore.sendViewCartEvent({
      cart: {
        items: [
          {
            // productId:  'asdfasd',
            category: 'boats',
            collection: 'boatssrus',
            title: 'boats',
            sku: 'asdfasf98',
            quantity: 10,
            price: 100.21,
          },
        ],
      },
    } as any);
  });

  it('should reject invalid viewCart event that is missing quantity', (done) => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    gbTrackerCore.__getInternals().sendEvent = (event: any) => {

      done('fail');
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    gbTrackerCore.setInvalidEventCallback((event: any, error: any) => {
      expect(error).to.match(/quantity: is missing/);
      done();
    });

    gbTrackerCore.sendViewCartEvent({
      cart: {
        items: [
          {
            productId: 'asdfasd',
            category: 'boats',
            collection: 'boatssrus',
            title: 'boats',
            sku: 'asdfasf98',
            // quantity:   10,
            price: 100.21,
          },
        ],
      },
    } as any);
  });

  it('should not reject viewCart event that is missing price', (done) => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    gbTrackerCore.__getInternals().sendEvent = (event: any) => {

      done();
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    gbTrackerCore.setInvalidEventCallback((event: any, error: any) => {
      expect(error).to.match(/price: is missing/);
      done('fail');
    });

    gbTrackerCore.sendViewCartEvent({
      cart: {
        items: [
          {
            productId: 'asdfasd',
            category: 'boats',
            collection: 'boatssrus',
            title: 'boats',
            sku: 'asdfasf98',
            quantity: 10,
            // price:      100.21
          },
        ],
      },
    });
  });

  it('should reject invalid viewCart event that is missing title', (done) => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    gbTrackerCore.__getInternals().sendEvent = (event: any) => {

      done('fail');
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    gbTrackerCore.setInvalidEventCallback((event: any, error: any) => {
      expect(error).to.match(/title: is missing/);
      done();
    });

    gbTrackerCore.sendViewCartEvent({
      cart: {
        items: [
          {
            productId: 'asdfasd',
            category: 'boats',
            collection: 'boatssrus',
            // title:      'boats',
            sku: 'asdfasf98',
            quantity: 10,
            price: 100.21,
          },
        ],
      },
    } as any);
  });

  it('should NOT reject viewCart event that is missing category', (done) => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    gbTrackerCore.__getInternals().sendEvent = (event: any) => {

      expect(event.cart.items).to.eql([
        {
          productId: 'asdfasd',
          // category:   'boats',
          collection: 'boatssrus',
          title: 'boats',
          sku: 'asdfasf98',
          quantity: 10,
          price: 100.21,
        },
      ]);

      done();
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    gbTrackerCore.setInvalidEventCallback(() => {
      done('fail');
    });

    gbTrackerCore.sendViewCartEvent({
      cart: {
        items: [
          {
            productId: 'asdfasd',
            // category:   'boats',
            collection: 'boatssrus',
            title: 'boats',
            sku: 'asdfasf98',
            quantity: 10,
            price: 100.21,
          },
        ],
      },
    });
  });
});
