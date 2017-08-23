/*eslint  no-global-assign: "off"*/
const chai = require('chai');
const expect = chai.expect;
const jsdom = require('jsdom');
const _ = require('lodash');
const pjson = require('../package.json');
const fs = require('fs');

const glob = require('glob');
const distFiles = glob.sync('dist/*.js');

describe('browser version tests', () => {

  before(() => {
    expect(distFiles.length).to.eql(2);
    window = {};
  });

  afterEach(() => {
    window = {};
  });

  it('first file loads onto the window object and can send event', (done) => {
    window = jsdom.jsdom().defaultView;
    const filedata = fs.readFileSync(distFiles[0], 'utf8');
    eval(filedata);

    expect(_.isObject(window.GbTracker)).to.eql(true);
    expect(window.GbTracker.VERSION).to.eql(pjson.version);

    const expectedEvent = {
      cart: {
        items: [{
          productId: 'asdfasd',
          category: 'boats',
          collection: 'boatssrus',
          title: 'boats',
          sku: 'asdfasf98',
          quantity: 10,
          price: 100.21
        }]
      },
      eventType: 'addToCart',
      customer: {
        id: 'testcustomer',
        area: 'area'
      },
      visit: {
        customerData: {
          visitorId: 'visitor',
          sessionId: 'session'
        },
        generated: {
          uri: '',
          timezoneOffset: 240,
          localTime: '2016-08-14T14:05:26.872Z'
        }
      }
    };

    const gbTracker = new window.GbTracker(expectedEvent.customer.id, expectedEvent.customer.area);

    gbTracker.setInvalidEventCallback(() => {
      done('fail');
    });

    gbTracker.__private.sendEvent = (event) => {
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
      cart: expectedEvent.cart
    });

  });

  it('second file loads onto the window object and can send event', (done) => {
    window = jsdom.jsdom().defaultView;
    const filedata = fs.readFileSync(distFiles[1], 'utf8');
    eval(filedata);

    expect(_.isObject(window.GbTracker)).to.eql(true);
    expect(window.GbTracker.VERSION).to.eql(pjson.version);

    const expectedEvent = {
      cart: {
        items: [{
          productId: 'asdfasd',
          category: 'boats',
          collection: 'boatssrus',
          title: 'boats',
          sku: 'asdfasf98',
          quantity: 10,
          price: 100.21
        }]
      },
      eventType: 'addToCart',
      customer: {
        id: 'testcustomer',
        area: 'area'
      },
      visit: {
        customerData: {
          visitorId: 'visitor',
          sessionId: 'session'
        },
        generated: {
          uri: '',
          timezoneOffset: 240,
          localTime: '2016-08-14T14:05:26.872Z'
        }
      }
    };

    const gbTracker = new window.GbTracker(expectedEvent.customer.id, expectedEvent.customer.area);

    gbTracker.setInvalidEventCallback(() => {
      done('fail');
    });

    gbTracker.__private.sendEvent = (event) => {
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
      cart: expectedEvent.cart
    });

  });
});
