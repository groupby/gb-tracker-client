// tslint:disable:no-unused-expression
import { expect } from 'chai';

const GbTracker = require('../../src');

(window as any) = false;
(document as any) = false;
(navigator as any) = {};
(navigator as any).appCodeName = 'Microsoft Internet Explorer';
(navigator as any).userAgent = 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)';

describe('impression tests', () => {
    it('should accept valid impression event', (done) => {
        const expectedEvent = {
            impression: {
                impressionType: 'recommendation',
                products: [
                    {
                    productId:  'asdfasd',
                    category: 'boats',
                    collection: 'boatssrus',
                    title: 'boats',
                    sku: 'asdfasf98',
                    price: 100.21,
                }],
            },
            eventType: 'impression',
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

        gbTrackerCore.__getInternals().sendEvent = (event: any) => {

            expect(event.clientVersion.raw).to.not.be.undefined;
            expect(event.impression.impressionType).to.eql(expectedEvent.impression.impressionType);
            expect(event.impression.products).to.eql(expectedEvent.impression.products);
            expect(event.eventType).to.eql(expectedEvent.eventType);
            expect(event.customer).to.eql(expectedEvent.customer);
            expect(event.visit.customerData).to.eql(expectedEvent.visit.customerData);
            expect(event.visit.generated.timezoneOffset).to.not.be.undefined;
            expect(event.visit.generated.localTime).to.not.be.undefined;
            done();
        };

        gbTrackerCore.setInvalidEventCallback(() => {
            done('fail');
        });



        gbTrackerCore.setVisitor(expectedEvent.visit.customerData.visitorId, expectedEvent.visit.customerData.sessionId);

        gbTrackerCore.sendImpressionEvent({
            impression: {
                impressionType: expectedEvent.impression.impressionType,
                products: expectedEvent.impression.products,
            }
        });
    });
});
