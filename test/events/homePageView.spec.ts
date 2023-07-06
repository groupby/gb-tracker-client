import { expect } from 'chai';

const GbTracker = require('../../src');

(window as any) = false;
(document as any) = false;
(navigator as any) = {};
(navigator as any).appCodeName = 'Microsoft Internet Explorer';
(navigator as any).userAgent = 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)';

describe('homePageView tests', () => {
    it('should accept valid homePageView event', (done) => {
        const expectedEvent = {
          eventType: 'homePageView',
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
          products: [
            {
              productId: 'asdfasd',
              category: 'boats',
              collection: 'boatssrus',
              title: 'boats',
              sku: 'asdfasf98',
              quantity: 10,
              price: 100.21,
            },
            {
              productId: 'anotherId',
              category: 'boats',
              collection: 'boatssrus',
              title: 'boats2',
              sku: 'asdfasf65',
              quantity: 5,
              price: 200.21,
            },
          ],
          metadata: [{
            key: 'testKey',
            value: 'testValue'
          }]
        };

        const gbTrackerCore = new GbTracker(expectedEvent.customer.id, expectedEvent.customer.area);

        gbTrackerCore.__getInternals().sendEvent = (event: any) => {
          expect(event.clientVersion.raw).to.not.be.undefined;
          expect(event.products).to.deep.equal(expectedEvent.products);
          expect(event.metadata).to.deep.equal(expectedEvent.metadata);
          expect(event.eventType).to.equal(expectedEvent.eventType);
          expect(event.customer).to.deep.equal(expectedEvent.customer);
          expect(event.visit.customerData).to.deep.equal(expectedEvent.visit.customerData);
          expect(event.visit.generated.timezoneOffset).to.not.be.undefined;
          expect(event.visit.generated.localTime).to.not.be.undefined;
          done();
        };

        gbTrackerCore.setInvalidEventCallback(() => {
          done('fail');
        });

        gbTrackerCore.setVisitor(expectedEvent.visit.customerData.visitorId, expectedEvent.visit.customerData.sessionId);

        gbTrackerCore.sendHomePageViewEvent({
          products: expectedEvent.products,
          metadata: expectedEvent.metadata,
        });
    });
});
