var uuid      = require('uuid');
var diff      = require('deep-diff').diff;
var inspector = require('schema-inspector');
var utils = require('./utils');

var SCHEMAS = {
  addToBasket: {
    validation:   require('../schemas/validation/addToBasket.json'),
    sanitization: require('../schemas/sanitization/addToBasket.json')
  },
  navigation: {
    validation:   require('../schemas/validation/navigation.json'),
    sanitization: require('../schemas/sanitization/navigation.json')
  },
  order: {
    validation:   require('../schemas/validation/order.json'),
    sanitization: require('../schemas/sanitization/order.json')
  },
  searchWithId: {
    validation:   require('../schemas/validation/searchWithId.json'),
    sanitization: require('../schemas/sanitization/searchWithId.json')
  },
  searchWithoutId: {
    validation:   require('../schemas/validation/searchWithoutId.json'),
    sanitization: require('../schemas/sanitization/searchWithoutId.json')
  },
  sessionChange: {
    validation:   require('../schemas/validation/sessionChange.json'),
    sanitization: require('../schemas/sanitization/sessionChange.json')
  },
  viewProduct: {
    validation:   require('../schemas/validation/viewProduct.json'),
    sanitization: require('../schemas/sanitization/viewProduct.json')
  }
};

// Info on path length limitations: http://stackoverflow.com/a/812962
var MAX_IE_PATH_LENGTH    = 2048; // Thanks IE
var MAX_OTHER_PATH_LENGTH = 80000; // Thanks Microsoft Edge
var MAX_PATHNAME_LENGTH   = 100; // '/v2/pixel/?random=0.5405421565044588&m=' plus extra for luck
var MAX_SEGMENT_COUNT     = 100;

var overridenPixelPath = null;

var Tracker = function (customerId, area) {
  var self                 = this;
  var customer             = {};
  var visit                = {customerData: {}};
  var invalidEventCallback = null;

  var MAX_PATH_LENGTH         = (utils.getInternetExplorerVersion(navigator.appCodeName, navigator.userAgent) > -1) ? MAX_IE_PATH_LENGTH : MAX_OTHER_PATH_LENGTH;
  var MAX_QUERY_STRING_LENGTH = MAX_PATH_LENGTH - MAX_PATHNAME_LENGTH;

  if (typeof customerId !== 'string' || customerId.length === 0) {
    throw new Error('customerId must be a string with length');
  } else {
    customer.id = customerId;
  }

  if (typeof area === 'string' && area.length > 0) {
    customer.area = area;
  }

  /**
   * Update visitor and session id's during login/logout
   * @param visitorId
   * @param sessionId
   */
  self.setVisitor = function (visitorId, sessionId) {
    visitorId = (visitorId && typeof visitorId === 'number') ? (visitorId + '') : visitorId;
    sessionId = (sessionId && typeof sessionId === 'number') ? (sessionId + '') : sessionId;

    if (typeof visitorId !== 'string') {
      throw new Error('visitorId must be a string with length');
    }

    if (typeof sessionId !== 'string') {
      throw new Error('sessionId must be a string with length');
    }

    var prevVisitorId = visit.customerData.visitorId;
    var prevSessionId = visit.customerData.sessionId;

    visit.customerData.visitorId = visitorId;
    visit.customerData.sessionId = sessionId;

    if (prevVisitorId !== visitorId || prevSessionId !== sessionId) {
      var sessionEvent = {
        newSessionId: visit.customerData.sessionId,
        newVisitorId: visit.customerData.visitorId
      };

      // There may not be a previous session (initial site load)
      if (prevVisitorId) {
        sessionEvent.previousVisitorId = prevVisitorId;
        sessionEvent.previousSessionId = prevSessionId;
      }

      self.__private.sendSessionChangeEvent({session: sessionEvent});
    }
  };

  /**
   * Append eventType, customer, and visit to event
   * @param event
   * @param type
   */
  var prepareEvent = function (event, type) {
    if (!visit.customerData.sessionId || !visit.customerData.visitorId) {
      throw new Error('visitorId and sessionId must be set using setVisitor() before an event is sent');
    }

    event.eventType = type;
    event.customer = customer;
    event.visit = visit;
    return event;
  };


  /**
   * Set callback to be notified of invalid events
   * @param callback
   */
  self.setInvalidEventCallback = function (callback) {
    if (typeof callback !== 'function') {
      throw new Error('invalid event callback must be a function');
    }

    invalidEventCallback = callback;
  };

  /**
   * Validate and send addToBasket event
   * @param event
   */
  self.sendAddToBasketEvent = function (event) {
    self.__private.prepareAndSendEvent(event, 'addToBasket');
  };

  /**
   * Validate and send order event
   * @param event
   */
  self.sendOrderEvent = function (event) {
    self.__private.prepareAndSendEvent(event, 'order');
  };

  /**
   * Validate and send search event
   * @param event
   */
  self.sendSearchEvent = function (event) {
    if (event.searchId || (event.search && event.search.searchId)) {
      self.__private.prepareAndSendEvent(event, 'searchWithId');
    } else {
      self.__private.prepareAndSendEvent(event, 'searchWithoutId');
    }
  };

  /**
   * Validate and send viewProduct event
   * @param event
   */
  self.sendViewProductEvent = function (event) {
    self.__private.prepareAndSendEvent(event, 'viewProduct');
  };

  self.__private = {};

  /**
   * Helper to prepare, validate, and send event
   * @param event
   * @param eventType
   */
  self.__private.prepareAndSendEvent = function (event, eventType) {
    event = prepareEvent(event, eventType);
    var validated = self.__private.validateEvent(event, SCHEMAS[eventType]);
    if (validated && validated.event) {
      self.__private.sendEvent(validated.event, self.__private.sendSegment);
    } else {
      invalidEventCallback && invalidEventCallback(event, validated.error);
    }
  };

  /**
   * Visitor getter for testing
   * @returns {{customerData: {}}}
   */
  self.__private.getVisitor = function () {
    return visit;
  };

  /**
   * Attach navigation listeners for page enter/leave and hash changes
   */
  self.__private.attachNavigationListeners = function () {
    if (!window || !document) {
      console.warn('no window or document object found, cannot attach navigation listeners');
      return;
    }

    // Mozilla, Opera, Webkit
    if (document.addEventListener) {
      document.addEventListener('DOMContentLoaded', function () {
        document.removeEventListener('DOMContentLoaded', arguments.callee, false);
        self.__private.sendNavigationEvent({
          navigation: {
            type:       'enter',
            exactEvent: 'DOMContentLoaded'
          }
        });
      }, false);

      // If IE event model is used
    } else if (document.attachEvent) {
      // ensure firing before onload
      document.attachEvent('onreadystatechange', function () {
        if (document.readyState === 'complete') {
          document.detachEvent('onreadystatechange', arguments.callee);
          self.__private.sendNavigationEvent({
            navigation: {
              type:       'enter',
              exactEvent: 'onreadystatechange'
            }
          });
        }
      });
    }

    // exit if the browser implements that event
    if (window.addEventListener) {
      window.addEventListener('hashchange', function () {
        self.__private.sendNavigationEvent({
          navigation: {
            type:       'hashchange',
            exactEvent: 'hashchange'
          }
        });
      });
    }
  };

  self.__private.attachNavigationListeners();

  /**
   * Validate and send navigation event
   * @param event
   */
  self.__private.sendNavigationEvent = function (event) {
    self.__private.prepareAndSendEvent(event, 'navigation');
  };

  /**
   * Validate and send session change event
   * @param event
   */
  self.__private.sendSessionChangeEvent = function (event) {
    self.__private.prepareAndSendEvent(event, 'sessionChange');
  };

  /**
   * Based on the schema provided, validate an event for sending to the tracker endpoint
   * @param event
   * @param schemas
   */
  self.__private.validateEvent = function (event, schemas) {
    var sanitizedEvent = utils.deepCopy(event);
    inspector.sanitize(schemas.sanitization, sanitizedEvent);
    var result = inspector.validate(schemas.validation, sanitizedEvent);

    if (!result.valid) {
      console.error('error while processing event: ' + result.format());
      return {event: null, error: result.format()};
    }

    if (!sanitizedEvent.visit) {
      sanitizedEvent.visit = {};
    }

    if (!sanitizedEvent.visit.generated) {
      sanitizedEvent.visit.generated = {};
    }

    var removedFields = self.__private.getRemovedFields(sanitizedEvent, event);

    if (removedFields.length > 0) {
      for (var i = 0; i < removedFields.length; i++) {
        console.warn('unexpected field: ' + removedFields[i] + ' is being dropped from eventType: ' + sanitizedEvent.eventType);
      }
    }

    sanitizedEvent.visit.generated.uri = (typeof window !== 'undefined' && window.location) ? window.location.href : '';
    sanitizedEvent.visit.generated.timezoneOffset = new Date().getTimezoneOffset();
    sanitizedEvent.visit.generated.localTime = new Date().toISOString();

    return {event: sanitizedEvent};
  };

  /**
   * Compared the sanitized event to the original, and return an object containing the properties that were removed.
   * @param sanitizedEvent
   * @param originalEvent
   * @returns {*}
   */
  self.__private.getRemovedFields = function (sanitizedEvent, originalEvent) {
    var allDifferences = diff(sanitizedEvent, originalEvent);
    var removedFields  = [];

    for (var i = 0; i < allDifferences.length; i++) {
      if (allDifferences[i].kind === 'N') {
        removedFields.push(allDifferences[i].path.join('.'));
      }
    }

    return removedFields;
  };

  /**
   * Take event, convert to string, split by max length, and send along with uuid and customer info
   * @param event
   * @param sendSegment
   */
  self.__private.sendEvent = function (event, sendSegment) {
    var eventString = JSON.stringify(event);
    var uuidString  = uuid.v4();

    var segmentTemplate = {
      uuid:     uuidString,
      id:       MAX_SEGMENT_COUNT,
      total:    MAX_SEGMENT_COUNT,
      customer: event.customer
    };

    var SEGMENT_WRAPPER_OVERHEAD = encodeURIComponent(JSON.stringify(segmentTemplate)).length;
    var eventStringSegments      = utils.chunkString(encodeURIComponent(eventString), MAX_QUERY_STRING_LENGTH - SEGMENT_WRAPPER_OVERHEAD);

    if (eventStringSegments.length > MAX_SEGMENT_COUNT) {
      console.error('cannot send: ' + eventStringSegments + ' event segments, as that exceeds the max of: ' + MAX_SEGMENT_COUNT);
      return;
    }

    for (var i = 0; i < eventStringSegments.length; i++) {
      sendSegment({
        uuid:     uuidString,
        segment:  decodeURIComponent(eventStringSegments[i]), // To prevent double-encoding, it'll be re-encoded before sending
        id:       i,
        total:    eventStringSegments.length,
        customer: event.customer
      });
    }
  };

  /**
   * Use pixel endpoint to upload string to event-tracker
   * @param segment
   */
  self.__private.sendSegment = function (segment) {
    var protocol = 'https:' == document.location.protocol ? 'https://tracker-secure' : 'http://tracker';
    var host     = protocol + '.groupbycloud.com';
    var params   = '?random\x3d' + Math.random(); // To bust the cache
    params += '&m=' + encodeURIComponent(JSON.stringify(segment));

    var path = '/v2/pixel/' + params;

    if (path.length > MAX_PATH_LENGTH) {
      console.error('cannot send request with path exceeding max length of: ' + MAX_PATH_LENGTH + ' path is: ' + path.length);
      return;
    }

    var im = new Image();
    if (!overridenPixelPath) {
      im.src = host + path;
    } else {
      im.src = overridenPixelPath + params;
    }
  };

};

Tracker.__overridePixelPath = function (path) {
  overridenPixelPath = path;
};

module.exports = Tracker;