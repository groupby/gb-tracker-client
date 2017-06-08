const uuid      = require('uuid');
const diff      = require('deep-diff').diff;
const inspector = require('schema-inspector');
const utils     = require('./utils');
const LZString  = require('lz-string/libs/lz-string.min.js');

const VERSION = require('../package.json').version;
let Cookies   = require('cookies-js');

const SCHEMAS = {
  addToCart:           require('../schemas/addToCart'),
  viewCart:            require('../schemas/viewCart'),
  removeFromCart:      require('../schemas/removeFromCart'),
  order:               require('../schemas/order'),
  autoSearch:          require('../schemas/autoSearch'),
  autoMoreRefinements: require('../schemas/autoMoreRefinements'),
  search:              require('../schemas/search'),
  sessionChange:       require('../schemas/sessionChange'),
  viewProduct:         require('../schemas/viewProduct')
};

// Info on path length limitations: http://stackoverflow.com/a/812962
const MAX_PATH_LENGTH     = 4000; // Thanks NGINX
const MAX_PATHNAME_LENGTH = 100; // '/v2/pixel/?random=0.5405421565044588&m=' plus extra for luck
const MAX_SEGMENT_COUNT   = 100;
const VISITOR_TIMEOUT_SEC = 60 * 60 * 24 * 365 * 10;

let overridenPixelUrl = null;

const SET_FROM_COOKIES     = 'setFromCookies';
const NOT_SET_FROM_COOKIES = 'notSetFromCookies';
const SESSION_TIMEOUT_SEC  = 15 * 60;
const SESSION_COOKIE_KEY   = 'gbi_sessionId';
const VISITOR_COOKIE_KEY   = 'gbi_visitorId';
const DEBUG_COOKIE_KEY     = 'gbi_debug';

const Tracker = function (customerId, area, overridePixelUrl) {
  const self               = this;
  const customer           = {};
  const visit              = {customerData: {}};
  let invalidEventCallback = null;
  let strictMode           = false;
  overridenPixelUrl        = overridePixelUrl || '';
  let disableWarnings      = false;

  let visitorSettingsSource = null;

  const MAX_QUERY_STRING_LENGTH = MAX_PATH_LENGTH - MAX_PATHNAME_LENGTH;

  const IGNORED_FIELD_PREFIXES = [
    'search.records.[].allMeta',
    'search.template.zones'
  ];

  if (typeof customerId !== 'string' || customerId.length === 0) {
    throw new Error('customerId must be a string with length');
  } else {
    customer.id = customerId;
  }

  if (typeof area === 'string' && area.length > 0) {
    customer.area = area;
  }

  self.disableWarnings = () => {
    disableWarnings = true;
  };

  self.enableWarnings = () => {
    disableWarnings = false;
  };

  /**
   * Update visitor and session id's during login/logout
   * @param visitorId
   * @param sessionId
   */
  self.setVisitor = (visitorId, sessionId) => {
    if (visitorSettingsSource && visitorSettingsSource !== NOT_SET_FROM_COOKIES) {
      console.log('visitorId and sessionId already set using autoSetVisitor(). Ignoring setVisitor()');
      return;
    }

    visitorSettingsSource = NOT_SET_FROM_COOKIES;

    visitorId = (visitorId && typeof visitorId === 'number') ? (`${visitorId }`) : visitorId;
    sessionId = (sessionId && typeof sessionId === 'number') ? (`${sessionId }`) : sessionId;

    if (typeof visitorId !== 'string' || visitorId.length === 0) {
      throw new Error('visitorId must be a string with length');
    }

    if (typeof sessionId !== 'string' || sessionId.length === 0) {
      throw new Error('sessionId must be a string with length');
    }

    const prevVisitorId = visit.customerData.visitorId;
    const prevSessionId = visit.customerData.sessionId;

    visit.customerData.visitorId = visitorId;
    visit.customerData.sessionId = sessionId;

    if ((prevVisitorId && prevVisitorId !== visitorId) || (prevSessionId && prevSessionId !== sessionId)) {
      const sessionEvent = {
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
   * Initialize visitor data from cookies, or create those cookies if they do not exist
   * @param loginId
   */
  self.autoSetVisitor = (loginId) => {
    if (visitorSettingsSource && visitorSettingsSource !== SET_FROM_COOKIES) {
      console.log('visitorId and sessionId already set using setVisitor(). Overriding setVisitor()');
    }

    if (loginId && typeof loginId !== 'string') {
      throw new Error('if loginId is provided, it must be a string');
    }

    visitorSettingsSource = SET_FROM_COOKIES;

    if (loginId && loginId.length > 0) {
      visit.customerData.loginId = loginId;
    } else {
      delete visit.customerData.loginId;
    }

    visit.customerData.sessionId = Cookies.get(SESSION_COOKIE_KEY);
    visit.customerData.visitorId = Cookies.get(VISITOR_COOKIE_KEY);

    if (!visit.customerData.sessionId || visit.customerData.sessionId.length < 1) {
      visit.customerData.sessionId = uuid.v4();
      Cookies.set(SESSION_COOKIE_KEY, visit.customerData.sessionId, {expires: SESSION_TIMEOUT_SEC});
    }

    if (!visit.customerData.visitorId || visit.customerData.visitorId.length < 1) {
      visit.customerData.visitorId = uuid.v4();
    }
    Cookies.set(VISITOR_COOKIE_KEY, visit.customerData.visitorId, {expires: VISITOR_TIMEOUT_SEC});
  };

  self.getVisitorId = () => visit.customerData.visitorId;
  self.getSessionId = () => visit.customerData.sessionId;
  self.getLoginId   = () => visit.customerData.loginId;

  self.setStrictMode = (strict) => {
    strictMode = strict;
  };

  /**
   * Append eventType, customer, and visit to event
   * @param event
   * @param type
   */
  const prepareEvent = (event, type) => {
    // Continuously initialize visitor info in order to keep sessionId from expiring
    if (visitorSettingsSource === SET_FROM_COOKIES) {
      self.autoSetVisitor(visit.customerData.loginId);
    }

    if (visit.customerData.sessionId == null || visit.customerData.visitorId == null) {
      throw new Error('call autoSetVisitor() at least once before an event is sent');
    }

    event.clientVersion = {raw: VERSION};
    event.eventType     = type;
    event.customer      = customer;
    event.visit         = visit;
    return event;
  };

  /**
   * Set callback to be notified of invalid events
   * @param callback
   */
  self.setInvalidEventCallback = (callback) => {
    if (typeof callback !== 'function') {
      throw new Error('invalid event callback must be a function');
    }

    invalidEventCallback = callback;
  };

  /**
   * Validate and send addToCart event
   * @param event
   */
  self.sendAddToCartEvent = (event) => self.__private.prepareAndSendEvent(event, 'addToCart');

  /**
   * Validate and send viewCart event
   * @param event
   */
  self.sendViewCartEvent = (event) => self.__private.prepareAndSendEvent(event, 'viewCart');

  /**
   * Validate and send removeFromCart event
   * @param event
   */
  self.sendRemoveFromCartEvent = (event) => self.__private.prepareAndSendEvent(event, 'removeFromCart');

  /**
   * Validate and send order event
   * @param event
   */
  self.sendOrderEvent = (event) => self.__private.prepareAndSendEvent(event, 'order');

  /**
   * Validate and send search event
   * @param event
   */
  self.sendSearchEvent = (event) => self.__private.prepareAndSendEvent(event, 'search');

  /**
   * Validate and send search event
   * @param event
   */
  self.sendAutoSearchEvent = (event) => self.__private.prepareAndSendEvent(event, 'autoSearch');

  /**
   * Validate and send moreRefinements event
   * @param event
   */
  self.sendAutoMoreRefinementsEvent = (event) => self.__private.prepareAndSendEvent(event, 'autoMoreRefinements');

  /**
   * Validate and send viewProduct event
   * @param event
   */
  self.sendViewProductEvent = (event) => self.__private.prepareAndSendEvent(event, 'viewProduct');

  self.__private = {};

  /**
   * Helper to prepare, validate, and send event
   * @param event
   * @param eventType
   */
  self.__private.prepareAndSendEvent = (event, eventType) => {
    event           = prepareEvent(event, eventType);
    const validated = self.__private.validateEvent(event, SCHEMAS[eventType]);
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
  self.__private.getVisitor = () => visit;

  /**
   * Validate and send session change event
   * @param event
   */
  self.__private.sendSessionChangeEvent = (event) => self.__private.prepareAndSendEvent(event, 'sessionChange');

  /**
   * Based on the schema provided, validate an event for sending to the tracker endpoint
   * @param event
   * @param schemas
   */
  self.__private.validateEvent = (event, schemas) => {
    const sanitizedEvent = utils.deepCopy(event);
    inspector.sanitize(schemas.sanitization, sanitizedEvent);
    const result = inspector.validate(schemas.validation, sanitizedEvent);

    if (!result.valid) {
      console.error(`error while processing event: ${ result.format()}`);
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

    const removedFields = self.__private.getRemovedFields(sanitizedEvent, event);

    if (removedFields.length > 0) {
      if (strictMode) {
        throw new Error(`Unexpected fields ${ JSON.stringify(removedFields) } in eventType: ${ sanitizedEvent.eventType}`);
      }

      if (!sanitizedEvent.metadata) {
        sanitizedEvent.metadata = [];
      }

      for (let i = 0; i < removedFields.length; i++) {
        if (!disableWarnings) {
          console.warn(`unexpected field: ${ removedFields[i] } is being dropped from eventType: ${ sanitizedEvent.eventType}`);
        }

        sanitizedEvent.metadata.push({
          key:   'gbi-field-warning',
          value: removedFields[i]
        });
      }
    }

    sanitizedEvent.visit.generated.uri            = (typeof window !== 'undefined' && window.location) ? window.location.href : '';
    sanitizedEvent.visit.generated.timezoneOffset = new Date().getTimezoneOffset();
    sanitizedEvent.visit.generated.localTime      = new Date().toISOString();

    return {event: sanitizedEvent};
  };

  /**
   * Compared the sanitized event to the original, and return an object containing the properties that were removed.
   * @param sanitizedEvent
   * @param originalEvent
   * @returns {*}
   */
  self.__private.getRemovedFields = (sanitizedEvent, originalEvent) => {
    const allDifferences = diff(sanitizedEvent, originalEvent);
    let removedFields    = [];

    for (let i = 0; i < allDifferences.length; i++) {
      for (let j = 0; j < allDifferences[i].path.length; j++) {
        if (typeof allDifferences[i].path[j] === 'number') {
          // Remove array indices
          allDifferences[i].path[j] = '[]';
        }
      }

      if (allDifferences[i].kind === 'N') {
        const fieldName = allDifferences[i].path.join('.');

        if (!utils.startsWithOneOf(fieldName, IGNORED_FIELD_PREFIXES)) {
          removedFields.push(fieldName);
        }
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
  self.__private.sendEvent = (event, sendSegment) => {
    const eventString = JSON.stringify(event);
    const uuidString  = uuid.v4();

    const segmentTemplate = {
      uuid:          uuidString,
      id:            MAX_SEGMENT_COUNT,
      total:         MAX_SEGMENT_COUNT,
      customer:      event.customer,
      clientVersion: VERSION
    };

    const SEGMENT_WRAPPER_OVERHEAD = encodeURIComponent(JSON.stringify(segmentTemplate)).length;

    // Double encode here to account for double-encoding at the end
    const eventStringSegments = utils.chunkString(eventString, MAX_QUERY_STRING_LENGTH - SEGMENT_WRAPPER_OVERHEAD);

    if (eventStringSegments.length > MAX_SEGMENT_COUNT) {
      console.error(`cannot send: ${ eventStringSegments } event segments, as that exceeds the max of: ${ MAX_SEGMENT_COUNT}`);
      return;
    }

    if (window.DEBUG || Cookies.get(DEBUG_COOKIE_KEY)) {
      console.log(`Beaconing event: ${JSON.stringify(event, null, 2)}`);
    }

    for (let i = 0; i < eventStringSegments.length; i++) {
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
  self.__private.sendSegment = (segment) => {
    const host = `${document.location.protocol }//${ customerId }.groupbycloud.com`;
    let params = `?random\x3d${ Math.random()}`; // To bust the cache
    params += `&m=${ encodeURIComponent(JSON.stringify(segment))}`;

    const path = `/wisdom/v2/pixel/${ params}`;

    if (path.length > MAX_PATH_LENGTH) {
      console.error(`cannot send request with path exceeding max length of: ${ MAX_PATH_LENGTH } path is: ${ path.length}`);
      return;
    }

    const im = new Image();
    if (overridenPixelUrl && (typeof overridenPixelUrl === 'string') && overridenPixelUrl.length > 0) {
      im.src = overridenPixelUrl + params;
    } else {
      im.src = host + path;
    }
  };

  return self;
};

Tracker.__overrideCookiesLib = (cookies) => Cookies = cookies;
Tracker.__overridePixelPath = (path) => overridenPixelUrl = path;
Tracker.SESSION_COOKIE_KEY  = SESSION_COOKIE_KEY;
Tracker.VISITOR_COOKIE_KEY  = VISITOR_COOKIE_KEY;
Tracker.SESSION_TIMEOUT_SEC = SESSION_TIMEOUT_SEC;
Tracker.VERSION             = VERSION;
Tracker.VISITOR_TIMEOUT_SEC = VISITOR_TIMEOUT_SEC;

module.exports = Tracker;