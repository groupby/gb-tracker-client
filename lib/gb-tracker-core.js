var uuid      = require('uuid');
var diff      = require('deep-diff').diff;
var inspector = require('schema-inspector');
var utils     = require('./utils');
var LZString  = require('lz-string/libs/lz-string.min.js');

var VERSION = require('../package.json').version;

var SCHEMAS = {
  addToCart:     require('../schemas/addToCart'),
  order:         require('../schemas/order'),
  autoSearch:    require('../schemas/autoSearch'),
  search:        require('../schemas/search'),
  sessionChange: require('../schemas/sessionChange'),
  viewProduct:   require('../schemas/viewProduct')
};

// Info on path length limitations: http://stackoverflow.com/a/812962
var MAX_PATH_LENGTH     = 4000; // Thanks NGINX
var MAX_PATHNAME_LENGTH = 100; // '/v2/pixel/?random=0.5405421565044588&m=' plus extra for luck
var MAX_SEGMENT_COUNT   = 100;

var overridenPixelUrl = null;

var Tracker = function (customerId, area, overridePixelUrl) {
  var self                 = this;
  var customer             = {};
  var visit                = {customerData: {}};
  var invalidEventCallback = null;
  var strictMode           = false;
  overridenPixelUrl = overridePixelUrl || '';
  var disableWarnings      = false;

  var MAX_QUERY_STRING_LENGTH = MAX_PATH_LENGTH - MAX_PATHNAME_LENGTH;

  if (typeof customerId !== 'string' || customerId.length === 0) {
    throw new Error('customerId must be a string with length');
  } else {
    customer.id = customerId;
  }

  if (typeof area === 'string' && area.length > 0) {
    customer.area = area;
  }

  self.disableWarnings = function () {
    disableWarnings = true;
  };

  self.enableWarnings = function () {
    disableWarnings = false;
  };

  /**
   * Update visitor and session id's during login/logout
   * @param visitorId
   * @param sessionId
   */
  self.setVisitor = function (visitorId, sessionId) {
    visitorId = (visitorId && typeof visitorId === 'number') ? (visitorId + '') : visitorId;
    sessionId = (sessionId && typeof sessionId === 'number') ? (sessionId + '') : sessionId;

    if (typeof visitorId !== 'string' || visitorId.length === 0) {
      throw new Error('visitorId must be a string with length');
    }

    if (typeof sessionId !== 'string' || sessionId.length === 0) {
      throw new Error('sessionId must be a string with length');
    }

    var prevVisitorId = visit.customerData.visitorId;
    var prevSessionId = visit.customerData.sessionId;

    visit.customerData.visitorId = visitorId;
    visit.customerData.sessionId = sessionId;

    if ((prevVisitorId && prevVisitorId !== visitorId) || (prevSessionId && prevSessionId !== sessionId)) {
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

  self.setStrictMode = function (strict) {
    strictMode = strict;
  };

  /**
   * Append eventType, customer, and visit to event
   * @param event
   * @param type
   */
  var prepareEvent = function (event, type) {
    if (visit.customerData.sessionId == null || visit.customerData.visitorId == null) {
      throw new Error('visitorId and sessionId must be set using setVisitor() before an event is sent');
    }

    event.clientVersion = {raw: VERSION};
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
   * Validate and send addToCart event
   * @param event
   */
  self.sendAddToCartEvent = function (event) {
    self.__private.prepareAndSendEvent(event, 'addToCart');
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
    // Move search.id to the event object
    if (event && event.search && event.search.id && !event.responseId) {
      event.responseId = event.search.id;
      delete event.search.id;
    }

    self.__private.prepareAndSendEvent(event, 'search');
  };

  /**
   * Validate and send search event
   * @param event
   */
  self.sendAutoSearchEvent = function (event) {
    self.__private.prepareAndSendEvent(event, 'autoSearch');
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
      return {
        event: null,
        error: result.format()
      };
    }

    if (!sanitizedEvent.visit) {
      sanitizedEvent.visit = {};
    }

    if (!sanitizedEvent.visit.generated) {
      sanitizedEvent.visit.generated = {};
    }

    var removedFields = self.__private.getRemovedFields(sanitizedEvent, event);

    if (removedFields.length > 0) {
      if (strictMode) {
        throw new Error('Unexpected fields ' + JSON.stringify(removedFields) + ' in eventType: ' + sanitizedEvent.eventType);
      }

      if (!sanitizedEvent.metadata) {
        sanitizedEvent.metadata = [];
      }

      for (var i = 0; i < removedFields.length; i++) {
        if (!disableWarnings) {
          console.warn('unexpected field: ' + removedFields[i] + ' is being dropped from eventType: ' + sanitizedEvent.eventType);
        }

        sanitizedEvent.metadata.push({
          key:   'gbi-field-warning',
          value: removedFields[i]
        });
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
      for (var j = 0; j < allDifferences[i].path.length; j++) {
        if (typeof allDifferences[i].path[j] === 'number') {
          // Remove array indices
          allDifferences[i].path[j] = '[]';
        }
      }
      
      if (allDifferences[i].kind === 'N') {
        removedFields.push(allDifferences[i].path.join('.'));
      }
    }

    removedFields = utils.getUnique(removedFields);

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
      uuid:          uuidString,
      id:            MAX_SEGMENT_COUNT,
      total:         MAX_SEGMENT_COUNT,
      customer:      event.customer,
      clientVersion: VERSION
    };

    var SEGMENT_WRAPPER_OVERHEAD = encodeURIComponent(JSON.stringify(segmentTemplate)).length;

    // Double encode here to account for double-encoding at the end
    var eventStringSegments = utils.chunkString(eventString, MAX_QUERY_STRING_LENGTH - SEGMENT_WRAPPER_OVERHEAD);

    if (eventStringSegments.length > MAX_SEGMENT_COUNT) {
      console.error('cannot send: ' + eventStringSegments + ' event segments, as that exceeds the max of: ' + MAX_SEGMENT_COUNT);
      return;
    }

    if (window.DEBUG) {
      // eslint-disable-next-line
      console.log('Beaconing event: ' + JSON.stringify(event, null, 2));
    }

    for (var i = 0; i < eventStringSegments.length; i++) {
      sendSegment({
        uuid:          uuidString,
        segment:       LZString.compressToEncodedURIComponent(eventStringSegments[i]), // To prevent double-encoding, it'll be re-encoded before sending
        id:            i,
        total:         eventStringSegments.length,
        customer:      event.customer,
        clientVersion: VERSION
      });
    }
  };

  /**
   * Use pixel endpoint to upload string to event-tracker
   * @param segment
   */
  self.__private.sendSegment = function (segment) {
    var host   = document.location.protocol + '//' + customerId + '.groupbycloud.com';
    var params = '?random\x3d' + Math.random(); // To bust the cache
    params += '&m=' + encodeURIComponent(JSON.stringify(segment));

    var path = '/wisdom/v2/pixel/' + params;

    if (path.length > MAX_PATH_LENGTH) {
      console.error('cannot send request with path exceeding max length of: ' + MAX_PATH_LENGTH + ' path is: ' + path.length);
      return;
    }

    var im = new Image();
    if (overridenPixelUrl && (typeof overridenPixelUrl === 'string') && overridenPixelUrl.length > 0) {
      im.src = overridenPixelUrl + params;
    } else {
      im.src = host + path;
    }
  };

};

Tracker.__overridePixelPath = function (path) {
  overridenPixelUrl = path;
};

module.exports = Tracker;