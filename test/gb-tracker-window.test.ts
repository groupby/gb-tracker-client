// tslint:disable:no-unused-expression
import { expect } from 'chai';
import _ from 'lodash';
import pjson from '../package.json';
import jsdom from 'jsdom';
import fs from 'fs';
import glob from 'glob';

const buildFiles = glob.sync('build/*.js');

describe('browser version tests', () => {

  before(() => {
    expect(buildFiles.length).to.eql(2);
    (window as any) = {};
  });

  afterEach(() => {
    (window as any) = {};
  });

  it('first file loads onto the window object and can send event', (done) => {
    window = new jsdom.JSDOM().window;
    const filedata = fs.readFileSync(buildFiles[0], 'utf8');
    // tslint:disable-next-line:no-eval
    eval(filedata);

    expect(_.isObject((window as any).GbTracker)).to.eql(true);
    expect((window as any).GbTracker.VERSION).to.eql(pjson.version);

    const expectedEvent: any = {
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
      eventType: 'addToCart',
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

    const gbTracker = new (window as any).GbTracker(expectedEvent.customer.id, expectedEvent.customer.area);

    gbTracker.setInvalidEventCallback(() => {
      done('fail');
    });

    gbTracker.__getInternals().sendEvent = (event: any) => {
      if (event.eventType === 'sessionChange') {
        return;
      }

      expect(event.clientVersion.raw).to.not.be.undefined;
      expect(event.product).to.eql(expectedEvent.product);
      expect(event.eventType).to.eql(expectedEvent.eventType);
      expect(event.customer).to.eql(expectedEvent.customer);
      expect(event.visit.customerData).to.eql(expectedEvent.visit.customerData);
      expect(event.visit.generated.timezoneOffset).to.not.be.undefined;
      expect(event.visit.generated.localTime).to.not.be.undefined;
      done();
    };

    gbTracker.setVisitor(expectedEvent.visit.customerData.visitorId, expectedEvent.visit.customerData.sessionId);

    gbTracker.sendAddToCartEvent({
      cart: expectedEvent.cart,
    });

  });

  it('second file loads onto the window object and can send event', (done) => {
    window = new jsdom.JSDOM().window;
    const filedata = fs.readFileSync(buildFiles[1], 'utf8');
    // tslint:disable-next-line:no-eval
    eval(filedata);

    expect(_.isObject((window as any).GbTracker)).to.eql(true);
    expect((window as any).GbTracker.VERSION).to.eql(pjson.version);

    const expectedEvent: any = {
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
      eventType: 'addToCart',
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

    const gbTracker = new (window as any).GbTracker(expectedEvent.customer.id, expectedEvent.customer.area);

    gbTracker.setInvalidEventCallback(() => {
      done('fail');
    });

    gbTracker.__getInternals().sendEvent = (event: any) => {
      if (event.eventType === 'sessionChange') {
        return;
      }

      expect(event.clientVersion.raw).to.not.be.undefined;
      expect(event.product).to.eql(expectedEvent.product);
      expect(event.eventType).to.eql(expectedEvent.eventType);
      expect(event.customer).to.eql(expectedEvent.customer);
      expect(event.visit.customerData).to.eql(expectedEvent.visit.customerData);
      expect(event.visit.generated.timezoneOffset).to.not.be.undefined;
      expect(event.visit.generated.localTime).to.not.be.undefined;
      done();
    };

    gbTracker.setVisitor(expectedEvent.visit.customerData.visitorId, expectedEvent.visit.customerData.sessionId);

    gbTracker.sendAddToCartEvent({
      cart: expectedEvent.cart,
    });

  });
});
