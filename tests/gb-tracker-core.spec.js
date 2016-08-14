const chai   = require('chai');
const expect = chai.expect;
var diff     = require('deep-diff').diff;
var Events   = require('../../common/models/events');

window                = false;
document              = false;
navigator             = {};
navigator.appCodeName = 'Microsoft Internet Explorer';
navigator.userAgent   = 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)';

const GbTrackerCore = require('../lib/gb-tracker-core');

describe('gb-tracker-core tests', ()=> {

  it('should return the fields not present on the sanitised object', ()=> {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');
    gbTrackerCore.__private.sendEvent = (event) => {};
    gbTrackerCore.setVisitor('visitor', 'session');

    const first = {
      thing:  'soomething',
      ignore: 'not a thing'
    };

    const second = {
      thing:        'soomething',
      anExtraThing: 'yo',
      deep:         {
        manyExtraThings: 'fo sho'
      }
    };

    const removedFields = gbTrackerCore.__private.getRemovedFields(first, second);

    expect(removedFields).to.eql([
      'anExtraThing',
      'deep'
    ]);
  });

  it('should throw if customerId is not a string with lenght', () => {
    expect(() => new GbTrackerCore(null, 'default')).to.throw(/customerId/);
    expect(() => new GbTrackerCore('', 'default')).to.throw(/customerId/);
    expect(() => new GbTrackerCore({}, 'default')).to.throw(/customerId/);
    expect(() => new GbTrackerCore(7, 'default')).to.throw(/customerId/);
    expect(() => new GbTrackerCore([], 'default')).to.throw(/customerId/);
  });

  it('should require that visitor information is set before events are sent', () => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    expect(() => gbTrackerCore.sendAddToBasketEvent({})).to.throw(/visitor/);
  });

  it('should validate input to setVisitor', () => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    expect(() => gbTrackerCore.setVisitor(null, 'session')).to.throw(/visitor/);
    expect(() => gbTrackerCore.setVisitor('', 'session')).to.throw(/visitor/);
    expect(() => gbTrackerCore.setVisitor({}, 'session')).to.throw(/visitor/);
    expect(() => gbTrackerCore.setVisitor([], 'session')).to.throw(/visitor/);

    expect(() => gbTrackerCore.setVisitor('visitor', null)).to.throw(/session/);
    expect(() => gbTrackerCore.setVisitor('visitor', '')).to.throw(/session/);
    expect(() => gbTrackerCore.setVisitor('visitor', {})).to.throw(/session/);
    expect(() => gbTrackerCore.setVisitor('visitor', [])).to.throw(/session/);
  });

  it('should send visitor event when the visitor is set', (done) => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    const sessionChangeEvent = {
      previousVisitorId: 'prevVisitor',
      previousSessionId: 'prevSession',
      newVisitorId:      'newVisitor',
      newSessionId:      'newSession'
    };

    let firstCall = true;

    gbTrackerCore.__private.sendSessionChangeEvent = (event) => {
      if (firstCall) {
        firstCall = false;

        expect(event).to.eql({session: {
          newVisitorId: sessionChangeEvent.previousVisitorId,
          newSessionId: sessionChangeEvent.previousSessionId
        }});

        gbTrackerCore.setVisitor(sessionChangeEvent.newVisitorId, sessionChangeEvent.newSessionId);
      } else {
        expect(event).to.eql({session: sessionChangeEvent});
        done();
      }
    };

    gbTrackerCore.setVisitor(sessionChangeEvent.previousVisitorId, sessionChangeEvent.previousSessionId);
  });

  it('should NOT send visitor event when the visitor is set but not changed', (done) => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    const sessionChangeEvent = {
      previousVisitorId: 'prevVisitor',
      previousSessionId: 'prevSession',
      newVisitorId:      'prevVisitor', // New same as previous
      newSessionId:      'prevSession'
    };

    let firstCall = true;

    gbTrackerCore.__private.sendSessionChangeEvent = (event) => {
      if (firstCall) {
        firstCall = false;

        expect(event).to.eql({session: {
          newVisitorId: sessionChangeEvent.previousVisitorId,
          newSessionId: sessionChangeEvent.previousSessionId
        }});

        gbTrackerCore.setVisitor(sessionChangeEvent.newVisitorId, sessionChangeEvent.newSessionId);
      } else {
        done('fail');
      }
    };

    gbTrackerCore.setVisitor(sessionChangeEvent.previousVisitorId, sessionChangeEvent.previousSessionId);

    // Just needs to allow a couple clock cycles to see if sendSessionChangeEvent is called again
    setTimeout(() => done(), 2);
  });

  it('should allow visitor or session IDs as numbers and coerce to strings', () => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');
    gbTrackerCore.__private.sendEvent = (event) => {};

    gbTrackerCore.setVisitor(7, 5);
    const visit = gbTrackerCore.__private.getVisitor();
    expect(visit.customerData.visitorId).to.eql('7');
    expect(visit.customerData.sessionId).to.eql('5');
  });

  it('should validate valid event', () => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');
    gbTrackerCore.__private.sendEvent = (event) => {};
    gbTrackerCore.setVisitor('visitor', 'session');

    const validationSchema = {
      type:       'object',
      strict:     true,
      properties: {
        thing:        {
          type: 'string'
        },
        anotherThing: {
          type: 'integer'
        }
      }
    };

    const sanitizationSchema = {
      strict:     true,
      properties: {
        thing:        {},
        anotherThing: {}
      }
    };

    const schemas = {
      validation:   validationSchema,
      sanitization: sanitizationSchema
    };

    const event = {
      thing:        'yo',
      anotherThing: 190,
      extraThing:   {
        subExtra: 'fo sho'
      }
    };

    const validated = gbTrackerCore.__private.validateEvent(event, schemas);

    expect(validated.thing).to.eql('yo');
    expect(validated.anotherThing).to.eql(190);
    expect(validated.additionalMetadata).to.be.undefined;
    expect(validated.visit.generated.timezoneOffset).to.not.be.undefined;
  });

  it('should drop an invalid event', ()=> {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');
    gbTrackerCore.__private.sendEvent = (event) => {};
    gbTrackerCore.setVisitor('visitor', 'session');

    const validationSchema = {
      type:       'object',
      strict:     true,
      properties: {
        thing:        {
          type: 'string'
        },
        anotherThing: {
          type: 'integer'
        }
      }
    };

    const sanitizationSchema = {
      strict:     true,
      properties: {
        thing:        {},
        anotherThing: {}
      }
    };

    const schemas = {
      validation:   validationSchema,
      sanitization: sanitizationSchema
    };

    const event = {
      thing:        {
        shouldNotBeAnObject: 100
      },
      anotherThing: 190,
      extraThing:   {
        subExtra: 'fo sho'
      }
    };

    const invalidated = gbTrackerCore.__private.validateEvent(event, schemas);

    expect(invalidated).to.eql(null);
  });

  it('should accept valid addToBasket event', (done) => {
    const expectedEvent = {
      product: {
        id: 'asdfasd',
        category: 'boats',
        collection: 'kayaksrus',
        title: 'kayak',
        sku: 'asdfasf98',
        qty: 10,
        price: 100.21
      },
      eventType: 'addToBasket',
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

    const gbTrackerCore = new GbTrackerCore(expectedEvent.customer.id, expectedEvent.customer.area);

    gbTrackerCore.setInvalidEventCallback(() => {
      done('fail');
    });

    gbTrackerCore.__private.sendEvent = (event) => {
      if (event.eventType === Events.SessionChange.NAME) {
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

    gbTrackerCore.sendAddToBasketEvent({
      product: expectedEvent.product
    });
  });

  it('should reject invalid addToBasket event', (done) => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    gbTrackerCore.__private.sendEvent = (event) => {
      if (event.eventType === Events.SessionChange.NAME) {
        return;
      }

      done('fail');
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    const sendNotNested = () => {
      gbTrackerCore.setInvalidEventCallback(sendNoProductId);
      gbTrackerCore.sendAddToBasketEvent({
        id: 'asdfasd',
        category: 'boats',
        collection: 'kayaksrus',
        title: 'kayak',
        sku: 'asdfasf98',
        qty: 10,
        price: 100.21
      });
    };

    const sendNoProductId = () => {
      gbTrackerCore.setInvalidEventCallback(sendNoQty);
      gbTrackerCore.sendAddToBasketEvent({
        product: {
          // id: 'asdfasd',
          category: 'boats',
          collection: 'kayaksrus',
          title: 'kayak',
          sku: 'asdfasf98',
          qty: 10,
          price: 100.21
        }
      });
    };

    const sendNoQty = () => {
      gbTrackerCore.setInvalidEventCallback(sendNoPrice);
      gbTrackerCore.sendAddToBasketEvent({
        product: {
          id: 'asdfasd',
          category: 'boats',
          collection: 'kayaksrus',
          title: 'kayak',
          sku: 'asdfasf98',
          // qty: 10,
          price: 100.21
        }
      });
    };

    const sendNoPrice = () => {
      gbTrackerCore.setInvalidEventCallback(sendNoTitle);
      gbTrackerCore.sendAddToBasketEvent({
        product: {
          id: 'asdfasd',
          category: 'boats',
          collection: 'kayaksrus',
          title: 'kayak',
          sku: 'asdfasf98',
          qty: 10,
          // price: 100.21
        }
      });
    };

    const sendNoTitle = () => {
      gbTrackerCore.setInvalidEventCallback(sendNoCategory);
      gbTrackerCore.sendAddToBasketEvent({
        product: {
          id: 'asdfasd',
          category: 'boats',
          collection: 'kayaksrus',
          // title: 'kayak',
          sku: 'asdfasf98',
          qty: 10,
          price: 100.21
        }
      });
    };

    const sendNoCategory = () => {
      gbTrackerCore.setInvalidEventCallback(() => done());
      gbTrackerCore.sendAddToBasketEvent({
        product: {
          id: 'asdfasd',
          // category: 'boats',
          collection: 'kayaksrus',
          title: 'kayak',
          sku: 'asdfasf98',
          qty: 10,
          price: 100.21
        }
      });
    };

    sendNotNested();
  });
});