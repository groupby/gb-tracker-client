const chai   = require('chai');
const expect = chai.expect;
const diff   = require('deep-diff').diff;
var LZString = require('lz-string/libs/lz-string.min.js');

window                = false;
document              = false;
navigator             = {};
navigator.appCodeName = 'Microsoft Internet Explorer';
navigator.userAgent   = 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)';

const GbTrackerCore = require('../lib/gb-tracker-core');

var thisDoc = document;

describe('gb-tracker-core tests', ()=> {

  it('should return the fields not present on the sanitised object', ()=> {
    const gbTrackerCore               = new GbTrackerCore('testcustomer', 'area');
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

  it('should throw if invalid callback is set to not a function', () => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');
    expect(() => gbTrackerCore.setInvalidEventCallback('')).to.throw();
    expect(() => gbTrackerCore.setInvalidEventCallback(null)).to.throw();
    expect(() => gbTrackerCore.setInvalidEventCallback()).to.throw();
    expect(() => gbTrackerCore.setInvalidEventCallback(9)).to.throw();
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

    expect(() => gbTrackerCore.sendAddToCartEvent({})).to.throw(/visitor/);
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

        expect(event).to.eql({
          session: {
            newVisitorId: sessionChangeEvent.previousVisitorId,
            newSessionId: sessionChangeEvent.previousSessionId
          }
        });

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

        expect(event).to.eql({
          session: {
            newVisitorId: sessionChangeEvent.previousVisitorId,
            newSessionId: sessionChangeEvent.previousSessionId
          }
        });

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
    const gbTrackerCore               = new GbTrackerCore('testcustomer', 'area');
    gbTrackerCore.__private.sendEvent = (event) => {};

    gbTrackerCore.setVisitor(7, 5);
    const visit = gbTrackerCore.__private.getVisitor();
    expect(visit.customerData.visitorId).to.eql('7');
    expect(visit.customerData.sessionId).to.eql('5');
  });

  it('should validate valid event', () => {
    const gbTrackerCore               = new GbTrackerCore('testcustomer', 'area');
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

    expect(validated.event.thing).to.eql('yo');
    expect(validated.event.anotherThing).to.eql(190);
    expect(validated.event.extraThing).to.be.undefined;
    expect(validated.event.visit.generated.timezoneOffset).to.not.be.undefined;
  });

  it('throws during validation if strictMode is on and there are extra fields in event', () => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');
    gbTrackerCore.setStrictMode(true);

    const validationSchema = {
      type:       'object',
      strict:     true,
      properties: {
        eventType:    {
          type: 'string'
        },
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
        eventType:    {},
        thing:        {},
        anotherThing: {}
      }
    };

    const schemas = {
      validation:   validationSchema,
      sanitization: sanitizationSchema
    };

    const event = {
      eventType:    'eventType',
      thing:        'string',
      anotherThing: 190,
      extraThing:   {
        subExtra: 'fo sho'
      }
    };

    expect(() => gbTrackerCore.__private.validateEvent(event, schemas)).to.throw('Unexpected fields ["extraThing"] in eventType: eventType');
  });

  it('should drop an invalid event', () => {
    const gbTrackerCore               = new GbTrackerCore('testcustomer', 'area');
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

    expect(invalidated.event).to.eql(null);
    expect(invalidated.error).to.eql('Property @.thing: must be string, but is object');
  });

  it('should sendEvent using sendSegment', (done) => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    const sendSegment = (segment) => {
      expect(segment.segment).to.eql(LZString.compressToEncodedURIComponent(JSON.stringify(event)));
      expect(segment.id).to.eql(0);
      expect(segment.total).to.eql(1);
      expect(segment.clientVersion).to.not.be.undefined;
      expect(segment.uuid).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      done();
    };

    const event = {
      first:  'this',
      second: 'that'
    };

    gbTrackerCore.__private.sendEvent(event, sendSegment);
  });

  // it('should attach eventListeners for mozilla', () => {
  //   const eventListener          = {};
  //   thisDoc.removeEventListener = (type) => {
  //     delete eventListener[type];
  //   };
  //
  //   thisDoc.addEventListener = (type, listener) => {
  //     eventListener[type] = listener;
  //   };
  //
  //
  //   expect(Object.keys(eventListener).length).to.eql(0);
  //   const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');
  //   expect(Object.keys(eventListener).length).to.eql(1);
  // });
});