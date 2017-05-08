module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var uuid = __webpack_require__(2);
	var diff = __webpack_require__(8).diff;
	var inspector = __webpack_require__(9);
	var utils = __webpack_require__(12);
	var LZString = __webpack_require__(13);

	var VERSION = __webpack_require__(14).version;
	var Cookies = __webpack_require__(15);

	var SCHEMAS = {
	  addToCart: __webpack_require__(16),
	  viewCart: __webpack_require__(18),
	  removeFromCart: __webpack_require__(19),
	  order: __webpack_require__(20),
	  autoSearch: __webpack_require__(21),
	  search: __webpack_require__(22),
	  sessionChange: __webpack_require__(23),
	  viewProduct: __webpack_require__(24)
	};

	// Info on path length limitations: http://stackoverflow.com/a/812962
	var MAX_PATH_LENGTH = 4000; // Thanks NGINX
	var MAX_PATHNAME_LENGTH = 100; // '/v2/pixel/?random=0.5405421565044588&m=' plus extra for luck
	var MAX_SEGMENT_COUNT = 100;
	var VISITOR_TIMEOUT_SEC = 60 * 60 * 24 * 365 * 10;

	var overridenPixelUrl = null;

	var SET_FROM_COOKIES = 'setFromCookies';
	var NOT_SET_FROM_COOKIES = 'notSetFromCookies';
	var SESSION_TIMEOUT_SEC = 15 * 60;
	var SESSION_COOKIE_KEY = 'gbi_sessionId';
	var VISITOR_COOKIE_KEY = 'gbi_visitorId';
	var DEBUG_COOKIE_KEY = 'gbi_debug';

	var Tracker = function Tracker(customerId, area, overridePixelUrl) {
	  var self = this;
	  var customer = {};
	  var visit = { customerData: {} };
	  var invalidEventCallback = null;
	  var strictMode = false;
	  overridenPixelUrl = overridePixelUrl || '';
	  var disableWarnings = false;

	  var visitorSettingsSource = null;

	  var MAX_QUERY_STRING_LENGTH = MAX_PATH_LENGTH - MAX_PATHNAME_LENGTH;

	  var IGNORED_FIELD_PREFIXES = ['search.records.[].allMeta', 'search.template.zones'];

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
	    if (visitorSettingsSource && visitorSettingsSource !== NOT_SET_FROM_COOKIES) {
	      console.log('visitorId and sessionId already set using autoSetVisitor(). Ignoring setVisitor()');
	      return;
	    }

	    visitorSettingsSource = NOT_SET_FROM_COOKIES;

	    visitorId = visitorId && typeof visitorId === 'number' ? '' + visitorId : visitorId;
	    sessionId = sessionId && typeof sessionId === 'number' ? '' + sessionId : sessionId;

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

	    if (prevVisitorId && prevVisitorId !== visitorId || prevSessionId && prevSessionId !== sessionId) {
	      var sessionEvent = {
	        newSessionId: visit.customerData.sessionId,
	        newVisitorId: visit.customerData.visitorId
	      };

	      // There may not be a previous session (initial site load)
	      if (prevVisitorId) {
	        sessionEvent.previousVisitorId = prevVisitorId;
	        sessionEvent.previousSessionId = prevSessionId;
	      }

	      self.__private.sendSessionChangeEvent({ session: sessionEvent });
	    }
	  };

	  /**
	   * Initialize visitor data from cookies, or create those cookies if they do not exist
	   * @param loginId
	   */
	  self.autoSetVisitor = function (loginId) {
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
	      Cookies.set(SESSION_COOKIE_KEY, visit.customerData.sessionId, { expires: SESSION_TIMEOUT_SEC });
	    }

	    if (!visit.customerData.visitorId || visit.customerData.visitorId.length < 1) {
	      visit.customerData.visitorId = uuid.v4();
	    }
	    Cookies.set(VISITOR_COOKIE_KEY, visit.customerData.visitorId, { expires: VISITOR_TIMEOUT_SEC });
	  };

	  self.getVisitorId = function () {
	    return visit.customerData.visitorId;
	  };
	  self.getSessionId = function () {
	    return visit.customerData.sessionId;
	  };
	  self.getLoginId = function () {
	    return visit.customerData.loginId;
	  };

	  self.setStrictMode = function (strict) {
	    strictMode = strict;
	  };

	  /**
	   * Append eventType, customer, and visit to event
	   * @param event
	   * @param type
	   */
	  var prepareEvent = function prepareEvent(event, type) {
	    // Continuously initialize visitor info in order to keep sessionId from expiring
	    if (visitorSettingsSource === SET_FROM_COOKIES) {
	      self.autoSetVisitor(visit.customerData.loginId);
	    }

	    if (visit.customerData.sessionId == null || visit.customerData.visitorId == null) {
	      throw new Error('call autoSetVisitor() at least once before an event is sent');
	    }

	    event.clientVersion = { raw: VERSION };
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
	    return self.__private.prepareAndSendEvent(event, 'addToCart');
	  };

	  /**
	   * Validate and send viewCart event
	   * @param event
	   */
	  self.sendViewCartEvent = function (event) {
	    return self.__private.prepareAndSendEvent(event, 'viewCart');
	  };

	  /**
	   * Validate and send removeFromCart event
	   * @param event
	   */
	  self.sendRemoveFromCartEvent = function (event) {
	    return self.__private.prepareAndSendEvent(event, 'removeFromCart');
	  };

	  /**
	   * Validate and send order event
	   * @param event
	   */
	  self.sendOrderEvent = function (event) {
	    return self.__private.prepareAndSendEvent(event, 'order');
	  };

	  /**
	   * Validate and send search event
	   * @param event
	   */
	  self.sendSearchEvent = function (event) {
	    return self.__private.prepareAndSendEvent(event, 'search');
	  };

	  /**
	   * Validate and send search event
	   * @param event
	   */
	  self.sendAutoSearchEvent = function (event) {
	    return self.__private.prepareAndSendEvent(event, 'autoSearch');
	  };

	  /**
	   * Validate and send viewProduct event
	   * @param event
	   */
	  self.sendViewProductEvent = function (event) {
	    return self.__private.prepareAndSendEvent(event, 'viewProduct');
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
	    return self.__private.prepareAndSendEvent(event, 'sessionChange');
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
	          key: 'gbi-field-warning',
	          value: removedFields[i]
	        });
	      }
	    }

	    sanitizedEvent.visit.generated.uri = typeof window !== 'undefined' && window.location ? window.location.href : '';
	    sanitizedEvent.visit.generated.timezoneOffset = new Date().getTimezoneOffset();
	    sanitizedEvent.visit.generated.localTime = new Date().toISOString();

	    return { event: sanitizedEvent };
	  };

	  /**
	   * Compared the sanitized event to the original, and return an object containing the properties that were removed.
	   * @param sanitizedEvent
	   * @param originalEvent
	   * @returns {*}
	   */
	  self.__private.getRemovedFields = function (sanitizedEvent, originalEvent) {
	    var allDifferences = diff(sanitizedEvent, originalEvent);
	    var removedFields = [];

	    for (var i = 0; i < allDifferences.length; i++) {
	      for (var j = 0; j < allDifferences[i].path.length; j++) {
	        if (typeof allDifferences[i].path[j] === 'number') {
	          // Remove array indices
	          allDifferences[i].path[j] = '[]';
	        }
	      }

	      if (allDifferences[i].kind === 'N') {
	        var fieldName = allDifferences[i].path.join('.');

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
	  self.__private.sendEvent = function (event, sendSegment) {
	    var eventString = JSON.stringify(event);
	    var uuidString = uuid.v4();

	    var segmentTemplate = {
	      uuid: uuidString,
	      id: MAX_SEGMENT_COUNT,
	      total: MAX_SEGMENT_COUNT,
	      customer: event.customer,
	      clientVersion: VERSION
	    };

	    var SEGMENT_WRAPPER_OVERHEAD = encodeURIComponent(JSON.stringify(segmentTemplate)).length;

	    // Double encode here to account for double-encoding at the end
	    var eventStringSegments = utils.chunkString(eventString, MAX_QUERY_STRING_LENGTH - SEGMENT_WRAPPER_OVERHEAD);

	    if (eventStringSegments.length > MAX_SEGMENT_COUNT) {
	      console.error('cannot send: ' + eventStringSegments + ' event segments, as that exceeds the max of: ' + MAX_SEGMENT_COUNT);
	      return;
	    }

	    if (window.DEBUG || Cookies.get(DEBUG_COOKIE_KEY)) {
	      console.log('Beaconing event: ' + JSON.stringify(event, null, 2));
	    }

	    for (var i = 0; i < eventStringSegments.length; i++) {
	      sendSegment({
	        uuid: uuidString,
	        segment: LZString.compressToEncodedURIComponent(eventStringSegments[i]), // To prevent double-encoding, it'll be re-encoded before sending
	        id: i,
	        total: eventStringSegments.length,
	        customer: event.customer,
	        clientVersion: VERSION
	      });
	    }
	  };

	  /**
	   * Use pixel endpoint to upload string to event-tracker
	   * @param segment
	   */
	  self.__private.sendSegment = function (segment) {
	    var host = document.location.protocol + '//' + customerId + '.groupbycloud.com';
	    var params = '?random=' + Math.random(); // To bust the cache
	    params += '&m=' + encodeURIComponent(JSON.stringify(segment));

	    var path = '/wisdom/v2/pixel/' + params;

	    if (path.length > MAX_PATH_LENGTH) {
	      console.error('cannot send request with path exceeding max length of: ' + MAX_PATH_LENGTH + ' path is: ' + path.length);
	      return;
	    }

	    var im = new Image();
	    if (overridenPixelUrl && typeof overridenPixelUrl === 'string' && overridenPixelUrl.length > 0) {
	      im.src = overridenPixelUrl + params;
	    } else {
	      im.src = host + path;
	    }
	  };

	  return self;
	};

	Tracker.__overrideCookiesLib = function (cookies) {
	  return Cookies = cookies;
	};
	Tracker.__overridePixelPath = function (path) {
	  return overridenPixelUrl = path;
	};
	Tracker.SESSION_COOKIE_KEY = SESSION_COOKIE_KEY;
	Tracker.VISITOR_COOKIE_KEY = VISITOR_COOKIE_KEY;
	Tracker.SESSION_TIMEOUT_SEC = SESSION_TIMEOUT_SEC;
	Tracker.VERSION = VERSION;
	Tracker.VISITOR_TIMEOUT_SEC = VISITOR_TIMEOUT_SEC;

	module.exports = Tracker;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	var v1 = __webpack_require__(3);
	var v4 = __webpack_require__(7);

	var uuid = v4;
	uuid.v1 = v1;
	uuid.v4 = v4;

	module.exports = uuid;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	// Unique ID creation requires a high quality random # generator.  We feature
	// detect to determine the best RNG source, normalizing to a function that
	// returns 128-bits of randomness, since that's what's usually required
	var rng = __webpack_require__(4);
	var bytesToUuid = __webpack_require__(6);

	// **`v1()` - Generate time-based UUID**
	//
	// Inspired by https://github.com/LiosK/UUID.js
	// and http://docs.python.org/library/uuid.html

	// random #'s we need to init node and clockseq
	var _seedBytes = rng();

	// Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
	var _nodeId = [
	  _seedBytes[0] | 0x01,
	  _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
	];

	// Per 4.2.2, randomize (14 bit) clockseq
	var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

	// Previous uuid creation time
	var _lastMSecs = 0, _lastNSecs = 0;

	// See https://github.com/broofa/node-uuid for API details
	function v1(options, buf, offset) {
	  var i = buf && offset || 0;
	  var b = buf || [];

	  options = options || {};

	  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

	  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
	  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
	  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
	  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
	  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

	  // Per 4.2.1.2, use count of uuid's generated during the current clock
	  // cycle to simulate higher resolution clock
	  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

	  // Time since last uuid creation (in msecs)
	  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

	  // Per 4.2.1.2, Bump clockseq on clock regression
	  if (dt < 0 && options.clockseq === undefined) {
	    clockseq = clockseq + 1 & 0x3fff;
	  }

	  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
	  // time interval
	  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
	    nsecs = 0;
	  }

	  // Per 4.2.1.2 Throw error if too many uuids are requested
	  if (nsecs >= 10000) {
	    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
	  }

	  _lastMSecs = msecs;
	  _lastNSecs = nsecs;
	  _clockseq = clockseq;

	  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
	  msecs += 12219292800000;

	  // `time_low`
	  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
	  b[i++] = tl >>> 24 & 0xff;
	  b[i++] = tl >>> 16 & 0xff;
	  b[i++] = tl >>> 8 & 0xff;
	  b[i++] = tl & 0xff;

	  // `time_mid`
	  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
	  b[i++] = tmh >>> 8 & 0xff;
	  b[i++] = tmh & 0xff;

	  // `time_high_and_version`
	  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
	  b[i++] = tmh >>> 16 & 0xff;

	  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
	  b[i++] = clockseq >>> 8 | 0x80;

	  // `clock_seq_low`
	  b[i++] = clockseq & 0xff;

	  // `node`
	  var node = options.node || _nodeId;
	  for (var n = 0; n < 6; ++n) {
	    b[i + n] = node[n];
	  }

	  return buf ? buf : bytesToUuid(b);
	}

	module.exports = v1;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	// Unique ID creation requires a high quality random # generator.  In node.js
	// this is prett straight-forward - we use the crypto API.

	var rb = __webpack_require__(5).randomBytes;

	function rng() {
	  return rb(16);
	};

	module.exports = rng;


/***/ }),
/* 5 */
/***/ (function(module, exports) {

	module.exports = require("crypto");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	/**
	 * Convert array of 16 byte values to UUID string format of the form:
	 * XXXXXXXX-XXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
	 */
	var byteToHex = [];
	for (var i = 0; i < 256; ++i) {
	  byteToHex[i] = (i + 0x100).toString(16).substr(1);
	}

	function bytesToUuid(buf, offset) {
	  var i = offset || 0;
	  var bth = byteToHex;
	  return  bth[buf[i++]] + bth[buf[i++]] +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] +
	          bth[buf[i++]] + bth[buf[i++]] +
	          bth[buf[i++]] + bth[buf[i++]];
	}

	module.exports = bytesToUuid;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	var rng = __webpack_require__(4);
	var bytesToUuid = __webpack_require__(6);

	function v4(options, buf, offset) {
	  var i = buf && offset || 0;

	  if (typeof(options) == 'string') {
	    buf = options == 'binary' ? new Array(16) : null;
	    options = null;
	  }
	  options = options || {};

	  var rnds = options.random || (options.rng || rng)();

	  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
	  rnds[6] = (rnds[6] & 0x0f) | 0x40;
	  rnds[8] = (rnds[8] & 0x3f) | 0x80;

	  // Copy bytes to buffer, if provided
	  if (buf) {
	    for (var ii = 0; ii < 16; ++ii) {
	      buf[i + ii] = rnds[ii];
	    }
	  }

	  return buf || bytesToUuid(rnds);
	}

	module.exports = v4;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	(function (global, factory) {
		 true ? module.exports = factory() :
		typeof define === 'function' && define.amd ? define(factory) :
		(global.DeepDiff = factory());
	}(this, (function () { 'use strict';

	var $scope;
	var conflict;
	var conflictResolution = [];
	if (typeof global === 'object' && global) {
	  $scope = global;
	} else if (typeof window !== 'undefined') {
	  $scope = window;
	} else {
	  $scope = {};
	}
	conflict = $scope.DeepDiff;
	if (conflict) {
	  conflictResolution.push(
	    function() {
	      if ('undefined' !== typeof conflict && $scope.DeepDiff === accumulateDiff) {
	        $scope.DeepDiff = conflict;
	        conflict = undefined;
	      }
	    });
	}

	// nodejs compatible on server side and in the browser.
	function inherits(ctor, superCtor) {
	  ctor.super_ = superCtor;
	  ctor.prototype = Object.create(superCtor.prototype, {
	    constructor: {
	      value: ctor,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	}

	function Diff(kind, path) {
	  Object.defineProperty(this, 'kind', {
	    value: kind,
	    enumerable: true
	  });
	  if (path && path.length) {
	    Object.defineProperty(this, 'path', {
	      value: path,
	      enumerable: true
	    });
	  }
	}

	function DiffEdit(path, origin, value) {
	  DiffEdit.super_.call(this, 'E', path);
	  Object.defineProperty(this, 'lhs', {
	    value: origin,
	    enumerable: true
	  });
	  Object.defineProperty(this, 'rhs', {
	    value: value,
	    enumerable: true
	  });
	}
	inherits(DiffEdit, Diff);

	function DiffNew(path, value) {
	  DiffNew.super_.call(this, 'N', path);
	  Object.defineProperty(this, 'rhs', {
	    value: value,
	    enumerable: true
	  });
	}
	inherits(DiffNew, Diff);

	function DiffDeleted(path, value) {
	  DiffDeleted.super_.call(this, 'D', path);
	  Object.defineProperty(this, 'lhs', {
	    value: value,
	    enumerable: true
	  });
	}
	inherits(DiffDeleted, Diff);

	function DiffArray(path, index, item) {
	  DiffArray.super_.call(this, 'A', path);
	  Object.defineProperty(this, 'index', {
	    value: index,
	    enumerable: true
	  });
	  Object.defineProperty(this, 'item', {
	    value: item,
	    enumerable: true
	  });
	}
	inherits(DiffArray, Diff);

	function arrayRemove(arr, from, to) {
	  var rest = arr.slice((to || from) + 1 || arr.length);
	  arr.length = from < 0 ? arr.length + from : from;
	  arr.push.apply(arr, rest);
	  return arr;
	}

	function realTypeOf(subject) {
	  var type = typeof subject;
	  if (type !== 'object') {
	    return type;
	  }

	  if (subject === Math) {
	    return 'math';
	  } else if (subject === null) {
	    return 'null';
	  } else if (Array.isArray(subject)) {
	    return 'array';
	  } else if (Object.prototype.toString.call(subject) === '[object Date]') {
	    return 'date';
	  } else if (typeof subject.toString === 'function' && /^\/.*\//.test(subject.toString())) {
	    return 'regexp';
	  }
	  return 'object';
	}

	function deepDiff(lhs, rhs, changes, prefilter, path, key, stack) {
	  path = path || [];
	  stack = stack || [];
	  var currentPath = path.slice(0);
	  if (typeof key !== 'undefined') {
	    if (prefilter) {
	      if (typeof(prefilter) === 'function' && prefilter(currentPath, key)) {
	        return; } else if (typeof(prefilter) === 'object') {
	        if (prefilter.prefilter && prefilter.prefilter(currentPath, key)) {
	          return; }
	        if (prefilter.normalize) {
	          var alt = prefilter.normalize(currentPath, key, lhs, rhs);
	          if (alt) {
	            lhs = alt[0];
	            rhs = alt[1];
	          }
	        }
	      }
	    }
	    currentPath.push(key);
	  }

	  // Use string comparison for regexes
	  if (realTypeOf(lhs) === 'regexp' && realTypeOf(rhs) === 'regexp') {
	    lhs = lhs.toString();
	    rhs = rhs.toString();
	  }

	  var ltype = typeof lhs;
	  var rtype = typeof rhs;

	  var ldefined = ltype !== 'undefined' || (stack && stack[stack.length - 1].lhs && stack[stack.length - 1].lhs.hasOwnProperty(key));
	  var rdefined = rtype !== 'undefined' || (stack && stack[stack.length - 1].rhs && stack[stack.length - 1].rhs.hasOwnProperty(key));

	  if (!ldefined && rdefined) {
	    changes(new DiffNew(currentPath, rhs));
	  } else if (!rdefined && ldefined) {
	    changes(new DiffDeleted(currentPath, lhs));
	  } else if (realTypeOf(lhs) !== realTypeOf(rhs)) {
	    changes(new DiffEdit(currentPath, lhs, rhs));
	  } else if (realTypeOf(lhs) === 'date' && (lhs - rhs) !== 0) {
	    changes(new DiffEdit(currentPath, lhs, rhs));
	  } else if (ltype === 'object' && lhs !== null && rhs !== null) {
	    if (!stack.filter(function(x) {
	        return x.lhs === lhs; }).length) {
	      stack.push({ lhs: lhs, rhs: rhs });
	      if (Array.isArray(lhs)) {
	        var i, len = lhs.length;
	        for (i = 0; i < lhs.length; i++) {
	          if (i >= rhs.length) {
	            changes(new DiffArray(currentPath, i, new DiffDeleted(undefined, lhs[i])));
	          } else {
	            deepDiff(lhs[i], rhs[i], changes, prefilter, currentPath, i, stack);
	          }
	        }
	        while (i < rhs.length) {
	          changes(new DiffArray(currentPath, i, new DiffNew(undefined, rhs[i++])));
	        }
	      } else {
	        var akeys = Object.keys(lhs);
	        var pkeys = Object.keys(rhs);
	        akeys.forEach(function(k, i) {
	          var other = pkeys.indexOf(k);
	          if (other >= 0) {
	            deepDiff(lhs[k], rhs[k], changes, prefilter, currentPath, k, stack);
	            pkeys = arrayRemove(pkeys, other);
	          } else {
	            deepDiff(lhs[k], undefined, changes, prefilter, currentPath, k, stack);
	          }
	        });
	        pkeys.forEach(function(k) {
	          deepDiff(undefined, rhs[k], changes, prefilter, currentPath, k, stack);
	        });
	      }
	      stack.length = stack.length - 1;
	    } else if (lhs !== rhs) {
	      // lhs is contains a cycle at this element and it differs from rhs
	      changes(new DiffEdit(currentPath, lhs, rhs));
	    }
	  } else if (lhs !== rhs) {
	    if (!(ltype === 'number' && isNaN(lhs) && isNaN(rhs))) {
	      changes(new DiffEdit(currentPath, lhs, rhs));
	    }
	  }
	}

	function accumulateDiff(lhs, rhs, prefilter, accum) {
	  accum = accum || [];
	  deepDiff(lhs, rhs,
	    function(diff) {
	      if (diff) {
	        accum.push(diff);
	      }
	    },
	    prefilter);
	  return (accum.length) ? accum : undefined;
	}

	function applyArrayChange(arr, index, change) {
	  if (change.path && change.path.length) {
	    var it = arr[index],
	      i, u = change.path.length - 1;
	    for (i = 0; i < u; i++) {
	      it = it[change.path[i]];
	    }
	    switch (change.kind) {
	      case 'A':
	        applyArrayChange(it[change.path[i]], change.index, change.item);
	        break;
	      case 'D':
	        delete it[change.path[i]];
	        break;
	      case 'E':
	      case 'N':
	        it[change.path[i]] = change.rhs;
	        break;
	    }
	  } else {
	    switch (change.kind) {
	      case 'A':
	        applyArrayChange(arr[index], change.index, change.item);
	        break;
	      case 'D':
	        arr = arrayRemove(arr, index);
	        break;
	      case 'E':
	      case 'N':
	        arr[index] = change.rhs;
	        break;
	    }
	  }
	  return arr;
	}

	function applyChange(target, source, change) {
	  if (target && source && change && change.kind) {
	    var it = target,
	      i = -1,
	      last = change.path ? change.path.length - 1 : 0;
	    while (++i < last) {
	      if (typeof it[change.path[i]] === 'undefined') {
	        it[change.path[i]] = (typeof change.path[i] === 'number') ? [] : {};
	      }
	      it = it[change.path[i]];
	    }
	    switch (change.kind) {
	      case 'A':
	        applyArrayChange(change.path ? it[change.path[i]] : it, change.index, change.item);
	        break;
	      case 'D':
	        delete it[change.path[i]];
	        break;
	      case 'E':
	      case 'N':
	        it[change.path[i]] = change.rhs;
	        break;
	    }
	  }
	}

	function revertArrayChange(arr, index, change) {
	  if (change.path && change.path.length) {
	    // the structure of the object at the index has changed...
	    var it = arr[index],
	      i, u = change.path.length - 1;
	    for (i = 0; i < u; i++) {
	      it = it[change.path[i]];
	    }
	    switch (change.kind) {
	      case 'A':
	        revertArrayChange(it[change.path[i]], change.index, change.item);
	        break;
	      case 'D':
	        it[change.path[i]] = change.lhs;
	        break;
	      case 'E':
	        it[change.path[i]] = change.lhs;
	        break;
	      case 'N':
	        delete it[change.path[i]];
	        break;
	    }
	  } else {
	    // the array item is different...
	    switch (change.kind) {
	      case 'A':
	        revertArrayChange(arr[index], change.index, change.item);
	        break;
	      case 'D':
	        arr[index] = change.lhs;
	        break;
	      case 'E':
	        arr[index] = change.lhs;
	        break;
	      case 'N':
	        arr = arrayRemove(arr, index);
	        break;
	    }
	  }
	  return arr;
	}

	function revertChange(target, source, change) {
	  if (target && source && change && change.kind) {
	    var it = target,
	      i, u;
	    u = change.path.length - 1;
	    for (i = 0; i < u; i++) {
	      if (typeof it[change.path[i]] === 'undefined') {
	        it[change.path[i]] = {};
	      }
	      it = it[change.path[i]];
	    }
	    switch (change.kind) {
	      case 'A':
	        // Array was modified...
	        // it will be an array...
	        revertArrayChange(it[change.path[i]], change.index, change.item);
	        break;
	      case 'D':
	        // Item was deleted...
	        it[change.path[i]] = change.lhs;
	        break;
	      case 'E':
	        // Item was edited...
	        it[change.path[i]] = change.lhs;
	        break;
	      case 'N':
	        // Item is new...
	        delete it[change.path[i]];
	        break;
	    }
	  }
	}

	function applyDiff(target, source, filter) {
	  if (target && source) {
	    var onChange = function(change) {
	      if (!filter || filter(target, source, change)) {
	        applyChange(target, source, change);
	      }
	    };
	    deepDiff(target, source, onChange);
	  }
	}

	Object.defineProperties(accumulateDiff, {

	  diff: {
	    value: accumulateDiff,
	    enumerable: true
	  },
	  observableDiff: {
	    value: deepDiff,
	    enumerable: true
	  },
	  applyDiff: {
	    value: applyDiff,
	    enumerable: true
	  },
	  applyChange: {
	    value: applyChange,
	    enumerable: true
	  },
	  revertChange: {
	    value: revertChange,
	    enumerable: true
	  },
	  isConflict: {
	    value: function() {
	      return 'undefined' !== typeof conflict;
	    },
	    enumerable: true
	  },
	  noConflict: {
	    value: function() {
	      if (conflictResolution) {
	        conflictResolution.forEach(function(it) {
	          it();
	        });
	        conflictResolution = null;
	      }
	      return accumulateDiff;
	    },
	    enumerable: true
	  }
	});

	return accumulateDiff;

	})));


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(10);


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	/*
	 * This module is intended to be executed both on client side and server side.
	 * No error should be thrown. (soft error handling)
	 */

	(function () {
		var root = {};
		// Dependencies --------------------------------------------------------------
		root.async = ( true) ? __webpack_require__(11) : window.async;
		if (typeof root.async !== 'object') {
			throw new Error('Module async is required (https://github.com/caolan/async)');
		}
		var async = root.async;

		function _extend(origin, add) {
			if (!add || typeof add !== 'object') {
				return origin;
			}
			var keys = Object.keys(add);
			var i = keys.length;
			while (i--) {
				origin[keys[i]] = add[keys[i]];
			}
			return origin;
		}

		function _merge() {
			var ret = {};
			var args = Array.prototype.slice.call(arguments);
			var keys = null;
			var i = null;

			args.forEach(function (arg) {
				if (arg && arg.constructor === Object) {
					keys = Object.keys(arg);
					i = keys.length;
					while (i--) {
						ret[keys[i]] = arg[keys[i]];
					}
				}
			});
			return ret;
		}

		// Customisable class (Base class) -------------------------------------------
		// Use with operation "new" to extend Validation and Sanitization themselves,
		// not their prototype. In other words, constructor shall be call to extend
		// those functions, instead of being in their constructor, like this:
		//		_extend(Validation, new Customisable);

		function Customisable() {
			this.custom = {};

			this.extend = function (custom) {
				return _extend(this.custom, custom);
			};

			this.reset = function () {
				this.custom = {};
			};

			this.remove = function (fields) {
				if (!_typeIs.array(fields)) {
					fields = [fields];
				}
				fields.forEach(function (field) {
					delete this.custom[field];
				}, this);
			};
		}

		// Inspection class (Base class) ---------------------------------------------
		// Use to extend Validation and Sanitization prototypes. Inspection
		// constructor shall be called in derived class constructor.

		function Inspection(schema, custom) {
			var _stack = ['@'];

			this._schema = schema;
			this._custom = {};
			if (custom != null) {
				for (var key in custom) {
					if (custom.hasOwnProperty(key)){
						this._custom['$' + key] = custom[key];
					}
				}
			}

			this._getDepth = function () {
				return _stack.length;
			};

			this._dumpStack = function () {
				return _stack.map(function (i) {return i.replace(/^\[/g, '\u001b\u001c\u001d\u001e');})
				.join('.').replace(/\.\u001b\u001c\u001d\u001e/g, '[');
			};

			this._deeperObject = function (name) {
				_stack.push((/^[a-z$_][a-z0-9$_]*$/i).test(name) ? name : '["' + name + '"]');
				return this;
			};

			this._deeperArray = function (i) {
				_stack.push('[' + i + ']');
				return this;
			};

			this._back = function () {
				_stack.pop();
				return this;
			};
		}
		// Simple types --------------------------------------------------------------
		// If the property is not defined or is not in this list:
		var _typeIs = {
			"function": function (element) {
				return typeof element === 'function';
			},
			"string": function (element) {
				return typeof element === 'string';
			},
			"number": function (element) {
				return typeof element === 'number' && !isNaN(element);
			},
			"integer": function (element) {
				return typeof element === 'number' && element % 1 === 0;
			},
			"NaN": function (element) {
				return typeof element === 'number' && isNaN(element);
			},
			"boolean": function (element) {
				return typeof element === 'boolean';
			},
			"null": function (element) {
				return element === null;
			},
			"date": function (element) {
				return element != null && element instanceof Date;
			},
			"object": function (element) {
				return element != null && element.constructor === Object;
			},
			"array": function (element) {
				return element != null && element.constructor === Array;
			},
			"any": function (element) {
				return true;
			}
		};

		function _simpleType(type, candidate) {
			if (typeof type == 'function') {
				return candidate instanceof type;
			}
			type = type in _typeIs ? type : 'any';
			return _typeIs[type](candidate);
		}

		function _realType(candidate) {
			for (var i in _typeIs) {
				if (_simpleType(i, candidate)) {
					if (i !== 'any') { return i; }
					return 'an instance of ' + candidate.constructor.name;
				}
			}
		}

		function getIndexes(a, value) {
			var indexes = [];
			var i = a.indexOf(value);

			while (i !== -1) {
				indexes.push(i);
				i = a.indexOf(value, i + 1);
			}
			return indexes;
		}

		// Available formats ---------------------------------------------------------
		var _formats = {
			'void': /^$/,
			'url': /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)?(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
			'date-time': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z?|(-|\+)\d{2}:\d{2})$/,
			'date': /^\d{4}-\d{2}-\d{2}$/,
			'coolDateTime': /^\d{4}(-|\/)\d{2}(-|\/)\d{2}(T| )\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
			'time': /^\d{2}\:\d{2}\:\d{2}$/,
			'color': /^#([0-9a-f])+$/i,
			'email': /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
			'numeric': /^[0-9]+$/,
			'integer': /^\-?[0-9]+$/,
			'decimal': /^\-?[0-9]*\.?[0-9]+$/,
			'alpha': /^[a-z]+$/i,
			'alphaNumeric': /^[a-z0-9]+$/i,
			'alphaDash': /^[a-z0-9_-]+$/i,
			'javascript': /^[a-z_\$][a-z0-9_\$]*$/i,
			'upperString': /^[A-Z ]*$/,
			'lowerString': /^[a-z ]*$/
		};

	// Validation ------------------------------------------------------------------
		var _validationAttribut = {
			optional: function (schema, candidate) {
				var opt = typeof schema.optional === 'boolean' ? schema.optional : (schema.optional === 'true'); // Default is false

				if (opt === true) {
					return;
				}
				if (typeof candidate === 'undefined') {
					this.report('is missing and not optional', null, 'optional');
				}
			},
			type: function (schema, candidate) {
				// return because optional function already handle this case
				if (typeof candidate === 'undefined' || (typeof schema.type !== 'string' && !(schema.type instanceof Array) && typeof schema.type !== 'function')) {
					return;
				}
				var types = _typeIs.array(schema.type) ? schema.type : [schema.type];
				var typeIsValid = types.some(function (type) {
					return _simpleType(type, candidate);
				});
				if (!typeIsValid) {
					types = types.map(function (t) {return typeof t === 'function' ? 'and instance of ' + t.name : t; });
					this.report('must be ' + types.join(' or ') + ', but is ' + _realType(candidate), null, 'type');
				}
			},
			uniqueness: function (schema, candidate) {
				if (typeof schema.uniqueness === 'string') { schema.uniqueness = (schema.uniqueness === 'true'); }
				if (typeof schema.uniqueness !== 'boolean' || schema.uniqueness === false || (!_typeIs.array(candidate) && typeof candidate !== 'string')) {
					return;
				}
				var reported = [];
				for (var i = 0; i < candidate.length; i++) {
					if (reported.indexOf(candidate[i]) >= 0) {
						continue;
					}
					var indexes = getIndexes(candidate, candidate[i]);
					if (indexes.length > 1) {
						reported.push(candidate[i]);
						this.report('has value [' + candidate[i] + '] more than once at indexes [' + indexes.join(', ') + ']', null, 'uniqueness');
					}
				}
			},
			pattern: function (schema, candidate) {
				var self = this;
				var regexs = schema.pattern;
				if (typeof candidate !== 'string') {
					return;
				}
				var matches = false;
				if (!_typeIs.array(regexs)) {
					regexs = [regexs];
				}
				regexs.forEach(function (regex) {
					if (typeof regex === 'string' && regex in _formats) {
						regex = _formats[regex];
					}
					if (regex instanceof RegExp) {
						if (regex.test(candidate)) {
							matches = true;
						}
					}
				});
				if (!matches) {
					self.report('must match [' + regexs.join(' or ') + '], but is equal to "' + candidate + '"', null, 'pattern');
				}
			},
			validDate: function (schema, candidate) {
				if (String(schema.validDate) === 'true' && candidate instanceof Date && isNaN(candidate.getTime())) {
					this.report('must be a valid date', null, 'validDate');
				}
			},
			minLength: function (schema, candidate) {
				if (typeof candidate !== 'string' && !_typeIs.array(candidate)) {
					return;
				}
				var minLength = Number(schema.minLength);
				if (isNaN(minLength)) {
					return;
				}
				if (candidate.length < minLength) {
					this.report('must be longer than ' + minLength + ' elements, but it has ' + candidate.length, null, 'minLength');
				}
			},
			maxLength: function (schema, candidate) {
				if (typeof candidate !== 'string' && !_typeIs.array(candidate)) {
					return;
				}
				var maxLength = Number(schema.maxLength);
				if (isNaN(maxLength)) {
					return;
				}
				if (candidate.length > maxLength) {
					this.report('must be shorter than ' + maxLength + ' elements, but it has ' + candidate.length, null, 'maxLength');
				}
			},
			exactLength: function (schema, candidate) {
				if (typeof candidate !== 'string' && !_typeIs.array(candidate)) {
					return;
				}
				var exactLength = Number(schema.exactLength);
				if (isNaN(exactLength)) {
					return;
				}
				if (candidate.length !== exactLength) {
					this.report('must have exactly ' + exactLength + ' elements, but it have ' + candidate.length, null, 'exactLength');
				}
			},
			lt: function (schema, candidate) {
				var limit = Number(schema.lt);
				if (typeof candidate !== 'number' || isNaN(limit)) {
					return;
				}
				if (candidate >= limit) {
					this.report('must be less than ' + limit + ', but is equal to "' + candidate + '"', null, 'lt');
				}
			},
			lte: function (schema, candidate) {
				var limit = Number(schema.lte);
				if (typeof candidate !== 'number' || isNaN(limit)) {
					return;
				}
				if (candidate > limit) {
					this.report('must be less than or equal to ' + limit + ', but is equal to "' + candidate + '"', null, 'lte');
				}
			},
			gt: function (schema, candidate) {
				var limit = Number(schema.gt);
				if (typeof candidate !== 'number' || isNaN(limit)) {
					return;
				}
				if (candidate <= limit) {
					this.report('must be greater than ' + limit + ', but is equal to "' + candidate + '"', null, 'gt');
				}
			},
			gte: function (schema, candidate) {
				var limit = Number(schema.gte);
				if (typeof candidate !== 'number' || isNaN(limit)) {
					return;
				}
				if (candidate < limit) {
					this.report('must be greater than or equal to ' + limit + ', but is equal to "' + candidate + '"', null, 'gte');
				}
			},
			eq: function (schema, candidate) {
				if (typeof candidate !== 'number' && typeof candidate !== 'string' && typeof candidate !== 'boolean') {
					return;
				}
				var limit = schema.eq;
				if (typeof limit !== 'number' && typeof limit !== 'string' && typeof limit !== 'boolean' && !_typeIs.array(limit)) {
					return;
				}
				if (_typeIs.array(limit)) {
					for (var i = 0; i < limit.length; i++) {
						if (candidate === limit[i]) {
							return;
						}
					}
					this.report('must be equal to [' + limit.map(function (l) {
						return '"' + l + '"';
					}).join(' or ') + '], but is equal to "' + candidate + '"', null, 'eq');
				}
				else {
					if (candidate !== limit) {
						this.report('must be equal to "' + limit + '", but is equal to "' + candidate + '"', null, 'eq');
					}
				}
			},
			ne: function (schema, candidate) {
				if (typeof candidate !== 'number' && typeof candidate !== 'string') {
					return;
				}
				var limit = schema.ne;
				if (typeof limit !== 'number' && typeof limit !== 'string' && !_typeIs.array(limit)) {
					return;
				}
				if (_typeIs.array(limit)) {
					for (var i = 0; i < limit.length; i++) {
						if (candidate === limit[i]) {
							this.report('must not be equal to "' + limit[i] + '"', null, 'ne');
							return;
						}
					}
				}
				else {
					if (candidate === limit) {
						this.report('must not be equal to "' + limit + '"', null, 'ne');
					}
				}
			},
			someKeys: function (schema, candidat) {
				var _keys = schema.someKeys;
				if (!_typeIs.object(candidat)) {
					return;
				}
				var valid = _keys.some(function (action) {
					return (action in candidat);
				});
				if (!valid) {
					this.report('must have at least key ' + _keys.map(function (i) {
						return '"' + i + '"';
					}).join(' or '), null, 'someKeys');
				}
			},
			strict: function (schema, candidate) {
				if (typeof schema.strict === 'string') { schema.strict = (schema.strict === 'true'); }
				if (schema.strict !== true || !_typeIs.object(candidate) || !_typeIs.object(schema.properties)) {
					return;
				}
				var self = this;
				if (typeof schema.properties['*'] === 'undefined') {
					var intruder = Object.keys(candidate).filter(function (key) {
						return (typeof schema.properties[key] === 'undefined');
					});
					if (intruder.length > 0) {
						var msg = 'should not contains ' + (intruder.length > 1 ? 'properties' : 'property') +
							' [' + intruder.map(function (i) { return '"' + i + '"'; }).join(', ') + ']';
						self.report(msg, null, 'strict');
					}
				}
			},
			exec: function (schema, candidate, callback) {
				var self = this;

				if (typeof callback === 'function') {
					return this.asyncExec(schema, candidate, callback);
				}
				(_typeIs.array(schema.exec) ? schema.exec : [schema.exec]).forEach(function (exec) {
					if (typeof exec === 'function') {
						exec.call(self, schema, candidate);
					}
				});
			},
			properties: function (schema, candidate, callback) {
				if (typeof callback === 'function') {
					return this.asyncProperties(schema, candidate, callback);
				}
				if (!(schema.properties instanceof Object) || !(candidate instanceof Object)) {
					return;
				}
				var properties = schema.properties,
						i;
				if (properties['*'] != null) {
					for (i in candidate) {
						if (i in properties) {
							continue;
						}
						this._deeperObject(i);
						this._validate(properties['*'], candidate[i]);
						this._back();
					}
				}
				for (i in properties) {
					if (i === '*') {
						continue;
					}
					this._deeperObject(i);
					this._validate(properties[i], candidate[i]);
					this._back();
				}
			},
			items: function (schema, candidate, callback) {
				if (typeof callback === 'function') {
					return this.asyncItems(schema, candidate, callback);
				}
				if (!(schema.items instanceof Object) || !(candidate instanceof Object)) {
					return;
				}
				var items = schema.items;
				var i, l;
				// If provided schema is an array
				// then call validate for each case
				// else it is an Object
				// then call validate for each key
				if (_typeIs.array(items) && _typeIs.array(candidate)) {
					for (i = 0, l = items.length; i < l; i++) {
						this._deeperArray(i);
						this._validate(items[i], candidate[i]);
						this._back();
					}
				}
				else {
					for (var key in candidate) {
						if (candidate.hasOwnProperty(key)){
							this._deeperArray(key);
							this._validate(items, candidate[key]);
							this._back();
						}

					}
				}
			}
		};

		var _asyncValidationAttribut = {
			asyncExec: function (schema, candidate, callback) {
				var self = this;
				async.eachSeries(_typeIs.array(schema.exec) ? schema.exec : [schema.exec], function (exec, done) {
					if (typeof exec === 'function') {
						if (exec.length > 2) {
							return exec.call(self, schema, candidate, done);
						}
						exec.call(self, schema, candidate);
					}
					async.nextTick(done);
				}, callback);
			},
			asyncProperties: function (schema, candidate, callback) {
				if (!(schema.properties instanceof Object) || !_typeIs.object(candidate)) {
					return callback();
				}
				var self = this;
				var properties = schema.properties;
				async.series([
					function (next) {
						if (properties['*'] == null) {
							return next();
						}
						async.eachSeries(Object.keys(candidate), function (i, done) {
							if (i in properties) {
								return async.nextTick(done);
							}
							self._deeperObject(i);
							self._asyncValidate(properties['*'], candidate[i], function (err) {
								self._back();
								done(err);
							});
						}, next);
					},
					function (next) {
						async.eachSeries(Object.keys(properties), function (i, done) {
							if (i === '*') {
								return async.nextTick(done);
							}
							self._deeperObject(i);
							self._asyncValidate(properties[i], candidate[i], function (err) {
								self._back();
								done(err);
							});
						}, next);
					}
				], callback);
			},
			asyncItems: function (schema, candidate, callback) {
				if (!(schema.items instanceof Object) || !(candidate instanceof Object)) {
					return callback();
				}
				var self = this;
				var items = schema.items;
				var i, l;

				if (_typeIs.array(items) && _typeIs.array(candidate)) {
					async.timesSeries(items.length, function (i, done) {
						self._deeperArray(i);
						self._asyncValidate(items[i], candidate[i], function (err, res) {
							self._back();
							done(err, res);
						});
						self._back();
					}, callback);
				}
				else {
					async.eachSeries(Object.keys(candidate), function (key, done) {
						self._deeperArray(key);
						self._asyncValidate(items, candidate[key], function (err, res) {
							self._back();
							done(err, res);
						});
					}, callback);
				}
			}
		};

		// Validation Class ----------------------------------------------------------
		// inherits from Inspection class (actually we just call Inspection
		// constructor with the new context, because its prototype is empty
		function Validation(schema, custom) {
			Inspection.prototype.constructor.call(this, schema, _merge(Validation.custom, custom));
			var _error = [];

			this._basicFields = Object.keys(_validationAttribut);
			this._customFields = Object.keys(this._custom);
			this.origin = null;

			this.report = function (message, code, reason) {
				var newErr = {
					code: code || this.userCode || null,
					reason: reason || 'unknown',
					message: this.userError || message || 'is invalid',
					property: this.userAlias ? (this.userAlias + ' (' + this._dumpStack() + ')') : this._dumpStack()
				};
				_error.push(newErr);
				return this;
			};

			this.result = function () {
				return {
					error: _error,
					valid: _error.length === 0,
					format: function () {
						if (this.valid === true) {
							return 'Candidate is valid';
						}
						return this.error.map(function (i) {
							return 'Property ' + i.property + ': ' + i.message;
						}).join('\n');
					}
				};
			};
		}

		_extend(Validation.prototype, _validationAttribut);
		_extend(Validation.prototype, _asyncValidationAttribut);
		_extend(Validation, new Customisable());

		Validation.prototype.validate = function (candidate, callback) {
			this.origin = candidate;
			if (typeof callback === 'function') {
				var self = this;
				return async.nextTick(function () {
					self._asyncValidate(self._schema, candidate, function (err) {
						self.origin = null;
						callback(err, self.result());
					});
				});
			}
			return this._validate(this._schema, candidate).result();
		};

		Validation.prototype._validate = function (schema, candidate, callback) {
			this.userCode = schema.code || null;
			this.userError = schema.error || null;
			this.userAlias = schema.alias || null;
			this._basicFields.forEach(function (i) {
				if ((i in schema || i === 'optional') && typeof this[i] === 'function') {
					this[i](schema, candidate);
				}
			}, this);
			this._customFields.forEach(function (i) {
				if (i in schema && typeof this._custom[i] === 'function') {
					this._custom[i].call(this, schema, candidate);
				}
			}, this);
			return this;
		};

		Validation.prototype._asyncValidate = function (schema, candidate, callback) {
			var self = this;
			this.userCode = schema.code || null;
			this.userError = schema.error || null;
			this.userAlias = schema.alias || null;

			async.series([
				function (next) {
					async.eachSeries(Object.keys(_validationAttribut), function (i, done) {
						async.nextTick(function () {
							if ((i in schema || i === 'optional') && typeof self[i] === 'function') {
								if (self[i].length > 2) {
									return self[i](schema, candidate, done);
								}
								self[i](schema, candidate);
							}
							done();
						});
					}, next);
				},
				function (next) {
					async.eachSeries(Object.keys(self._custom), function (i, done) {
						async.nextTick(function () {
							if (i in schema && typeof self._custom[i] === 'function') {
								if (self._custom[i].length > 2) {
									return self._custom[i].call(self, schema, candidate, done);
								}
								self._custom[i].call(self, schema, candidate);
							}
							done();
						});
					}, next);
				}
			], callback);
		};

	// Sanitization ----------------------------------------------------------------
		// functions called by _sanitization.type method.
		var _forceType = {
			number: function (post, schema) {
				var n;
				if (typeof post === 'number') {
					return post;
				}
				else if (post === '') {
					if (typeof schema.def !== 'undefined')
						return schema.def;
					return null;
				}
				else if (typeof post === 'string') {
					n = parseFloat(post.replace(/,/g, '.').replace(/ /g, ''));
					if (typeof n === 'number') {
						return n;
					}
				}
				else if (post instanceof Date) {
					return +post;
				}
				return null;
			},
			integer: function (post, schema) {
				var n;
				if (typeof post === 'number' && post % 1 === 0) {
					return post;
				}
				else if (post === '') {
					if (typeof schema.def !== 'undefined')
						return schema.def;
					return null;
				}
				else if (typeof post === 'string') {
					n = parseInt(post.replace(/ /g, ''), 10);
					if (typeof n === 'number') {
						return n;
					}
				}
				else if (typeof post === 'number') {
					return parseInt(post, 10);
				}
				else if (typeof post === 'boolean') {
					if (post) { return 1; }
					return 0;
				}
				else if (post instanceof Date) {
					return +post;
				}
				return null;
			},
			string: function (post, schema) {
				if (typeof post === 'boolean' || typeof post === 'number' || post instanceof Date) {
					return post.toString();
				}
				else if (_typeIs.array(post)) {
					// If user authorize array and strings...
					if (schema.items || schema.properties)
						return post;
					return post.join(String(schema.joinWith || ','));
				}
				else if (post instanceof Object) {
					// If user authorize objects ans strings...
					if (schema.items || schema.properties)
						return post;
					return JSON.stringify(post);
				}
				else if (typeof post === 'string' && post.length) {
					return post;
				}
				return null;
			},
			date: function (post, schema) {
				if (post instanceof Date) {
					return post;
				}
				else {
					var d = new Date(post);
					if (!isNaN(d.getTime())) { // if valid date
						return d;
					}
				}
				return null;
			},
			boolean: function (post, schema) {
				if (typeof post === 'undefined') return null;
				if (typeof post === 'string' && post.toLowerCase() === 'false') return false;
				return !!post;
			},
			object: function (post, schema) {
				if (typeof post !== 'string' || _typeIs.object(post)) {
					return post;
				}
				try {
					return JSON.parse(post);
				}
				catch (e) {
					return null;
				}
			},
			array: function (post, schema) {
				if (_typeIs.array(post))
					return post;
				if (typeof post === 'undefined')
					return null;
				if (typeof post === 'string') {
					if (post.substring(0,1) === '[' && post.slice(-1) === ']') {
						try {
							return JSON.parse(post);
						}
						catch (e) {
							return null;
						}
					}
					return post.split(String(schema.splitWith || ','));

				}
				if (!_typeIs.array(post))
					return [ post ];
				return null;
			}
		};

		var _applyRules = {
			upper: function (post) {
				return post.toUpperCase();
			},
			lower: function (post) {
				return post.toLowerCase();
			},
			title: function (post) {
				// Fix by seb (replace \w\S* by \S* => exemple : coucou ça va)
				return post.replace(/\S*/g, function (txt) {
					return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
				});
			},
			capitalize: function (post) {
				return post.charAt(0).toUpperCase() + post.substr(1).toLowerCase();
			},
			ucfirst: function (post) {
				return post.charAt(0).toUpperCase() + post.substr(1);
			},
			trim: function (post) {
				return post.trim();
			}
		};

		// Every function return the future value of each property. Therefore you
		// have to return post even if you do not change its value
		var _sanitizationAttribut = {
			strict: function (schema, post) {
				if (typeof schema.strict === 'string') { schema.strict = (schema.strict === 'true'); }
				if (schema.strict !== true)
					return post;
				if (!_typeIs.object(schema.properties))
					return post;
				if (!_typeIs.object(post))
					return post;
				var that = this;
				Object.keys(post).forEach(function (key) {
					if (!(key in schema.properties)) {
						delete post[key];
					}
				});
				return post;
			},
			optional: function (schema, post) {
				var opt = typeof schema.optional === 'boolean' ? schema.optional : (schema.optional !== 'false'); // Default: true
				if (opt === true) {
					return post;
				}
				if (typeof post !== 'undefined') {
					return post;
				}
				this.report();
				if (schema.def === Date) {
					return new Date();
				}
				return schema.def;
			},
			type: function (schema, post) {
				// if (_typeIs['object'](post) || _typeIs.array(post)) {
				// 	return post;
				// }
				if (typeof schema.type !== 'string' || typeof _forceType[schema.type] !== 'function') {
					return post;
				}
				var n;
				var opt = typeof schema.optional === 'boolean' ? schema.optional : true;
				if (typeof _forceType[schema.type] === 'function') {
					n = _forceType[schema.type](post, schema);
					if ((n === null && !opt) || (!n && isNaN(n)) || (n === null && schema.type === 'string')) {
						n = schema.def;
					}
				}
				else if (!opt) {
					n = schema.def;
				}
				if ((n != null || (typeof schema.def !== 'undefined' && schema.def === n)) && n !== post) {
					this.report();
					return n;
				}
				return post;
			},
			rules: function (schema, post) {
				var rules = schema.rules;
				if (typeof post !== 'string' || (typeof rules !== 'string' && !_typeIs.array(rules))) {
					return post;
				}
				var modified = false;
				(_typeIs.array(rules) ? rules : [rules]).forEach(function (rule) {
					if (typeof _applyRules[rule] === 'function') {
						post = _applyRules[rule](post);
						modified = true;
					}
				});
				if (modified) {
					this.report();
				}
				return post;
			},
			min: function (schema, post) {
				var postTest = Number(post);
				if (isNaN(postTest)) {
					return post;
				}
				var min = Number(schema.min);
				if (isNaN(min)) {
					return post;
				}
				if (postTest < min) {
					this.report();
					return min;
				}
				return post;
			},
			max: function (schema, post) {
				var postTest = Number(post);
				if (isNaN(postTest)) {
					return post;
				}
				var max = Number(schema.max);
				if (isNaN(max)) {
					return post;
				}
				if (postTest > max) {
					this.report();
					return max;
				}
				return post;
			},
			minLength: function (schema, post) {
				var limit = Number(schema.minLength);
				if (typeof post !== 'string' || isNaN(limit) || limit < 0) {
					return post;
				}
				var str = '';
				var gap = limit - post.length;
				if (gap > 0) {
					for (var i = 0; i < gap; i++) {
						str += '-';
					}
					this.report();
					return post + str;
				}
				return post;
			},
			maxLength: function (schema, post) {
				var limit = Number(schema.maxLength);
				if (typeof post !== 'string' || isNaN(limit) || limit < 0) {
					return post;
				}
				if (post.length > limit) {
					this.report();
					return post.slice(0, limit);
				}
				return post;
			},
			properties: function (schema, post, callback) {
				if (typeof callback === 'function') {
					return this.asyncProperties(schema, post, callback);
				}
				if (!post || typeof post !== 'object') {
					return post;
				}
				var properties = schema.properties;
				var tmp;
				var i;
				if (typeof properties['*'] !== 'undefined') {
					for (i in post) {
						if (i in properties) {
							continue;
						}
						this._deeperObject(i);
						tmp = this._sanitize(schema.properties['*'], post[i]);
						if (typeof tmp !== 'undefined') {
							post[i]= tmp;
						}
						this._back();
					}
				}
				for (i in schema.properties) {
					if (i !== '*') {
						this._deeperObject(i);
						tmp = this._sanitize(schema.properties[i], post[i]);
						if (typeof tmp !== 'undefined') {
							post[i]= tmp;
						}
						this._back();
					}
				}
				return post;
			},
			items: function (schema, post, callback) {
				if (typeof callback === 'function') {
					return this.asyncItems(schema, post, callback);
				}
				if (!(schema.items instanceof Object) || !(post instanceof Object)) {
					return post;
				}
				var i;
				if (_typeIs.array(schema.items) && _typeIs.array(post)) {
					var minLength = schema.items.length < post.length ? schema.items.length : post.length;
					for (i = 0; i < minLength; i++) {
						this._deeperArray(i);
						post[i] = this._sanitize(schema.items[i], post[i]);
						this._back();
					}
				}
				else {
					for (i in post) {
						if(post.hasOwnProperty(i)){
							this._deeperArray(i);
							post[i] = this._sanitize(schema.items, post[i]);
							this._back();
						}
					}
				}
				return post;
			},
			exec: function (schema, post, callback) {
				if (typeof callback === 'function') {
					return this.asyncExec(schema, post, callback);
				}
				var execs = _typeIs.array(schema.exec) ? schema.exec : [schema.exec];

				execs.forEach(function (exec) {
					if (typeof exec === 'function') {
						post = exec.call(this, schema, post);
					}
				}, this);
				return post;
			}
		};

		var _asyncSanitizationAttribut = {
			asyncExec: function (schema, post, callback) {
				var self = this;
				var execs = _typeIs.array(schema.exec) ? schema.exec : [schema.exec];

				async.eachSeries(execs, function (exec, done) {
					if (typeof exec === 'function') {
						if (exec.length > 2) {
							return exec.call(self, schema, post, function (err, res) {
								if (err) {
									return done(err);
								}
								post = res;
								done();
							});
						}
						post = exec.call(self, schema, post);
					}
					done();
				}, function (err) {
					callback(err, post);
				});
			},
			asyncProperties: function (schema, post, callback) {
				if (!post || typeof post !== 'object') {
					return callback(null, post);
				}
				var self = this;
				var properties = schema.properties;

				async.series([
					function (next) {
						if (properties['*'] == null) {
							return next();
						}
						var globing = properties['*'];
						async.eachSeries(Object.keys(post), function (i, next) {
							if (i in properties) {
								return next();
							}
							self._deeperObject(i);
							self._asyncSanitize(globing, post[i], function (err, res) {
								if (err) { /* Error can safely be ignored here */ }
								if (typeof res !== 'undefined') {
									post[i] = res;
								}
								self._back();
								next();
							});
						}, next);
					},
					function (next) {
						async.eachSeries(Object.keys(properties), function (i, next) {
							if (i === '*') {
								return next();
							}
							self._deeperObject(i);
							self._asyncSanitize(properties[i], post[i], function (err, res) {
								if (err) {
									return next(err);
								}
								if (typeof res !== 'undefined') {
									post[i] = res;
								}
								self._back();
								next();
							});
						}, next);
					}
				], function (err) {
					return callback(err, post);
				});
			},
			asyncItems: function (schema, post, callback) {
				if (!(schema.items instanceof Object) || !(post instanceof Object)) {
					return callback(null, post);
				}
				var self = this;
				var items = schema.items;
				if (_typeIs.array(items) && _typeIs.array(post)) {
					var minLength = items.length < post.length ? items.length : post.length;
					async.timesSeries(minLength, function (i, next) {
						self._deeperArray(i);
						self._asyncSanitize(items[i], post[i], function (err, res) {
							if (err) {
								return next(err);
							}
							post[i] = res;
							self._back();
							next();
						});
					}, function (err) {
						callback(err, post);
					});
				}
				else {
					async.eachSeries(Object.keys(post), function (key, next) {
						self._deeperArray(key);
						self._asyncSanitize(items, post[key], function (err, res) {
							if (err) {
								return next();
							}
							post[key] = res;
							self._back();
							next();
						});
					}, function (err) {
						callback(err, post);
					});
				}
				return post;
			}
		};

		// Sanitization Class --------------------------------------------------------
		// inherits from Inspection class (actually we just call Inspection
		// constructor with the new context, because its prototype is empty
		function Sanitization(schema, custom) {
			Inspection.prototype.constructor.call(this, schema, _merge(Sanitization.custom, custom));
			var _reporting = [];

			this._basicFields = Object.keys(_sanitizationAttribut);
			this._customFields = Object.keys(this._custom);
			this.origin = null;

			this.report = function (message) {
				var newNot = {
						message: message || 'was sanitized',
						property: this.userAlias ? (this.userAlias + ' (' + this._dumpStack() + ')') : this._dumpStack()
				};
				if (!_reporting.some(function (e) { return e.property === newNot.property; })) {
					_reporting.push(newNot);
				}
			};

			this.result = function (data) {
				return {
					data: data,
					reporting: _reporting,
					format: function () {
						return this.reporting.map(function (i) {
							return 'Property ' + i.property + ' ' + i.message;
						}).join('\n');
					}
				};
			};
		}

		_extend(Sanitization.prototype, _sanitizationAttribut);
		_extend(Sanitization.prototype, _asyncSanitizationAttribut);
		_extend(Sanitization, new Customisable());


		Sanitization.prototype.sanitize = function (post, callback) {
			this.origin = post;
			if (typeof callback === 'function') {
				var self = this;
				return this._asyncSanitize(this._schema, post, function (err, data) {
					self.origin = null;
					callback(err, self.result(data));
				});
			}
			var data = this._sanitize(this._schema, post);
			this.origin = null;
			return this.result(data);
		};

		Sanitization.prototype._sanitize = function (schema, post) {
			this.userAlias = schema.alias || null;
			this._basicFields.forEach(function (i) {
				if ((i in schema || i === 'optional') && typeof this[i] === 'function') {
					post = this[i](schema, post);
				}
			}, this);
			this._customFields.forEach(function (i) {
				if (i in schema && typeof this._custom[i] === 'function') {
					post = this._custom[i].call(this, schema, post);
				}
			}, this);
			return post;
		};

		Sanitization.prototype._asyncSanitize = function (schema, post, callback) {
			var self = this;
			this.userAlias = schema.alias || null;

			async.waterfall([
				function (next) {
					async.reduce(self._basicFields, post, function (value, i, next) {
						async.nextTick(function () {
							if ((i in schema || i === 'optional') && typeof self[i] === 'function') {
								if (self[i].length > 2) {
									return self[i](schema, value, next);
								}
								value = self[i](schema, value);
							}
							next(null, value);
						});
					}, next);
				},
				function (inter, next) {
					async.reduce(self._customFields, inter, function (value, i, next) {
						async.nextTick(function () {
							if (i in schema && typeof self._custom[i] === 'function') {
								if (self._custom[i].length > 2) {
									return self._custom[i].call(self, schema, value, next);
								}
								value = self._custom[i].call(self, schema, value);
							}
							next(null, value);
						});
					}, next);
				}
			], callback);
		};

		// ---------------------------------------------------------------------------

		var INT_MIN = -2147483648;
		var INT_MAX = 2147483647;

		var _rand = {
			int: function (min, max) {
				return min + (0 | Math.random() * (max - min + 1));
			},
			float: function (min, max) {
				return (Math.random() * (max - min) + min);
			},
			bool: function () {
				return (Math.random() > 0.5);
			},
			char: function (min, max) {
				return String.fromCharCode(this.int(min, max));
			},
			fromList: function (list) {
				return list[this.int(0, list.length - 1)];
			}
		};

		var _formatSample = {
			'date-time': function () {
				return new Date().toISOString();
			},
			'date': function () {
				return new Date().toISOString().replace(/T.*$/, '');
			},
			'time': function () {
				return new Date().toLocaleTimeString({}, { hour12: false });
			},
			'color': function (min, max) {
				var s = '#';
				if (min < 1) {
					min = 1;
				}
				for (var i = 0, l = _rand.int(min, max); i < l; i++) {
					s += _rand.fromList('0123456789abcdefABCDEF');
				}
				return s;
			},
			'numeric': function () {
				return '' + _rand.int(0, INT_MAX);
			},
			'integer': function () {
				if (_rand.bool() === true) {
					return '-' + this.numeric();
				}
				return this.numeric();
			},
			'decimal': function () {
				return this.integer() + '.' + this.numeric();
			},
			'alpha': function (min, max) {
				var s = '';
				if (min < 1) {
					min = 1;
				}
				for (var i = 0, l = _rand.int(min, max); i < l; i++) {
					s += _rand.fromList('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
				}
				return s;
			},
			'alphaNumeric': function (min, max) {
				var s = '';
				if (min < 1) {
					min = 1;
				}
				for (var i = 0, l = _rand.int(min, max); i < l; i++) {
					s += _rand.fromList('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
				}
				return s;
			},
			'alphaDash': function (min, max) {
				var s = '';
				if (min < 1) {
					min = 1;
				}
				for (var i = 0, l = _rand.int(min, max); i < l; i++) {
					s += _rand.fromList('_-abcdefghijklmnopqrstuvwxyz_-ABCDEFGHIJKLMNOPQRSTUVWXYZ_-0123456789_-');
				}
				return s;
			},
			'javascript': function (min, max) {
				var s = _rand.fromList('_$abcdefghijklmnopqrstuvwxyz_$ABCDEFGHIJKLMNOPQRSTUVWXYZ_$');
				for (var i = 0, l = _rand.int(min, max - 1); i < l; i++) {
					s += _rand.fromList('_$abcdefghijklmnopqrstuvwxyz_$ABCDEFGHIJKLMNOPQRSTUVWXYZ_$0123456789_$');
				}
				return s;
			}
		};

		function _getLimits(schema) {
			var min = INT_MIN;
			var max = INT_MAX;

			if (schema.gte != null) {
				min = schema.gte;
			}
			else if (schema.gt != null) {
				min = schema.gt + 1;
			}
			if (schema.lte != null) {
				max = schema.lte;
			}
			else if (schema.lt != null) {
				max = schema.lt - 1;
			}
			return { min: min, max: max };
		}

		var _typeGenerator = {
			string: function (schema) {
				if (schema.eq != null) {
					return schema.eq;
				}
				var s = '';
				var minLength = schema.minLength != null ? schema.minLength : 0;
				var maxLength = schema.maxLength != null ? schema.maxLength : 32;
				if (typeof schema.pattern === 'string' && typeof _formatSample[schema.pattern] === 'function') {
					return _formatSample[schema.pattern](minLength, maxLength);
				}

				var l = schema.exactLength != null ? schema.exactLength : _rand.int(minLength, maxLength);
				for (var i = 0; i < l; i++) {
					s += _rand.char(32, 126);
				}
				return s;
			},
			number: function (schema) {
				if (schema.eq != null) {
					return schema.eq;
				}
				var limit = _getLimits(schema);
				var n = _rand.float(limit.min, limit.max);
				if (schema.ne != null) {
					var ne = _typeIs.array(schema.ne) ? schema.ne : [schema.ne];
					while (ne.indexOf(n) !== -1) {
						n = _rand.float(limit.min, limit.max);
					}
				}
				return n;
			},
			integer: function (schema) {
				if (schema.eq != null) {
					return schema.eq;
				}
				var limit = _getLimits(schema);
				var n = _rand.int(limit.min, limit.max);
				if (schema.ne != null) {
					var ne = _typeIs.array(schema.ne) ? schema.ne : [schema.ne];
					while (ne.indexOf(n) !== -1) {
						n = _rand.int(limit.min, limit.max);
					}
				}
				return n;
			},
			boolean: function (schema) {
				if (schema.eq != null) {
					return schema.eq;
				}
				return _rand.bool();
			},
			"null": function (schema) {
				return null;
			},
			date: function (schema) {
				if (schema.eq != null) {
					return schema.eq;
				}
				return new Date();
			},
			object: function (schema) {
				var o = {};
				var prop = schema.properties || {};

				for (var key in prop) {
					if (prop.hasOwnProperty(key)){
						if (prop[key].optional === true && _rand.bool() === true) {
							continue;
						}
						if (key !== '*') {
							o[key] = this.generate(prop[key]);
						}
						else {
							var rk = '__random_key_';
							var randomKey = rk + 0;
							var n = _rand.int(1, 9);
							for (var i = 1; i <= n; i++) {
								if (!(randomKey in prop)) {
									o[randomKey] = this.generate(prop[key]);
								}
								randomKey = rk + i;
							}
						}
					}
				}
				return o;
			},
			array: function (schema) {
				var self = this;
				var items = schema.items || {};
				var minLength = schema.minLength != null ? schema.minLength : 0;
				var maxLength = schema.maxLength != null ? schema.maxLength : 16;
				var type;
				var candidate;
				var size;
				var i;

				if (_typeIs.array(items)) {
					size = items.length;
					if (schema.exactLength != null) {
						size = schema.exactLength;
					}
					else if (size < minLength) {
						size = minLength;
					}
					else if (size > maxLength) {
						size = maxLength;
					}
					candidate = new Array(size);
					type = null;
					for (i = 0; i < size; i++) {
						type = items[i].type || 'any';
						if (_typeIs.array(type)) {
							type = type[_rand.int(0, type.length - 1)];
						}
						candidate[i] = self[type](items[i]);
					}
				}
				else {
					size = schema.exactLength != null ? schema.exactLength : _rand.int(minLength, maxLength);
					candidate = new Array(size);
					type = items.type || 'any';
					if (_typeIs.array(type)) {
						type = type[_rand.int(0, type.length - 1)];
					}
					for (i = 0; i < size; i++) {
						candidate[i] = self[type](items);
					}
				}
				return candidate;
			},
			any: function (schema) {
				var fields = Object.keys(_typeGenerator);
				var i = fields[_rand.int(0, fields.length - 2)];
				return this[i](schema);
			}
		};

		// CandidateGenerator Class (Singleton) --------------------------------------
		function CandidateGenerator() {
			// Maybe extends Inspection class too ?
		}

		_extend(CandidateGenerator.prototype, _typeGenerator);

		var _instance = null;
		CandidateGenerator.instance = function () {
			if (!(_instance instanceof CandidateGenerator)) {
				_instance = new CandidateGenerator();
			}
			return _instance;
		};

		CandidateGenerator.prototype.generate = function (schema) {
			var type = schema.type || 'any';
			if (_typeIs.array(type)) {
				type = type[_rand.int(0, type.length - 1)];
			}
			return this[type](schema);
		};

	// Exports ---------------------------------------------------------------------
		var SchemaInspector = {};

		// if server-side (node.js) else client-side
		if (typeof module !== 'undefined' && module.exports) {
			module.exports = SchemaInspector;
		}
		else {
			window.SchemaInspector = SchemaInspector;
		}

		SchemaInspector.newSanitization = function (schema, custom) {
			return new Sanitization(schema, custom);
		};

		SchemaInspector.newValidation = function (schema, custom) {
			return new Validation(schema, custom);
		};

		SchemaInspector.Validation = Validation;
		SchemaInspector.Sanitization = Sanitization;

		SchemaInspector.sanitize = function (schema, post, custom, callback) {
			if (arguments.length === 3 && typeof custom === 'function') {
				callback = custom;
				custom = null;
			}
			return new Sanitization(schema, custom).sanitize(post, callback);
		};

		SchemaInspector.validate = function (schema, candidate, custom, callback) {
			if (arguments.length === 3 && typeof custom === 'function') {
				callback = custom;
				custom = null;
			}
			return new Validation(schema, custom).validate(candidate, callback);
		};

		SchemaInspector.generate = function (schema, n) {
			if (typeof n === 'number') {
				var r = new Array(n);
				for (var i = 0; i < n; i++) {
					r[i] = CandidateGenerator.instance().generate(schema);
				}
				return r;
			}
			return CandidateGenerator.instance().generate(schema);
		};
	})();


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * async
	 * https://github.com/caolan/async
	 *
	 * Copyright 2010-2014 Caolan McMahon
	 * Released under the MIT license
	 */
	(function () {

	    var async = {};
	    function noop() {}
	    function identity(v) {
	        return v;
	    }
	    function toBool(v) {
	        return !!v;
	    }
	    function notId(v) {
	        return !v;
	    }

	    // global on the server, window in the browser
	    var previous_async;

	    // Establish the root object, `window` (`self`) in the browser, `global`
	    // on the server, or `this` in some virtual machines. We use `self`
	    // instead of `window` for `WebWorker` support.
	    var root = typeof self === 'object' && self.self === self && self ||
	            typeof global === 'object' && global.global === global && global ||
	            this;

	    if (root != null) {
	        previous_async = root.async;
	    }

	    async.noConflict = function () {
	        root.async = previous_async;
	        return async;
	    };

	    function only_once(fn) {
	        return function() {
	            if (fn === null) throw new Error("Callback was already called.");
	            fn.apply(this, arguments);
	            fn = null;
	        };
	    }

	    function _once(fn) {
	        return function() {
	            if (fn === null) return;
	            fn.apply(this, arguments);
	            fn = null;
	        };
	    }

	    //// cross-browser compatiblity functions ////

	    var _toString = Object.prototype.toString;

	    var _isArray = Array.isArray || function (obj) {
	        return _toString.call(obj) === '[object Array]';
	    };

	    // Ported from underscore.js isObject
	    var _isObject = function(obj) {
	        var type = typeof obj;
	        return type === 'function' || type === 'object' && !!obj;
	    };

	    function _isArrayLike(arr) {
	        return _isArray(arr) || (
	            // has a positive integer length property
	            typeof arr.length === "number" &&
	            arr.length >= 0 &&
	            arr.length % 1 === 0
	        );
	    }

	    function _arrayEach(arr, iterator) {
	        var index = -1,
	            length = arr.length;

	        while (++index < length) {
	            iterator(arr[index], index, arr);
	        }
	    }

	    function _map(arr, iterator) {
	        var index = -1,
	            length = arr.length,
	            result = Array(length);

	        while (++index < length) {
	            result[index] = iterator(arr[index], index, arr);
	        }
	        return result;
	    }

	    function _range(count) {
	        return _map(Array(count), function (v, i) { return i; });
	    }

	    function _reduce(arr, iterator, memo) {
	        _arrayEach(arr, function (x, i, a) {
	            memo = iterator(memo, x, i, a);
	        });
	        return memo;
	    }

	    function _forEachOf(object, iterator) {
	        _arrayEach(_keys(object), function (key) {
	            iterator(object[key], key);
	        });
	    }

	    function _indexOf(arr, item) {
	        for (var i = 0; i < arr.length; i++) {
	            if (arr[i] === item) return i;
	        }
	        return -1;
	    }

	    var _keys = Object.keys || function (obj) {
	        var keys = [];
	        for (var k in obj) {
	            if (obj.hasOwnProperty(k)) {
	                keys.push(k);
	            }
	        }
	        return keys;
	    };

	    function _keyIterator(coll) {
	        var i = -1;
	        var len;
	        var keys;
	        if (_isArrayLike(coll)) {
	            len = coll.length;
	            return function next() {
	                i++;
	                return i < len ? i : null;
	            };
	        } else {
	            keys = _keys(coll);
	            len = keys.length;
	            return function next() {
	                i++;
	                return i < len ? keys[i] : null;
	            };
	        }
	    }

	    // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
	    // This accumulates the arguments passed into an array, after a given index.
	    // From underscore.js (https://github.com/jashkenas/underscore/pull/2140).
	    function _restParam(func, startIndex) {
	        startIndex = startIndex == null ? func.length - 1 : +startIndex;
	        return function() {
	            var length = Math.max(arguments.length - startIndex, 0);
	            var rest = Array(length);
	            for (var index = 0; index < length; index++) {
	                rest[index] = arguments[index + startIndex];
	            }
	            switch (startIndex) {
	                case 0: return func.call(this, rest);
	                case 1: return func.call(this, arguments[0], rest);
	            }
	            // Currently unused but handle cases outside of the switch statement:
	            // var args = Array(startIndex + 1);
	            // for (index = 0; index < startIndex; index++) {
	            //     args[index] = arguments[index];
	            // }
	            // args[startIndex] = rest;
	            // return func.apply(this, args);
	        };
	    }

	    function _withoutIndex(iterator) {
	        return function (value, index, callback) {
	            return iterator(value, callback);
	        };
	    }

	    //// exported async module functions ////

	    //// nextTick implementation with browser-compatible fallback ////

	    // capture the global reference to guard against fakeTimer mocks
	    var _setImmediate = typeof setImmediate === 'function' && setImmediate;

	    var _delay = _setImmediate ? function(fn) {
	        // not a direct alias for IE10 compatibility
	        _setImmediate(fn);
	    } : function(fn) {
	        setTimeout(fn, 0);
	    };

	    if (typeof process === 'object' && typeof process.nextTick === 'function') {
	        async.nextTick = process.nextTick;
	    } else {
	        async.nextTick = _delay;
	    }
	    async.setImmediate = _setImmediate ? _delay : async.nextTick;


	    async.forEach =
	    async.each = function (arr, iterator, callback) {
	        return async.eachOf(arr, _withoutIndex(iterator), callback);
	    };

	    async.forEachSeries =
	    async.eachSeries = function (arr, iterator, callback) {
	        return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
	    };


	    async.forEachLimit =
	    async.eachLimit = function (arr, limit, iterator, callback) {
	        return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
	    };

	    async.forEachOf =
	    async.eachOf = function (object, iterator, callback) {
	        callback = _once(callback || noop);
	        object = object || [];

	        var iter = _keyIterator(object);
	        var key, completed = 0;

	        while ((key = iter()) != null) {
	            completed += 1;
	            iterator(object[key], key, only_once(done));
	        }

	        if (completed === 0) callback(null);

	        function done(err) {
	            completed--;
	            if (err) {
	                callback(err);
	            }
	            // Check key is null in case iterator isn't exhausted
	            // and done resolved synchronously.
	            else if (key === null && completed <= 0) {
	                callback(null);
	            }
	        }
	    };

	    async.forEachOfSeries =
	    async.eachOfSeries = function (obj, iterator, callback) {
	        callback = _once(callback || noop);
	        obj = obj || [];
	        var nextKey = _keyIterator(obj);
	        var key = nextKey();
	        function iterate() {
	            var sync = true;
	            if (key === null) {
	                return callback(null);
	            }
	            iterator(obj[key], key, only_once(function (err) {
	                if (err) {
	                    callback(err);
	                }
	                else {
	                    key = nextKey();
	                    if (key === null) {
	                        return callback(null);
	                    } else {
	                        if (sync) {
	                            async.setImmediate(iterate);
	                        } else {
	                            iterate();
	                        }
	                    }
	                }
	            }));
	            sync = false;
	        }
	        iterate();
	    };



	    async.forEachOfLimit =
	    async.eachOfLimit = function (obj, limit, iterator, callback) {
	        _eachOfLimit(limit)(obj, iterator, callback);
	    };

	    function _eachOfLimit(limit) {

	        return function (obj, iterator, callback) {
	            callback = _once(callback || noop);
	            obj = obj || [];
	            var nextKey = _keyIterator(obj);
	            if (limit <= 0) {
	                return callback(null);
	            }
	            var done = false;
	            var running = 0;
	            var errored = false;

	            (function replenish () {
	                if (done && running <= 0) {
	                    return callback(null);
	                }

	                while (running < limit && !errored) {
	                    var key = nextKey();
	                    if (key === null) {
	                        done = true;
	                        if (running <= 0) {
	                            callback(null);
	                        }
	                        return;
	                    }
	                    running += 1;
	                    iterator(obj[key], key, only_once(function (err) {
	                        running -= 1;
	                        if (err) {
	                            callback(err);
	                            errored = true;
	                        }
	                        else {
	                            replenish();
	                        }
	                    }));
	                }
	            })();
	        };
	    }


	    function doParallel(fn) {
	        return function (obj, iterator, callback) {
	            return fn(async.eachOf, obj, iterator, callback);
	        };
	    }
	    function doParallelLimit(fn) {
	        return function (obj, limit, iterator, callback) {
	            return fn(_eachOfLimit(limit), obj, iterator, callback);
	        };
	    }
	    function doSeries(fn) {
	        return function (obj, iterator, callback) {
	            return fn(async.eachOfSeries, obj, iterator, callback);
	        };
	    }

	    function _asyncMap(eachfn, arr, iterator, callback) {
	        callback = _once(callback || noop);
	        arr = arr || [];
	        var results = _isArrayLike(arr) ? [] : {};
	        eachfn(arr, function (value, index, callback) {
	            iterator(value, function (err, v) {
	                results[index] = v;
	                callback(err);
	            });
	        }, function (err) {
	            callback(err, results);
	        });
	    }

	    async.map = doParallel(_asyncMap);
	    async.mapSeries = doSeries(_asyncMap);
	    async.mapLimit = doParallelLimit(_asyncMap);

	    // reduce only has a series version, as doing reduce in parallel won't
	    // work in many situations.
	    async.inject =
	    async.foldl =
	    async.reduce = function (arr, memo, iterator, callback) {
	        async.eachOfSeries(arr, function (x, i, callback) {
	            iterator(memo, x, function (err, v) {
	                memo = v;
	                callback(err);
	            });
	        }, function (err) {
	            callback(err, memo);
	        });
	    };

	    async.foldr =
	    async.reduceRight = function (arr, memo, iterator, callback) {
	        var reversed = _map(arr, identity).reverse();
	        async.reduce(reversed, memo, iterator, callback);
	    };

	    async.transform = function (arr, memo, iterator, callback) {
	        if (arguments.length === 3) {
	            callback = iterator;
	            iterator = memo;
	            memo = _isArray(arr) ? [] : {};
	        }

	        async.eachOf(arr, function(v, k, cb) {
	            iterator(memo, v, k, cb);
	        }, function(err) {
	            callback(err, memo);
	        });
	    };

	    function _filter(eachfn, arr, iterator, callback) {
	        var results = [];
	        eachfn(arr, function (x, index, callback) {
	            iterator(x, function (v) {
	                if (v) {
	                    results.push({index: index, value: x});
	                }
	                callback();
	            });
	        }, function () {
	            callback(_map(results.sort(function (a, b) {
	                return a.index - b.index;
	            }), function (x) {
	                return x.value;
	            }));
	        });
	    }

	    async.select =
	    async.filter = doParallel(_filter);

	    async.selectLimit =
	    async.filterLimit = doParallelLimit(_filter);

	    async.selectSeries =
	    async.filterSeries = doSeries(_filter);

	    function _reject(eachfn, arr, iterator, callback) {
	        _filter(eachfn, arr, function(value, cb) {
	            iterator(value, function(v) {
	                cb(!v);
	            });
	        }, callback);
	    }
	    async.reject = doParallel(_reject);
	    async.rejectLimit = doParallelLimit(_reject);
	    async.rejectSeries = doSeries(_reject);

	    function _createTester(eachfn, check, getResult) {
	        return function(arr, limit, iterator, cb) {
	            function done() {
	                if (cb) cb(getResult(false, void 0));
	            }
	            function iteratee(x, _, callback) {
	                if (!cb) return callback();
	                iterator(x, function (v) {
	                    if (cb && check(v)) {
	                        cb(getResult(true, x));
	                        cb = iterator = false;
	                    }
	                    callback();
	                });
	            }
	            if (arguments.length > 3) {
	                eachfn(arr, limit, iteratee, done);
	            } else {
	                cb = iterator;
	                iterator = limit;
	                eachfn(arr, iteratee, done);
	            }
	        };
	    }

	    async.any =
	    async.some = _createTester(async.eachOf, toBool, identity);

	    async.someLimit = _createTester(async.eachOfLimit, toBool, identity);

	    async.all =
	    async.every = _createTester(async.eachOf, notId, notId);

	    async.everyLimit = _createTester(async.eachOfLimit, notId, notId);

	    function _findGetResult(v, x) {
	        return x;
	    }
	    async.detect = _createTester(async.eachOf, identity, _findGetResult);
	    async.detectSeries = _createTester(async.eachOfSeries, identity, _findGetResult);
	    async.detectLimit = _createTester(async.eachOfLimit, identity, _findGetResult);

	    async.sortBy = function (arr, iterator, callback) {
	        async.map(arr, function (x, callback) {
	            iterator(x, function (err, criteria) {
	                if (err) {
	                    callback(err);
	                }
	                else {
	                    callback(null, {value: x, criteria: criteria});
	                }
	            });
	        }, function (err, results) {
	            if (err) {
	                return callback(err);
	            }
	            else {
	                callback(null, _map(results.sort(comparator), function (x) {
	                    return x.value;
	                }));
	            }

	        });

	        function comparator(left, right) {
	            var a = left.criteria, b = right.criteria;
	            return a < b ? -1 : a > b ? 1 : 0;
	        }
	    };

	    async.auto = function (tasks, concurrency, callback) {
	        if (typeof arguments[1] === 'function') {
	            // concurrency is optional, shift the args.
	            callback = concurrency;
	            concurrency = null;
	        }
	        callback = _once(callback || noop);
	        var keys = _keys(tasks);
	        var remainingTasks = keys.length;
	        if (!remainingTasks) {
	            return callback(null);
	        }
	        if (!concurrency) {
	            concurrency = remainingTasks;
	        }

	        var results = {};
	        var runningTasks = 0;

	        var hasError = false;

	        var listeners = [];
	        function addListener(fn) {
	            listeners.unshift(fn);
	        }
	        function removeListener(fn) {
	            var idx = _indexOf(listeners, fn);
	            if (idx >= 0) listeners.splice(idx, 1);
	        }
	        function taskComplete() {
	            remainingTasks--;
	            _arrayEach(listeners.slice(0), function (fn) {
	                fn();
	            });
	        }

	        addListener(function () {
	            if (!remainingTasks) {
	                callback(null, results);
	            }
	        });

	        _arrayEach(keys, function (k) {
	            if (hasError) return;
	            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
	            var taskCallback = _restParam(function(err, args) {
	                runningTasks--;
	                if (args.length <= 1) {
	                    args = args[0];
	                }
	                if (err) {
	                    var safeResults = {};
	                    _forEachOf(results, function(val, rkey) {
	                        safeResults[rkey] = val;
	                    });
	                    safeResults[k] = args;
	                    hasError = true;

	                    callback(err, safeResults);
	                }
	                else {
	                    results[k] = args;
	                    async.setImmediate(taskComplete);
	                }
	            });
	            var requires = task.slice(0, task.length - 1);
	            // prevent dead-locks
	            var len = requires.length;
	            var dep;
	            while (len--) {
	                if (!(dep = tasks[requires[len]])) {
	                    throw new Error('Has nonexistent dependency in ' + requires.join(', '));
	                }
	                if (_isArray(dep) && _indexOf(dep, k) >= 0) {
	                    throw new Error('Has cyclic dependencies');
	                }
	            }
	            function ready() {
	                return runningTasks < concurrency && _reduce(requires, function (a, x) {
	                    return (a && results.hasOwnProperty(x));
	                }, true) && !results.hasOwnProperty(k);
	            }
	            if (ready()) {
	                runningTasks++;
	                task[task.length - 1](taskCallback, results);
	            }
	            else {
	                addListener(listener);
	            }
	            function listener() {
	                if (ready()) {
	                    runningTasks++;
	                    removeListener(listener);
	                    task[task.length - 1](taskCallback, results);
	                }
	            }
	        });
	    };



	    async.retry = function(times, task, callback) {
	        var DEFAULT_TIMES = 5;
	        var DEFAULT_INTERVAL = 0;

	        var attempts = [];

	        var opts = {
	            times: DEFAULT_TIMES,
	            interval: DEFAULT_INTERVAL
	        };

	        function parseTimes(acc, t){
	            if(typeof t === 'number'){
	                acc.times = parseInt(t, 10) || DEFAULT_TIMES;
	            } else if(typeof t === 'object'){
	                acc.times = parseInt(t.times, 10) || DEFAULT_TIMES;
	                acc.interval = parseInt(t.interval, 10) || DEFAULT_INTERVAL;
	            } else {
	                throw new Error('Unsupported argument type for \'times\': ' + typeof t);
	            }
	        }

	        var length = arguments.length;
	        if (length < 1 || length > 3) {
	            throw new Error('Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)');
	        } else if (length <= 2 && typeof times === 'function') {
	            callback = task;
	            task = times;
	        }
	        if (typeof times !== 'function') {
	            parseTimes(opts, times);
	        }
	        opts.callback = callback;
	        opts.task = task;

	        function wrappedTask(wrappedCallback, wrappedResults) {
	            function retryAttempt(task, finalAttempt) {
	                return function(seriesCallback) {
	                    task(function(err, result){
	                        seriesCallback(!err || finalAttempt, {err: err, result: result});
	                    }, wrappedResults);
	                };
	            }

	            function retryInterval(interval){
	                return function(seriesCallback){
	                    setTimeout(function(){
	                        seriesCallback(null);
	                    }, interval);
	                };
	            }

	            while (opts.times) {

	                var finalAttempt = !(opts.times-=1);
	                attempts.push(retryAttempt(opts.task, finalAttempt));
	                if(!finalAttempt && opts.interval > 0){
	                    attempts.push(retryInterval(opts.interval));
	                }
	            }

	            async.series(attempts, function(done, data){
	                data = data[data.length - 1];
	                (wrappedCallback || opts.callback)(data.err, data.result);
	            });
	        }

	        // If a callback is passed, run this as a controll flow
	        return opts.callback ? wrappedTask() : wrappedTask;
	    };

	    async.waterfall = function (tasks, callback) {
	        callback = _once(callback || noop);
	        if (!_isArray(tasks)) {
	            var err = new Error('First argument to waterfall must be an array of functions');
	            return callback(err);
	        }
	        if (!tasks.length) {
	            return callback();
	        }
	        function wrapIterator(iterator) {
	            return _restParam(function (err, args) {
	                if (err) {
	                    callback.apply(null, [err].concat(args));
	                }
	                else {
	                    var next = iterator.next();
	                    if (next) {
	                        args.push(wrapIterator(next));
	                    }
	                    else {
	                        args.push(callback);
	                    }
	                    ensureAsync(iterator).apply(null, args);
	                }
	            });
	        }
	        wrapIterator(async.iterator(tasks))();
	    };

	    function _parallel(eachfn, tasks, callback) {
	        callback = callback || noop;
	        var results = _isArrayLike(tasks) ? [] : {};

	        eachfn(tasks, function (task, key, callback) {
	            task(_restParam(function (err, args) {
	                if (args.length <= 1) {
	                    args = args[0];
	                }
	                results[key] = args;
	                callback(err);
	            }));
	        }, function (err) {
	            callback(err, results);
	        });
	    }

	    async.parallel = function (tasks, callback) {
	        _parallel(async.eachOf, tasks, callback);
	    };

	    async.parallelLimit = function(tasks, limit, callback) {
	        _parallel(_eachOfLimit(limit), tasks, callback);
	    };

	    async.series = function(tasks, callback) {
	        _parallel(async.eachOfSeries, tasks, callback);
	    };

	    async.iterator = function (tasks) {
	        function makeCallback(index) {
	            function fn() {
	                if (tasks.length) {
	                    tasks[index].apply(null, arguments);
	                }
	                return fn.next();
	            }
	            fn.next = function () {
	                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
	            };
	            return fn;
	        }
	        return makeCallback(0);
	    };

	    async.apply = _restParam(function (fn, args) {
	        return _restParam(function (callArgs) {
	            return fn.apply(
	                null, args.concat(callArgs)
	            );
	        });
	    });

	    function _concat(eachfn, arr, fn, callback) {
	        var result = [];
	        eachfn(arr, function (x, index, cb) {
	            fn(x, function (err, y) {
	                result = result.concat(y || []);
	                cb(err);
	            });
	        }, function (err) {
	            callback(err, result);
	        });
	    }
	    async.concat = doParallel(_concat);
	    async.concatSeries = doSeries(_concat);

	    async.whilst = function (test, iterator, callback) {
	        callback = callback || noop;
	        if (test()) {
	            var next = _restParam(function(err, args) {
	                if (err) {
	                    callback(err);
	                } else if (test.apply(this, args)) {
	                    iterator(next);
	                } else {
	                    callback.apply(null, [null].concat(args));
	                }
	            });
	            iterator(next);
	        } else {
	            callback(null);
	        }
	    };

	    async.doWhilst = function (iterator, test, callback) {
	        var calls = 0;
	        return async.whilst(function() {
	            return ++calls <= 1 || test.apply(this, arguments);
	        }, iterator, callback);
	    };

	    async.until = function (test, iterator, callback) {
	        return async.whilst(function() {
	            return !test.apply(this, arguments);
	        }, iterator, callback);
	    };

	    async.doUntil = function (iterator, test, callback) {
	        return async.doWhilst(iterator, function() {
	            return !test.apply(this, arguments);
	        }, callback);
	    };

	    async.during = function (test, iterator, callback) {
	        callback = callback || noop;

	        var next = _restParam(function(err, args) {
	            if (err) {
	                callback(err);
	            } else {
	                args.push(check);
	                test.apply(this, args);
	            }
	        });

	        var check = function(err, truth) {
	            if (err) {
	                callback(err);
	            } else if (truth) {
	                iterator(next);
	            } else {
	                callback(null);
	            }
	        };

	        test(check);
	    };

	    async.doDuring = function (iterator, test, callback) {
	        var calls = 0;
	        async.during(function(next) {
	            if (calls++ < 1) {
	                next(null, true);
	            } else {
	                test.apply(this, arguments);
	            }
	        }, iterator, callback);
	    };

	    function _queue(worker, concurrency, payload) {
	        if (concurrency == null) {
	            concurrency = 1;
	        }
	        else if(concurrency === 0) {
	            throw new Error('Concurrency must not be zero');
	        }
	        function _insert(q, data, pos, callback) {
	            if (callback != null && typeof callback !== "function") {
	                throw new Error("task callback must be a function");
	            }
	            q.started = true;
	            if (!_isArray(data)) {
	                data = [data];
	            }
	            if(data.length === 0 && q.idle()) {
	                // call drain immediately if there are no tasks
	                return async.setImmediate(function() {
	                    q.drain();
	                });
	            }
	            _arrayEach(data, function(task) {
	                var item = {
	                    data: task,
	                    callback: callback || noop
	                };

	                if (pos) {
	                    q.tasks.unshift(item);
	                } else {
	                    q.tasks.push(item);
	                }

	                if (q.tasks.length === q.concurrency) {
	                    q.saturated();
	                }
	            });
	            async.setImmediate(q.process);
	        }
	        function _next(q, tasks) {
	            return function(){
	                workers -= 1;

	                var removed = false;
	                var args = arguments;
	                _arrayEach(tasks, function (task) {
	                    _arrayEach(workersList, function (worker, index) {
	                        if (worker === task && !removed) {
	                            workersList.splice(index, 1);
	                            removed = true;
	                        }
	                    });

	                    task.callback.apply(task, args);
	                });
	                if (q.tasks.length + workers === 0) {
	                    q.drain();
	                }
	                q.process();
	            };
	        }

	        var workers = 0;
	        var workersList = [];
	        var q = {
	            tasks: [],
	            concurrency: concurrency,
	            payload: payload,
	            saturated: noop,
	            empty: noop,
	            drain: noop,
	            started: false,
	            paused: false,
	            push: function (data, callback) {
	                _insert(q, data, false, callback);
	            },
	            kill: function () {
	                q.drain = noop;
	                q.tasks = [];
	            },
	            unshift: function (data, callback) {
	                _insert(q, data, true, callback);
	            },
	            process: function () {
	                while(!q.paused && workers < q.concurrency && q.tasks.length){

	                    var tasks = q.payload ?
	                        q.tasks.splice(0, q.payload) :
	                        q.tasks.splice(0, q.tasks.length);

	                    var data = _map(tasks, function (task) {
	                        return task.data;
	                    });

	                    if (q.tasks.length === 0) {
	                        q.empty();
	                    }
	                    workers += 1;
	                    workersList.push(tasks[0]);
	                    var cb = only_once(_next(q, tasks));
	                    worker(data, cb);
	                }
	            },
	            length: function () {
	                return q.tasks.length;
	            },
	            running: function () {
	                return workers;
	            },
	            workersList: function () {
	                return workersList;
	            },
	            idle: function() {
	                return q.tasks.length + workers === 0;
	            },
	            pause: function () {
	                q.paused = true;
	            },
	            resume: function () {
	                if (q.paused === false) { return; }
	                q.paused = false;
	                var resumeCount = Math.min(q.concurrency, q.tasks.length);
	                // Need to call q.process once per concurrent
	                // worker to preserve full concurrency after pause
	                for (var w = 1; w <= resumeCount; w++) {
	                    async.setImmediate(q.process);
	                }
	            }
	        };
	        return q;
	    }

	    async.queue = function (worker, concurrency) {
	        var q = _queue(function (items, cb) {
	            worker(items[0], cb);
	        }, concurrency, 1);

	        return q;
	    };

	    async.priorityQueue = function (worker, concurrency) {

	        function _compareTasks(a, b){
	            return a.priority - b.priority;
	        }

	        function _binarySearch(sequence, item, compare) {
	            var beg = -1,
	                end = sequence.length - 1;
	            while (beg < end) {
	                var mid = beg + ((end - beg + 1) >>> 1);
	                if (compare(item, sequence[mid]) >= 0) {
	                    beg = mid;
	                } else {
	                    end = mid - 1;
	                }
	            }
	            return beg;
	        }

	        function _insert(q, data, priority, callback) {
	            if (callback != null && typeof callback !== "function") {
	                throw new Error("task callback must be a function");
	            }
	            q.started = true;
	            if (!_isArray(data)) {
	                data = [data];
	            }
	            if(data.length === 0) {
	                // call drain immediately if there are no tasks
	                return async.setImmediate(function() {
	                    q.drain();
	                });
	            }
	            _arrayEach(data, function(task) {
	                var item = {
	                    data: task,
	                    priority: priority,
	                    callback: typeof callback === 'function' ? callback : noop
	                };

	                q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

	                if (q.tasks.length === q.concurrency) {
	                    q.saturated();
	                }
	                async.setImmediate(q.process);
	            });
	        }

	        // Start with a normal queue
	        var q = async.queue(worker, concurrency);

	        // Override push to accept second parameter representing priority
	        q.push = function (data, priority, callback) {
	            _insert(q, data, priority, callback);
	        };

	        // Remove unshift function
	        delete q.unshift;

	        return q;
	    };

	    async.cargo = function (worker, payload) {
	        return _queue(worker, 1, payload);
	    };

	    function _console_fn(name) {
	        return _restParam(function (fn, args) {
	            fn.apply(null, args.concat([_restParam(function (err, args) {
	                if (typeof console === 'object') {
	                    if (err) {
	                        if (console.error) {
	                            console.error(err);
	                        }
	                    }
	                    else if (console[name]) {
	                        _arrayEach(args, function (x) {
	                            console[name](x);
	                        });
	                    }
	                }
	            })]));
	        });
	    }
	    async.log = _console_fn('log');
	    async.dir = _console_fn('dir');
	    /*async.info = _console_fn('info');
	    async.warn = _console_fn('warn');
	    async.error = _console_fn('error');*/

	    async.memoize = function (fn, hasher) {
	        var memo = {};
	        var queues = {};
	        var has = Object.prototype.hasOwnProperty;
	        hasher = hasher || identity;
	        var memoized = _restParam(function memoized(args) {
	            var callback = args.pop();
	            var key = hasher.apply(null, args);
	            if (has.call(memo, key)) {   
	                async.setImmediate(function () {
	                    callback.apply(null, memo[key]);
	                });
	            }
	            else if (has.call(queues, key)) {
	                queues[key].push(callback);
	            }
	            else {
	                queues[key] = [callback];
	                fn.apply(null, args.concat([_restParam(function (args) {
	                    memo[key] = args;
	                    var q = queues[key];
	                    delete queues[key];
	                    for (var i = 0, l = q.length; i < l; i++) {
	                        q[i].apply(null, args);
	                    }
	                })]));
	            }
	        });
	        memoized.memo = memo;
	        memoized.unmemoized = fn;
	        return memoized;
	    };

	    async.unmemoize = function (fn) {
	        return function () {
	            return (fn.unmemoized || fn).apply(null, arguments);
	        };
	    };

	    function _times(mapper) {
	        return function (count, iterator, callback) {
	            mapper(_range(count), iterator, callback);
	        };
	    }

	    async.times = _times(async.map);
	    async.timesSeries = _times(async.mapSeries);
	    async.timesLimit = function (count, limit, iterator, callback) {
	        return async.mapLimit(_range(count), limit, iterator, callback);
	    };

	    async.seq = function (/* functions... */) {
	        var fns = arguments;
	        return _restParam(function (args) {
	            var that = this;

	            var callback = args[args.length - 1];
	            if (typeof callback == 'function') {
	                args.pop();
	            } else {
	                callback = noop;
	            }

	            async.reduce(fns, args, function (newargs, fn, cb) {
	                fn.apply(that, newargs.concat([_restParam(function (err, nextargs) {
	                    cb(err, nextargs);
	                })]));
	            },
	            function (err, results) {
	                callback.apply(that, [err].concat(results));
	            });
	        });
	    };

	    async.compose = function (/* functions... */) {
	        return async.seq.apply(null, Array.prototype.reverse.call(arguments));
	    };


	    function _applyEach(eachfn) {
	        return _restParam(function(fns, args) {
	            var go = _restParam(function(args) {
	                var that = this;
	                var callback = args.pop();
	                return eachfn(fns, function (fn, _, cb) {
	                    fn.apply(that, args.concat([cb]));
	                },
	                callback);
	            });
	            if (args.length) {
	                return go.apply(this, args);
	            }
	            else {
	                return go;
	            }
	        });
	    }

	    async.applyEach = _applyEach(async.eachOf);
	    async.applyEachSeries = _applyEach(async.eachOfSeries);


	    async.forever = function (fn, callback) {
	        var done = only_once(callback || noop);
	        var task = ensureAsync(fn);
	        function next(err) {
	            if (err) {
	                return done(err);
	            }
	            task(next);
	        }
	        next();
	    };

	    function ensureAsync(fn) {
	        return _restParam(function (args) {
	            var callback = args.pop();
	            args.push(function () {
	                var innerArgs = arguments;
	                if (sync) {
	                    async.setImmediate(function () {
	                        callback.apply(null, innerArgs);
	                    });
	                } else {
	                    callback.apply(null, innerArgs);
	                }
	            });
	            var sync = true;
	            fn.apply(this, args);
	            sync = false;
	        });
	    }

	    async.ensureAsync = ensureAsync;

	    async.constant = _restParam(function(values) {
	        var args = [null].concat(values);
	        return function (callback) {
	            return callback.apply(this, args);
	        };
	    });

	    async.wrapSync =
	    async.asyncify = function asyncify(func) {
	        return _restParam(function (args) {
	            var callback = args.pop();
	            var result;
	            try {
	                result = func.apply(this, args);
	            } catch (e) {
	                return callback(e);
	            }
	            // if result is Promise object
	            if (_isObject(result) && typeof result.then === "function") {
	                result.then(function(value) {
	                    callback(null, value);
	                })["catch"](function(err) {
	                    callback(err.message ? err : new Error(err));
	                });
	            } else {
	                callback(null, result);
	            }
	        });
	    };

	    // Node.js
	    if (typeof module === 'object' && module.exports) {
	        module.exports = async;
	    }
	    // AMD / RequireJS
	    else if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	            return async;
	        }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    }
	    // included directly via <script> tag
	    else {
	        root.async = async;
	    }

	}());


/***/ }),
/* 12 */
/***/ (function(module, exports) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	/**
	 * Helper to split string by length
	 * @param str
	 * @param len
	 * @returns {Array}
	 */
	var chunkString = function chunkString(str, len) {
	  var size = Math.ceil(str.length / len);
	  var ret = new Array(size);
	  var offset = null;

	  for (var i = 0; i < size; i++) {
	    offset = i * len;
	    ret[i] = str.substring(offset, offset + len);
	  }

	  return ret;
	};

	var ESCAPE_SEQUENCE_SIZE = 3;

	var chunkEscapedString = function chunkEscapedString(str, len) {
	  var chunked = [];

	  while (str.length > 0) {
	    var substr = str.substring(0, len);
	    var lastEscape = substr.lastIndexOf('%');
	    var sliceIndex = lastEscape > 0 && len - lastEscape < ESCAPE_SEQUENCE_SIZE ? lastEscape : len;

	    var chunk = str.slice(0, sliceIndex);

	    if (chunk.length > len) {
	      console.log('Chunk of size: ' + chunk.length + ' exceeds size: ' + len);
	    }

	    chunked.push(chunk);
	    str = str.slice(sliceIndex);
	  }

	  return chunked;
	};

	/**
	 * Get unique elements of an array
	 * @param array
	 * @returns {Array}
	 */
	var getUnique = function getUnique(array) {
	  var u = {};
	  var a = [];
	  for (var i = 0, l = array.length; i < l; ++i) {
	    if (u.hasOwnProperty(array[i])) {
	      continue;
	    }
	    a.push(array[i]);
	    u[array[i]] = 1;
	  }
	  return a;
	};

	/**
	 * Helper to deep copy an object
	 * @param o
	 */
	var deepCopy = function deepCopy(o) {
	  if (o === undefined || o === null) {
	    return null;
	  }
	  return JSON.parse(JSON.stringify(o));
	};

	/**
	 * Recursively merge object, giving the last one precedence
	 * @param target
	 * @param source
	 * @returns {*}
	 */
	var merge = function merge(target, source) {
	  if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== 'object') {
	    target = {};
	  }

	  for (var property in source) {
	    if (source.hasOwnProperty(property)) {
	      var sourceProperty = source[property];

	      if ((typeof sourceProperty === 'undefined' ? 'undefined' : _typeof(sourceProperty)) === 'object') {
	        target[property] = merge(target[property], sourceProperty);
	        continue;
	      }

	      target[property] = sourceProperty;
	    }
	  }

	  for (var a = 2, l = arguments.length; a < l; a++) {
	    merge(target, arguments[a]);
	  }

	  return target;
	};

	/**
	 * Returns the version of Internet Explorer or a -1
	 * (indicating the use of another browser).
	 * @returns {number}
	 */
	var getInternetExplorerVersion = function getInternetExplorerVersion(navigatorAppName, userAgent) {
	  var rv = -1; // Return value assumes failure.
	  if (navigatorAppName == 'Microsoft Internet Explorer') {
	    var ua = userAgent;
	    var re = new RegExp('MSIE ([0-9]{1,}[\.0-9]{0,})');
	    if (re.exec(ua) != null) rv = parseFloat(RegExp.$1);
	  }
	  return rv;
	};

	var startsWithOneOf = function startsWithOneOf(target, array) {
	  var len = parseInt(array.length, 10) || 0;
	  if (len === 0) {
	    return false;
	  }

	  var k = 0;

	  var currentElement = null;
	  while (k < len) {
	    currentElement = array[k];
	    if (target.startsWith && target.startsWith(currentElement)) {
	      return true;
	    }
	    k++;
	  }

	  return false;
	};

	module.exports = {
	  chunkString: chunkString,
	  chunkEscapedString: chunkEscapedString,
	  deepCopy: deepCopy,
	  merge: merge,
	  getInternetExplorerVersion: getInternetExplorerVersion,
	  getUnique: getUnique,
	  startsWithOneOf: startsWithOneOf
	};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;var LZString=function(){function o(o,r){if(!t[o]){t[o]={};for(var n=0;n<o.length;n++)t[o][o.charAt(n)]=n}return t[o][r]}var r=String.fromCharCode,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",t={},i={compressToBase64:function(o){if(null==o)return"";var r=i._compress(o,6,function(o){return n.charAt(o)});switch(r.length%4){default:case 0:return r;case 1:return r+"===";case 2:return r+"==";case 3:return r+"="}},decompressFromBase64:function(r){return null==r?"":""==r?null:i._decompress(r.length,32,function(e){return o(n,r.charAt(e))})},compressToUTF16:function(o){return null==o?"":i._compress(o,15,function(o){return r(o+32)})+" "},decompressFromUTF16:function(o){return null==o?"":""==o?null:i._decompress(o.length,16384,function(r){return o.charCodeAt(r)-32})},compressToUint8Array:function(o){for(var r=i.compress(o),n=new Uint8Array(2*r.length),e=0,t=r.length;t>e;e++){var s=r.charCodeAt(e);n[2*e]=s>>>8,n[2*e+1]=s%256}return n},decompressFromUint8Array:function(o){if(null===o||void 0===o)return i.decompress(o);for(var n=new Array(o.length/2),e=0,t=n.length;t>e;e++)n[e]=256*o[2*e]+o[2*e+1];var s=[];return n.forEach(function(o){s.push(r(o))}),i.decompress(s.join(""))},compressToEncodedURIComponent:function(o){return null==o?"":i._compress(o,6,function(o){return e.charAt(o)})},decompressFromEncodedURIComponent:function(r){return null==r?"":""==r?null:(r=r.replace(/ /g,"+"),i._decompress(r.length,32,function(n){return o(e,r.charAt(n))}))},compress:function(o){return i._compress(o,16,function(o){return r(o)})},_compress:function(o,r,n){if(null==o)return"";var e,t,i,s={},p={},u="",c="",a="",l=2,f=3,h=2,d=[],m=0,v=0;for(i=0;i<o.length;i+=1)if(u=o.charAt(i),Object.prototype.hasOwnProperty.call(s,u)||(s[u]=f++,p[u]=!0),c=a+u,Object.prototype.hasOwnProperty.call(s,c))a=c;else{if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++),s[c]=f++,a=String(u)}if(""!==a){if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++)}for(t=2,e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;for(;;){if(m<<=1,v==r-1){d.push(n(m));break}v++}return d.join("")},decompress:function(o){return null==o?"":""==o?null:i._decompress(o.length,32768,function(r){return o.charCodeAt(r)})},_decompress:function(o,n,e){var t,i,s,p,u,c,a,l,f=[],h=4,d=4,m=3,v="",w=[],A={val:e(0),position:n,index:1};for(i=0;3>i;i+=1)f[i]=i;for(p=0,c=Math.pow(2,2),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(t=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 2:return""}for(f[3]=l,s=l,w.push(l);;){if(A.index>o)return"";for(p=0,c=Math.pow(2,m),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(l=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 2:return w.join("")}if(0==h&&(h=Math.pow(2,m),m++),f[l])v=f[l];else{if(l!==d)return null;v=s+s.charAt(0)}w.push(v),f[d++]=s+v.charAt(0),h--,s=v,0==h&&(h=Math.pow(2,m),m++)}}};return i}(); true?!(__WEBPACK_AMD_DEFINE_RESULT__ = function(){return LZString}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):"undefined"!=typeof module&&null!=module&&(module.exports=LZString);


/***/ }),
/* 14 */
/***/ (function(module, exports) {

	module.exports = {
		"name": "gb-tracker-client",
		"version": "3.4.1",
		"description": "GroupBy client-side event tracker",
		"keywords": [
			"groupby",
			"tracker",
			"recommendations"
		],
		"repository": {
			"type": "git",
			"url": "git+https://github.com/groupby/gb-tracker-client.git"
		},
		"main": "bin/gb-tracker-client.js",
		"scripts": {
			"test": "gulp test",
			"build": "babel lib --out-dir build",
			"coverage:codacy": "cat ./coverage/lcov.info | codacy-coverage"
		},
		"engines": {
			"node": ">=6"
		},
		"author": "Eric Hacke",
		"license": "MIT",
		"devDependencies": {
			"babel-cli": "^6.24.1",
			"babel-core": "^6.21.0",
			"babel-loader": "^6.2.10",
			"babel-preset-latest": "^6.16.0",
			"chai": "^3.5.0",
			"codacy-coverage": "^2.0.0",
			"eslint-plugin-no-only-tests": "^1.1.0",
			"glob": "^7.1.1",
			"gulp": "^3.9.1",
			"gulp-eslint": "^3.0.1",
			"gulp-exec": "^2.1.3",
			"gulp-if": "^2.0.2",
			"gulp-istanbul": "^1.1.1",
			"gulp-mocha": "^3.0.1",
			"gulp-util": "^3.0.7",
			"istanbul": "^0.4.3",
			"jsdom": "^9.9.1",
			"json-loader": "^0.5.4",
			"lodash": "^4.16.6",
			"mocha": "^3.1.2",
			"moment": "^2.17.1",
			"stream-combiner2": "^1.1.1",
			"stringify-object": "3.0.0",
			"supertest": "^2.0.1",
			"supertest-as-promised": "^4.0.2",
			"webpack": "^2.4.1",
			"webpack-stream": "^3.2.0"
		},
		"dependencies": {
			"cookies-js": "^1.2.3",
			"deep-diff": "^0.3.4",
			"lz-string": "^1.4.4",
			"schema-inspector": "^1.6.8",
			"uuid": "^3.0.1"
		}
	};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*
	 * Cookies.js - 1.2.3
	 * https://github.com/ScottHamper/Cookies
	 *
	 * This is free and unencumbered software released into the public domain.
	 */
	(function (global, undefined) {
	    'use strict';

	    var factory = function (window) {
	        if (typeof window.document !== 'object') {
	            throw new Error('Cookies.js requires a `window` with a `document` object');
	        }

	        var Cookies = function (key, value, options) {
	            return arguments.length === 1 ?
	                Cookies.get(key) : Cookies.set(key, value, options);
	        };

	        // Allows for setter injection in unit tests
	        Cookies._document = window.document;

	        // Used to ensure cookie keys do not collide with
	        // built-in `Object` properties
	        Cookies._cacheKeyPrefix = 'cookey.'; // Hurr hurr, :)
	        
	        Cookies._maxExpireDate = new Date('Fri, 31 Dec 9999 23:59:59 UTC');

	        Cookies.defaults = {
	            path: '/',
	            secure: false
	        };

	        Cookies.get = function (key) {
	            if (Cookies._cachedDocumentCookie !== Cookies._document.cookie) {
	                Cookies._renewCache();
	            }
	            
	            var value = Cookies._cache[Cookies._cacheKeyPrefix + key];

	            return value === undefined ? undefined : decodeURIComponent(value);
	        };

	        Cookies.set = function (key, value, options) {
	            options = Cookies._getExtendedOptions(options);
	            options.expires = Cookies._getExpiresDate(value === undefined ? -1 : options.expires);

	            Cookies._document.cookie = Cookies._generateCookieString(key, value, options);

	            return Cookies;
	        };

	        Cookies.expire = function (key, options) {
	            return Cookies.set(key, undefined, options);
	        };

	        Cookies._getExtendedOptions = function (options) {
	            return {
	                path: options && options.path || Cookies.defaults.path,
	                domain: options && options.domain || Cookies.defaults.domain,
	                expires: options && options.expires || Cookies.defaults.expires,
	                secure: options && options.secure !== undefined ?  options.secure : Cookies.defaults.secure
	            };
	        };

	        Cookies._isValidDate = function (date) {
	            return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
	        };

	        Cookies._getExpiresDate = function (expires, now) {
	            now = now || new Date();

	            if (typeof expires === 'number') {
	                expires = expires === Infinity ?
	                    Cookies._maxExpireDate : new Date(now.getTime() + expires * 1000);
	            } else if (typeof expires === 'string') {
	                expires = new Date(expires);
	            }

	            if (expires && !Cookies._isValidDate(expires)) {
	                throw new Error('`expires` parameter cannot be converted to a valid Date instance');
	            }

	            return expires;
	        };

	        Cookies._generateCookieString = function (key, value, options) {
	            key = key.replace(/[^#$&+\^`|]/g, encodeURIComponent);
	            key = key.replace(/\(/g, '%28').replace(/\)/g, '%29');
	            value = (value + '').replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent);
	            options = options || {};

	            var cookieString = key + '=' + value;
	            cookieString += options.path ? ';path=' + options.path : '';
	            cookieString += options.domain ? ';domain=' + options.domain : '';
	            cookieString += options.expires ? ';expires=' + options.expires.toUTCString() : '';
	            cookieString += options.secure ? ';secure' : '';

	            return cookieString;
	        };

	        Cookies._getCacheFromString = function (documentCookie) {
	            var cookieCache = {};
	            var cookiesArray = documentCookie ? documentCookie.split('; ') : [];

	            for (var i = 0; i < cookiesArray.length; i++) {
	                var cookieKvp = Cookies._getKeyValuePairFromCookieString(cookiesArray[i]);

	                if (cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] === undefined) {
	                    cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] = cookieKvp.value;
	                }
	            }

	            return cookieCache;
	        };

	        Cookies._getKeyValuePairFromCookieString = function (cookieString) {
	            // "=" is a valid character in a cookie value according to RFC6265, so cannot `split('=')`
	            var separatorIndex = cookieString.indexOf('=');

	            // IE omits the "=" when the cookie value is an empty string
	            separatorIndex = separatorIndex < 0 ? cookieString.length : separatorIndex;

	            var key = cookieString.substr(0, separatorIndex);
	            var decodedKey;
	            try {
	                decodedKey = decodeURIComponent(key);
	            } catch (e) {
	                if (console && typeof console.error === 'function') {
	                    console.error('Could not decode cookie with key "' + key + '"', e);
	                }
	            }
	            
	            return {
	                key: decodedKey,
	                value: cookieString.substr(separatorIndex + 1) // Defer decoding value until accessed
	            };
	        };

	        Cookies._renewCache = function () {
	            Cookies._cache = Cookies._getCacheFromString(Cookies._document.cookie);
	            Cookies._cachedDocumentCookie = Cookies._document.cookie;
	        };

	        Cookies._areEnabled = function () {
	            var testKey = 'cookies.js';
	            var areEnabled = Cookies.set(testKey, 1).get(testKey) === '1';
	            Cookies.expire(testKey);
	            return areEnabled;
	        };

	        Cookies.enabled = Cookies._areEnabled();

	        return Cookies;
	    };
	    var cookiesExport = (global && typeof global.document === 'object') ? factory(global) : factory;

	    // AMD support
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_RESULT__ = function () { return cookiesExport; }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    // CommonJS/Node.js support
	    } else if (typeof exports === 'object') {
	        // Support Node.js specific `module.exports` (which can be a function)
	        if (typeof module === 'object' && typeof module.exports === 'object') {
	            exports = module.exports = cookiesExport;
	        }
	        // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
	        exports.Cookies = cookiesExport;
	    } else {
	        global.Cookies = cookiesExport;
	    }
	})(typeof window === 'undefined' ? this : window);

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(17);
	module.exports = {
	  validation: {
	    type: 'object',
	    properties: {
	      clientVersion: {
	        type: 'object',
	        properties: {
	          raw: {
	            type: 'string'
	          },
	          major: {
	            type: 'integer',
	            optional: true
	          },
	          minor: {
	            type: 'integer',
	            optional: true
	          },
	          patch: {
	            type: 'integer',
	            optional: true
	          },
	          prerelease: {
	            type: 'array',
	            items: {
	              type: 'string'
	            },
	            optional: true
	          },
	          build: {
	            type: 'array',
	            items: {
	              type: 'string'
	            },
	            optional: true
	          },
	          version: {
	            type: 'string',
	            optional: true
	          }
	        },
	        strict: true
	      },
	      eventType: {
	        type: 'string'
	      },
	      customer: {
	        type: 'object',
	        properties: {
	          id: {
	            type: 'string'
	          },
	          area: {
	            type: 'string',
	            optional: false
	          }
	        },
	        strict: true
	      },
	      cart: {
	        type: 'object',
	        properties: {
	          id: {
	            type: 'string',
	            optional: true
	          },
	          items: {
	            type: 'array',
	            items: {
	              type: 'object',
	              properties: {
	                category: {
	                  type: 'string',
	                  optional: true
	                },
	                collection: {
	                  type: 'string',
	                  optional: false
	                },
	                title: {
	                  type: 'string'
	                },
	                sku: {
	                  type: 'string',
	                  optional: true
	                },
	                productId: {
	                  type: 'string'
	                },
	                parentId: {
	                  type: 'string',
	                  optional: true
	                },
	                margin: {
	                  type: 'number',
	                  optional: true
	                },
	                price: {
	                  type: 'number'
	                },
	                quantity: {
	                  type: 'integer'
	                },
	                metadata: {
	                  type: 'array',
	                  items: {
	                    type: 'object',
	                    properties: {
	                      key: {
	                        type: 'string'
	                      },
	                      value: {
	                        type: 'string'
	                      }
	                    },
	                    strict: true
	                  },
	                  optional: true
	                }
	              },
	              strict: true
	            }
	          },
	          metadata: {
	            type: 'array',
	            items: {
	              type: 'object',
	              properties: {
	                key: {
	                  type: 'string'
	                },
	                value: {
	                  type: 'string'
	                }
	              },
	              strict: true
	            },
	            optional: true
	          }
	        },
	        strict: true
	      },
	      visit: {
	        type: 'object',
	        properties: {
	          customerData: {
	            type: 'object',
	            properties: {
	              visitorId: {
	                type: 'string'
	              },
	              sessionId: {
	                type: 'string'
	              },
	              loginId: {
	                type: 'string',
	                optional: true
	              }
	            },
	            strict: true
	          }
	        },
	        strict: true
	      },
	      metadata: {
	        type: 'array',
	        items: {
	          type: 'object',
	          properties: {
	            key: {
	              type: 'string'
	            },
	            value: {
	              type: 'string'
	            }
	          },
	          strict: true
	        },
	        optional: true
	      }
	    },
	    strict: true
	  },
	  sanitization: {
	    properties: {
	      clientVersion: {
	        properties: {
	          raw: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          },
	          major: {
	            type: 'integer',
	            optional: true
	          },
	          minor: {
	            type: 'integer',
	            optional: true
	          },
	          patch: {
	            type: 'integer',
	            optional: true
	          },
	          prerelease: {
	            type: 'array',
	            items: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            },
	            optional: true
	          },
	          build: {
	            type: 'array',
	            items: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            },
	            optional: true
	          },
	          version: {
	            maxLength: 10000,
	            rules: ['trim', 'lower'],
	            optional: true
	          }
	        },
	        strict: true
	      },
	      eventType: {
	        maxLength: 10000,
	        rules: ['trim']
	      },
	      customer: {
	        properties: {
	          id: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          },
	          area: {
	            maxLength: 10000,
	            rules: ['trim'],
	            optional: false,
	            def: 'Production'
	          }
	        },
	        strict: true
	      },
	      cart: {
	        properties: {
	          id: {
	            maxLength: 10000,
	            rules: ['trim', 'lower'],
	            optional: true
	          },
	          items: {
	            type: 'array',
	            items: {
	              properties: {
	                category: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower'],
	                  optional: true
	                },
	                collection: {
	                  maxLength: 10000,
	                  rules: ['trim'],
	                  optional: false,
	                  def: 'default'
	                },
	                title: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                sku: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower'],
	                  optional: true
	                },
	                productId: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                parentId: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower'],
	                  optional: true
	                },
	                margin: {
	                  type: 'number',
	                  optional: true
	                },
	                price: {
	                  type: 'number'
	                },
	                quantity: {
	                  type: 'integer'
	                },
	                metadata: {
	                  type: 'array',
	                  items: {
	                    properties: {
	                      key: {
	                        maxLength: 10000,
	                        rules: ['trim', 'lower']
	                      },
	                      value: {
	                        maxLength: 10000,
	                        rules: ['trim', 'lower']
	                      }
	                    },
	                    strict: true
	                  },
	                  optional: true
	                }
	              },
	              strict: true
	            }
	          },
	          metadata: {
	            type: 'array',
	            items: {
	              properties: {
	                key: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                value: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                }
	              },
	              strict: true
	            },
	            optional: true
	          }
	        },
	        strict: true
	      },
	      visit: {
	        properties: {
	          customerData: {
	            properties: {
	              visitorId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              sessionId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              loginId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              }
	            },
	            strict: true
	          }
	        },
	        strict: true
	      },
	      metadata: {
	        type: 'array',
	        items: {
	          properties: {
	            key: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            },
	            value: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            }
	          },
	          strict: true
	        },
	        optional: true
	      }
	    },
	    strict: true
	  }
	};

/***/ }),
/* 17 */
/***/ (function(module, exports) {

	"use strict";

	module.exports = {
	  regex: {
	    ISO_8601: /(\d{4})-(0[1-9]|1[0-2]|[1-9])-(\3([12]\d|0[1-9]|3[01])|[1-9])[tT\s]([01]\d|2[0-3])\:(([0-5]\d)|\d)\:(([0-5]\d)|\d)([\.,]\d+)?([zZ]|([\+-])([01]\d|2[0-3]|\d):(([0-5]\d)|\d))$/,
	    UUID_V4: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
	    ALPHA_NUM_LOWERCASE: /^[0-9a-z]+$/,
	    ALPHA_NUM: /^[0-9a-z]+$/i,
	    SHA1_HEX: /^[0-9a-f]{40}$/,
	    WHITELIST_STRIPING_REGEX: /(?:[\0- \(\)\+<->\[\]\^`\{-\xA0\xA6\xA8\xA9\xAC-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0378\u0379\u0380-\u0385\u038B\u038D\u03A2\u03F6\u0482\u0488\u0489\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0608\u060E\u060F\u061C\u061D\u06DD\u06DE\u06E9\u06FD\u06FE\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07F6\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08B5\u08BE-\u08D3\u08E2\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FA\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0AF8\u0AFA-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B70\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BF3-\u0BF8\u0BFA-\u0BFF\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5B-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C7F\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D00\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D53\u0D64\u0D65\u0D79\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DE5\u0DF0\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0F3A-\u0F3D\u0F48\u0F6D-\u0F70\u0F98\u0FBD-\u0FC5\u0FC7-\u0FCF\u0FD5-\u0FD8\u0FDB-\u0FFF\u109E\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u1390-\u139F\u13F6\u13F7\u13FE\u13FF\u1680\u169B-\u169F\u16F9-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180E\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191F\u192C-\u192F\u193C-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19FF\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE\u1AAF\u1ABE-\u1AFF\u1B4C-\u1B4F\u1B61-\u1B6A\u1B74-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C89-\u1CBF\u1CC8-\u1CCF\u1CF7\u1CFA-\u1CFF\u1DF6-\u1DFA\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u200F\u201A\u201E\u2028-\u202F\u2044-\u2046\u2052\u205F-\u206F\u2072\u2073\u207A-\u207E\u208A-\u208F\u209D-\u209F\u20BF-\u20CF\u20DD-\u20E0\u20E2-\u20E4\u20F1-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A-\u245F\u249C-\u24E9\u2500-\u2775\u2794-\u2BFF\u2C2F\u2C5F\u2CE5-\u2CEA\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E22-\u2E29\u2E42\u2E45-\u3000\u3004\u3008-\u301B\u301D-\u3020\u3036\u3037\u303E-\u3040\u3097\u3098\u309B\u309C\u3100-\u3104\u312E-\u3130\u318F-\u3191\u3196-\u319F\u31BB-\u31EF\u3200-\u321F\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DB6-\u4DFF\u9FD6-\u9FFF\uA48D-\uA4CF\uA62C-\uA63F\uA670-\uA672\uA6F8-\uA716\uA720\uA721\uA789\uA78A\uA7AF\uA7B8-\uA7F6\uA828-\uA82F\uA836\uA837\uA839-\uA83F\uA878-\uA87F\uA8C6-\uA8CD\uA8DA-\uA8DF\uA8FE\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA77-\uAA79\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB66-\uAB6F\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFD-\uFDFF\uFE17\uFE18\uFE1A-\uFE1F\uFE35-\uFE44\uFE47\uFE48\uFE53\uFE59-\uFE5E\uFE62\uFE64-\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFF08\uFF09\uFF0B\uFF1C-\uFF1E\uFF3B\uFF3D\uFF3E\uFF40\uFF5B-\uFF60\uFF62\uFF63\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE2-\uFFE4\uFFE7-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDCFF\uDD03-\uDD06\uDD34-\uDD3F\uDD79-\uDD89\uDD8C-\uDDFC\uDDFE-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEDF\uDEFC-\uDEFF\uDF24-\uDF2F\uDF4B-\uDF4F\uDF7B-\uDF7F\uDF9E\uDFC4-\uDFC7\uDFD6-\uDFFF]|\uD801[\uDC9E\uDC9F\uDCAA-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6E\uDD70-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56\uDC77\uDC78\uDC9F-\uDCA6\uDCB0-\uDCDF\uDCF3\uDCF6-\uDCFA\uDD1C-\uDD1E\uDD3A-\uDD3E\uDD40-\uDD7F\uDDB8-\uDDBB\uDDD0\uDDD1\uDE04\uDE07-\uDE0B\uDE14\uDE18\uDE34-\uDE37\uDE3B-\uDE3E\uDE48-\uDE4F\uDE59-\uDE5F\uDEA0-\uDEBF\uDEC8\uDEE7-\uDEEA\uDEF7-\uDEFF\uDF36-\uDF38\uDF56\uDF57\uDF73-\uDF77\uDF92-\uDF98\uDF9D-\uDFA8\uDFB0-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCF9\uDD00-\uDE5F\uDE7F-\uDFFF]|\uD804[\uDC4E-\uDC51\uDC70-\uDC7E\uDCBD\uDCC2-\uDCCF\uDCE9-\uDCEF\uDCFA-\uDCFF\uDD35\uDD44-\uDD4F\uDD77-\uDD7F\uDDCE\uDDCF\uDDE0\uDDF5-\uDDFF\uDE12\uDE3F-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEAA-\uDEAF\uDEEB-\uDEEF\uDEFA-\uDEFF\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A\uDF3B\uDF45\uDF46\uDF49\uDF4A\uDF4E\uDF4F\uDF51-\uDF56\uDF58-\uDF5C\uDF64\uDF65\uDF6D-\uDF6F\uDF75-\uDFFF]|\uD805[\uDC5A\uDC5C\uDC5E-\uDC7F\uDCC8-\uDCCF\uDCDA-\uDD7F\uDDB6\uDDB7\uDDDE-\uDDFF\uDE45-\uDE4F\uDE5A-\uDE5F\uDE6D-\uDE7F\uDEB8-\uDEBF\uDECA-\uDEFF\uDF1A-\uDF1C\uDF2C-\uDF2F\uDF3F-\uDFFF]|\uD806[\uDC00-\uDC9F\uDCF3-\uDCFE\uDD00-\uDEBF\uDEF9-\uDFFF]|\uD807[\uDC09\uDC37\uDC46-\uDC4F\uDC6D-\uDC6F\uDC90\uDC91\uDCA8\uDCB7-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC6F\uDC75-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD80B\uD80E-\uD810\uD812-\uD819\uD823-\uD82B\uD82D\uD82E\uD830-\uD833\uD837\uD839\uD83D-\uD83F\uD874-\uD87D\uD87F-\uDB3F\uDB41-\uDBFF][\uDC00-\uDFFF]|\uD80D[\uDC2F-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F\uDE6A-\uDE6D\uDE70-\uDECF\uDEEE\uDEEF\uDEF6-\uDEFF\uDF3C-\uDF3F\uDF45-\uDF4F\uDF5A\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDEFF\uDF45-\uDF4F\uDF7F-\uDF8E\uDFA0-\uDFDF\uDFE1-\uDFFF]|\uD821[\uDFED-\uDFFF]|\uD822[\uDEF3-\uDFFF]|\uD82C[\uDC02-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDC9C\uDCA0-\uDFFF]|\uD834[\uDC00-\uDD64\uDD6A-\uDD6C\uDD73-\uDD7A\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDE41\uDE45-\uDF5F\uDF72-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC\uDFCD]|[\uD836\uD83B][\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86\uDE8C-\uDE9A\uDEA0\uDEB0-\uDFFF]|\uD838[\uDC07\uDC19\uDC1A\uDC22\uDC25\uDC2B-\uDFFF]|\uD83A[\uDCC5\uDCC6\uDCD7-\uDCFF\uDD4B-\uDD4F\uDD5A-\uDD5D\uDD60-\uDFFF]|[\uD83C\uDB40][\uDC00-\uDCFF\uDD0D-\uDFFF]|\uD869[\uDED7-\uDEFF]|\uD86D[\uDF35-\uDF3F]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEA2-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g,
	    BLACKLIST_STRIPING_REGEX: /(?:[\0-\x1F\(\);-\?\[\]\{\}\x7F-\x9F\xAD\u0378\u0379\u0380-\u0383\u038B\u038D\u03A2\u0488\u0489\u0530\u0557\u0558\u0560\u0588\u058B\u058C\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08B5\u08BE-\u08D3\u08E2\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0AF8\u0AFA-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0BFF\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5B-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D00\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D50-\u0D53\u0D64\u0D65\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DE5\u0DF0\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F6\u13F7\u13FE\u13FF\u169D-\u169F\u16F9-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180E\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE\u1AAF\u1ABE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C89-\u1CBF\u1CC8-\u1CCF\u1CF7\u1CFA-\u1CFF\u1DF6-\u1DFA\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BF-\u20CF\u20DD-\u20E0\u20E2-\u20E4\u20F1-\u20FF\u218C-\u218F\u23FF\u2427-\u243F\u244B-\u245F\u2B74\u2B75\u2B96\u2B97\u2BBA-\u2BBC\u2BC9\u2BD2-\u2BEB\u2BF0-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E45-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FD6-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA670-\uA672\uA6F8-\uA6FF\uA7AF\uA7B8-\uA7F6\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C6-\uA8CD\uA8DA-\uA8DF\uA8FE\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB66-\uAB6F\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDCFF\uDD03-\uDD06\uDD34-\uDD36\uDD8F\uDD9C-\uDD9F\uDDA1-\uDDCF\uDDFE-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEDF\uDEFC-\uDEFF\uDF24-\uDF2F\uDF4B-\uDF4F\uDF7B-\uDF7F\uDF9E\uDFC4-\uDFC7\uDFD6-\uDFFF]|\uD801[\uDC9E\uDC9F\uDCAA-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6E\uDD70-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56\uDC9F-\uDCA6\uDCB0-\uDCDF\uDCF3\uDCF6-\uDCFA\uDD1C-\uDD1E\uDD3A-\uDD3E\uDD40-\uDD7F\uDDB8-\uDDBB\uDDD0\uDDD1\uDE04\uDE07-\uDE0B\uDE14\uDE18\uDE34-\uDE37\uDE3B-\uDE3E\uDE48-\uDE4F\uDE59-\uDE5F\uDEA0-\uDEBF\uDEE7-\uDEEA\uDEF7-\uDEFF\uDF36-\uDF38\uDF56\uDF57\uDF73-\uDF77\uDF92-\uDF98\uDF9D-\uDFA8\uDFB0-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCF9\uDD00-\uDE5F\uDE7F-\uDFFF]|\uD804[\uDC4E-\uDC51\uDC70-\uDC7E\uDCBD\uDCC2-\uDCCF\uDCE9-\uDCEF\uDCFA-\uDCFF\uDD35\uDD44-\uDD4F\uDD77-\uDD7F\uDDCE\uDDCF\uDDE0\uDDF5-\uDDFF\uDE12\uDE3F-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEAA-\uDEAF\uDEEB-\uDEEF\uDEFA-\uDEFF\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A\uDF3B\uDF45\uDF46\uDF49\uDF4A\uDF4E\uDF4F\uDF51-\uDF56\uDF58-\uDF5C\uDF64\uDF65\uDF6D-\uDF6F\uDF75-\uDFFF]|\uD805[\uDC5A\uDC5C\uDC5E-\uDC7F\uDCC8-\uDCCF\uDCDA-\uDD7F\uDDB6\uDDB7\uDDDE-\uDDFF\uDE45-\uDE4F\uDE5A-\uDE5F\uDE6D-\uDE7F\uDEB8-\uDEBF\uDECA-\uDEFF\uDF1A-\uDF1C\uDF2C-\uDF2F\uDF40-\uDFFF]|\uD806[\uDC00-\uDC9F\uDCF3-\uDCFE\uDD00-\uDEBF\uDEF9-\uDFFF]|\uD807[\uDC09\uDC37\uDC46-\uDC4F\uDC6D-\uDC6F\uDC90\uDC91\uDCA8\uDCB7-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC6F\uDC75-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD80B\uD80E-\uD810\uD812-\uD819\uD823-\uD82B\uD82D\uD82E\uD830-\uD833\uD837\uD839\uD83F\uD874-\uD87D\uD87F-\uDB3F\uDB41-\uDBFF][\uDC00-\uDFFF]|\uD80D[\uDC2F-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F\uDE6A-\uDE6D\uDE70-\uDECF\uDEEE\uDEEF\uDEF6-\uDEFF\uDF46-\uDF4F\uDF5A\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDEFF\uDF45-\uDF4F\uDF7F-\uDF8E\uDFA0-\uDFDF\uDFE1-\uDFFF]|\uD821[\uDFED-\uDFFF]|\uD822[\uDEF3-\uDFFF]|\uD82C[\uDC02-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A\uDC9B\uDCA0-\uDFFF]|\uD834[\uDCF6-\uDCFF\uDD27\uDD28\uDD73-\uDD7A\uDDE9-\uDDFF\uDE46-\uDEFF\uDF57-\uDF5F\uDF72-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDFCC\uDFCD]|\uD836[\uDE8C-\uDE9A\uDEA0\uDEB0-\uDFFF]|\uD838[\uDC07\uDC19\uDC1A\uDC22\uDC25\uDC2B-\uDFFF]|\uD83A[\uDCC5\uDCC6\uDCD7-\uDCFF\uDD4B-\uDD4F\uDD5A-\uDD5D\uDD60-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDEEF\uDEF2-\uDFFF]|\uD83C[\uDC2C-\uDC2F\uDC94-\uDC9F\uDCAF\uDCB0\uDCC0\uDCD0\uDCF6-\uDCFF\uDD0D-\uDD0F\uDD2F\uDD6C-\uDD6F\uDDAD-\uDDE5\uDE03-\uDE0F\uDE3C-\uDE3F\uDE49-\uDE4F\uDE52-\uDEFF]|\uD83D[\uDED3-\uDEDF\uDEED-\uDEEF\uDEF7-\uDEFF\uDF74-\uDF7F\uDFD5-\uDFFF]|\uD83E[\uDC0C-\uDC0F\uDC48-\uDC4F\uDC5A-\uDC5F\uDC88-\uDC8F\uDCAE-\uDD0F\uDD1F\uDD28-\uDD2F\uDD31\uDD32\uDD3F\uDD4C-\uDD4F\uDD5F-\uDD7F\uDD92-\uDDBF\uDDC1-\uDFFF]|\uD869[\uDED7-\uDEFF]|\uD86D[\uDF35-\uDF3F]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEA2-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uDB40[\uDC00-\uDCFF\uDDF0-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g
	  }
	};

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(17);
	module.exports = {
	  validation: {
	    type: 'object',
	    properties: {
	      clientVersion: {
	        type: 'object',
	        properties: {
	          raw: {
	            type: 'string'
	          },
	          major: {
	            type: 'integer',
	            optional: true
	          },
	          minor: {
	            type: 'integer',
	            optional: true
	          },
	          patch: {
	            type: 'integer',
	            optional: true
	          },
	          prerelease: {
	            type: 'array',
	            items: {
	              type: 'string'
	            },
	            optional: true
	          },
	          build: {
	            type: 'array',
	            items: {
	              type: 'string'
	            },
	            optional: true
	          },
	          version: {
	            type: 'string',
	            optional: true
	          }
	        },
	        strict: true
	      },
	      eventType: {
	        type: 'string'
	      },
	      customer: {
	        type: 'object',
	        properties: {
	          id: {
	            type: 'string'
	          },
	          area: {
	            type: 'string',
	            optional: false
	          }
	        },
	        strict: true
	      },
	      cart: {
	        type: 'object',
	        properties: {
	          id: {
	            type: 'string',
	            optional: true
	          },
	          items: {
	            type: 'array',
	            items: {
	              type: 'object',
	              properties: {
	                category: {
	                  type: 'string',
	                  optional: true
	                },
	                collection: {
	                  type: 'string',
	                  optional: false
	                },
	                title: {
	                  type: 'string'
	                },
	                sku: {
	                  type: 'string',
	                  optional: true
	                },
	                productId: {
	                  type: 'string'
	                },
	                parentId: {
	                  type: 'string',
	                  optional: true
	                },
	                margin: {
	                  type: 'number',
	                  optional: true
	                },
	                price: {
	                  type: 'number'
	                },
	                quantity: {
	                  type: 'integer'
	                },
	                metadata: {
	                  type: 'array',
	                  items: {
	                    type: 'object',
	                    properties: {
	                      key: {
	                        type: 'string'
	                      },
	                      value: {
	                        type: 'string'
	                      }
	                    },
	                    strict: true
	                  },
	                  optional: true
	                }
	              },
	              strict: true
	            }
	          },
	          metadata: {
	            type: 'array',
	            items: {
	              type: 'object',
	              properties: {
	                key: {
	                  type: 'string'
	                },
	                value: {
	                  type: 'string'
	                }
	              },
	              strict: true
	            },
	            optional: true
	          }
	        },
	        strict: true
	      },
	      visit: {
	        type: 'object',
	        properties: {
	          customerData: {
	            type: 'object',
	            properties: {
	              visitorId: {
	                type: 'string'
	              },
	              sessionId: {
	                type: 'string'
	              },
	              loginId: {
	                type: 'string',
	                optional: true
	              }
	            },
	            strict: true
	          }
	        },
	        strict: true
	      },
	      metadata: {
	        type: 'array',
	        items: {
	          type: 'object',
	          properties: {
	            key: {
	              type: 'string'
	            },
	            value: {
	              type: 'string'
	            }
	          },
	          strict: true
	        },
	        optional: true
	      }
	    },
	    strict: true
	  },
	  sanitization: {
	    properties: {
	      clientVersion: {
	        properties: {
	          raw: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          },
	          major: {
	            type: 'integer',
	            optional: true
	          },
	          minor: {
	            type: 'integer',
	            optional: true
	          },
	          patch: {
	            type: 'integer',
	            optional: true
	          },
	          prerelease: {
	            type: 'array',
	            items: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            },
	            optional: true
	          },
	          build: {
	            type: 'array',
	            items: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            },
	            optional: true
	          },
	          version: {
	            maxLength: 10000,
	            rules: ['trim', 'lower'],
	            optional: true
	          }
	        },
	        strict: true
	      },
	      eventType: {
	        maxLength: 10000,
	        rules: ['trim']
	      },
	      customer: {
	        properties: {
	          id: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          },
	          area: {
	            maxLength: 10000,
	            rules: ['trim'],
	            optional: false,
	            def: 'Production'
	          }
	        },
	        strict: true
	      },
	      cart: {
	        properties: {
	          id: {
	            maxLength: 10000,
	            rules: ['trim', 'lower'],
	            optional: true
	          },
	          items: {
	            type: 'array',
	            items: {
	              properties: {
	                category: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower'],
	                  optional: true
	                },
	                collection: {
	                  maxLength: 10000,
	                  rules: ['trim'],
	                  optional: false,
	                  def: 'default'
	                },
	                title: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                sku: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower'],
	                  optional: true
	                },
	                productId: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                parentId: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower'],
	                  optional: true
	                },
	                margin: {
	                  type: 'number',
	                  optional: true
	                },
	                price: {
	                  type: 'number'
	                },
	                quantity: {
	                  type: 'integer'
	                },
	                metadata: {
	                  type: 'array',
	                  items: {
	                    properties: {
	                      key: {
	                        maxLength: 10000,
	                        rules: ['trim', 'lower']
	                      },
	                      value: {
	                        maxLength: 10000,
	                        rules: ['trim', 'lower']
	                      }
	                    },
	                    strict: true
	                  },
	                  optional: true
	                }
	              },
	              strict: true
	            }
	          },
	          metadata: {
	            type: 'array',
	            items: {
	              properties: {
	                key: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                value: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                }
	              },
	              strict: true
	            },
	            optional: true
	          }
	        },
	        strict: true
	      },
	      visit: {
	        properties: {
	          customerData: {
	            properties: {
	              visitorId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              sessionId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              loginId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              }
	            },
	            strict: true
	          }
	        },
	        strict: true
	      },
	      metadata: {
	        type: 'array',
	        items: {
	          properties: {
	            key: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            },
	            value: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            }
	          },
	          strict: true
	        },
	        optional: true
	      }
	    },
	    strict: true
	  }
	};

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(17);
	module.exports = {
	  validation: {
	    type: 'object',
	    properties: {
	      clientVersion: {
	        type: 'object',
	        properties: {
	          raw: {
	            type: 'string'
	          },
	          major: {
	            type: 'integer',
	            optional: true
	          },
	          minor: {
	            type: 'integer',
	            optional: true
	          },
	          patch: {
	            type: 'integer',
	            optional: true
	          },
	          prerelease: {
	            type: 'array',
	            items: {
	              type: 'string'
	            },
	            optional: true
	          },
	          build: {
	            type: 'array',
	            items: {
	              type: 'string'
	            },
	            optional: true
	          },
	          version: {
	            type: 'string',
	            optional: true
	          }
	        },
	        strict: true
	      },
	      eventType: {
	        type: 'string'
	      },
	      customer: {
	        type: 'object',
	        properties: {
	          id: {
	            type: 'string'
	          },
	          area: {
	            type: 'string',
	            optional: false
	          }
	        },
	        strict: true
	      },
	      cart: {
	        type: 'object',
	        properties: {
	          id: {
	            type: 'string',
	            optional: true
	          },
	          items: {
	            type: 'array',
	            items: {
	              type: 'object',
	              properties: {
	                category: {
	                  type: 'string',
	                  optional: true
	                },
	                collection: {
	                  type: 'string',
	                  optional: false
	                },
	                title: {
	                  type: 'string'
	                },
	                sku: {
	                  type: 'string',
	                  optional: true
	                },
	                productId: {
	                  type: 'string'
	                },
	                parentId: {
	                  type: 'string',
	                  optional: true
	                },
	                margin: {
	                  type: 'number',
	                  optional: true
	                },
	                price: {
	                  type: 'number'
	                },
	                quantity: {
	                  type: 'integer'
	                },
	                metadata: {
	                  type: 'array',
	                  items: {
	                    type: 'object',
	                    properties: {
	                      key: {
	                        type: 'string'
	                      },
	                      value: {
	                        type: 'string'
	                      }
	                    },
	                    strict: true
	                  },
	                  optional: true
	                }
	              },
	              strict: true
	            }
	          },
	          metadata: {
	            type: 'array',
	            items: {
	              type: 'object',
	              properties: {
	                key: {
	                  type: 'string'
	                },
	                value: {
	                  type: 'string'
	                }
	              },
	              strict: true
	            },
	            optional: true
	          }
	        },
	        strict: true
	      },
	      visit: {
	        type: 'object',
	        properties: {
	          customerData: {
	            type: 'object',
	            properties: {
	              visitorId: {
	                type: 'string'
	              },
	              sessionId: {
	                type: 'string'
	              },
	              loginId: {
	                type: 'string',
	                optional: true
	              }
	            },
	            strict: true
	          }
	        },
	        strict: true
	      },
	      metadata: {
	        type: 'array',
	        items: {
	          type: 'object',
	          properties: {
	            key: {
	              type: 'string'
	            },
	            value: {
	              type: 'string'
	            }
	          },
	          strict: true
	        },
	        optional: true
	      }
	    },
	    strict: true
	  },
	  sanitization: {
	    properties: {
	      clientVersion: {
	        properties: {
	          raw: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          },
	          major: {
	            type: 'integer',
	            optional: true
	          },
	          minor: {
	            type: 'integer',
	            optional: true
	          },
	          patch: {
	            type: 'integer',
	            optional: true
	          },
	          prerelease: {
	            type: 'array',
	            items: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            },
	            optional: true
	          },
	          build: {
	            type: 'array',
	            items: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            },
	            optional: true
	          },
	          version: {
	            maxLength: 10000,
	            rules: ['trim', 'lower'],
	            optional: true
	          }
	        },
	        strict: true
	      },
	      eventType: {
	        maxLength: 10000,
	        rules: ['trim']
	      },
	      customer: {
	        properties: {
	          id: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          },
	          area: {
	            maxLength: 10000,
	            rules: ['trim'],
	            optional: false,
	            def: 'Production'
	          }
	        },
	        strict: true
	      },
	      cart: {
	        properties: {
	          id: {
	            maxLength: 10000,
	            rules: ['trim', 'lower'],
	            optional: true
	          },
	          items: {
	            type: 'array',
	            items: {
	              properties: {
	                category: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower'],
	                  optional: true
	                },
	                collection: {
	                  maxLength: 10000,
	                  rules: ['trim'],
	                  optional: false,
	                  def: 'default'
	                },
	                title: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                sku: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower'],
	                  optional: true
	                },
	                productId: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                parentId: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower'],
	                  optional: true
	                },
	                margin: {
	                  type: 'number',
	                  optional: true
	                },
	                price: {
	                  type: 'number'
	                },
	                quantity: {
	                  type: 'integer'
	                },
	                metadata: {
	                  type: 'array',
	                  items: {
	                    properties: {
	                      key: {
	                        maxLength: 10000,
	                        rules: ['trim', 'lower']
	                      },
	                      value: {
	                        maxLength: 10000,
	                        rules: ['trim', 'lower']
	                      }
	                    },
	                    strict: true
	                  },
	                  optional: true
	                }
	              },
	              strict: true
	            }
	          },
	          metadata: {
	            type: 'array',
	            items: {
	              properties: {
	                key: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                value: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                }
	              },
	              strict: true
	            },
	            optional: true
	          }
	        },
	        strict: true
	      },
	      visit: {
	        properties: {
	          customerData: {
	            properties: {
	              visitorId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              sessionId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              loginId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              }
	            },
	            strict: true
	          }
	        },
	        strict: true
	      },
	      metadata: {
	        type: 'array',
	        items: {
	          properties: {
	            key: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            },
	            value: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            }
	          },
	          strict: true
	        },
	        optional: true
	      }
	    },
	    strict: true
	  }
	};

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(17);
	module.exports = {
	  validation: {
	    type: 'object',
	    properties: {
	      clientVersion: {
	        type: 'object',
	        properties: {
	          raw: {
	            type: 'string'
	          },
	          major: {
	            type: 'integer',
	            optional: true
	          },
	          minor: {
	            type: 'integer',
	            optional: true
	          },
	          patch: {
	            type: 'integer',
	            optional: true
	          },
	          prerelease: {
	            type: 'array',
	            items: {
	              type: 'string'
	            },
	            optional: true
	          },
	          build: {
	            type: 'array',
	            items: {
	              type: 'string'
	            },
	            optional: true
	          },
	          version: {
	            type: 'string',
	            optional: true
	          }
	        },
	        strict: true
	      },
	      eventType: {
	        type: 'string'
	      },
	      customer: {
	        type: 'object',
	        properties: {
	          id: {
	            type: 'string'
	          },
	          area: {
	            type: 'string',
	            optional: false
	          }
	        },
	        strict: true
	      },
	      cart: {
	        type: 'object',
	        properties: {
	          id: {
	            type: 'string',
	            optional: true
	          },
	          totalItems: {
	            type: 'integer',
	            optional: true
	          },
	          totalQuantity: {
	            type: 'integer',
	            optional: true
	          },
	          totalPrice: {
	            type: 'number',
	            optional: true
	          },
	          generatedTotalPrice: {
	            type: 'number',
	            optional: true
	          },
	          items: {
	            type: 'array',
	            items: {
	              type: 'object',
	              properties: {
	                category: {
	                  type: 'string',
	                  optional: true
	                },
	                collection: {
	                  type: 'string',
	                  optional: false
	                },
	                title: {
	                  type: 'string'
	                },
	                sku: {
	                  type: 'string',
	                  optional: true
	                },
	                productId: {
	                  type: 'string'
	                },
	                parentId: {
	                  type: 'string',
	                  optional: true
	                },
	                margin: {
	                  type: 'number',
	                  optional: true
	                },
	                price: {
	                  type: 'number'
	                },
	                quantity: {
	                  type: 'integer'
	                },
	                metadata: {
	                  type: 'array',
	                  items: {
	                    type: 'object',
	                    properties: {
	                      key: {
	                        type: 'string'
	                      },
	                      value: {
	                        type: 'string'
	                      }
	                    },
	                    strict: true
	                  },
	                  optional: true
	                }
	              },
	              strict: true
	            }
	          },
	          metadata: {
	            type: 'array',
	            items: {
	              type: 'object',
	              properties: {
	                key: {
	                  type: 'string'
	                },
	                value: {
	                  type: 'string'
	                }
	              },
	              strict: true
	            },
	            optional: true
	          }
	        },
	        strict: true
	      },
	      visit: {
	        type: 'object',
	        properties: {
	          customerData: {
	            type: 'object',
	            properties: {
	              visitorId: {
	                type: 'string'
	              },
	              sessionId: {
	                type: 'string'
	              },
	              loginId: {
	                type: 'string',
	                optional: true
	              }
	            },
	            strict: true
	          }
	        },
	        strict: true
	      },
	      metadata: {
	        type: 'array',
	        items: {
	          type: 'object',
	          properties: {
	            key: {
	              type: 'string'
	            },
	            value: {
	              type: 'string'
	            }
	          },
	          strict: true
	        },
	        optional: true
	      }
	    },
	    strict: true
	  },
	  sanitization: {
	    properties: {
	      clientVersion: {
	        properties: {
	          raw: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          },
	          major: {
	            type: 'integer',
	            optional: true
	          },
	          minor: {
	            type: 'integer',
	            optional: true
	          },
	          patch: {
	            type: 'integer',
	            optional: true
	          },
	          prerelease: {
	            type: 'array',
	            items: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            },
	            optional: true
	          },
	          build: {
	            type: 'array',
	            items: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            },
	            optional: true
	          },
	          version: {
	            maxLength: 10000,
	            rules: ['trim', 'lower'],
	            optional: true
	          }
	        },
	        strict: true
	      },
	      eventType: {
	        maxLength: 10000,
	        rules: ['trim']
	      },
	      customer: {
	        properties: {
	          id: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          },
	          area: {
	            maxLength: 10000,
	            rules: ['trim'],
	            optional: false,
	            def: 'Production'
	          }
	        },
	        strict: true
	      },
	      cart: {
	        properties: {
	          id: {
	            maxLength: 10000,
	            rules: ['trim', 'lower'],
	            optional: true
	          },
	          totalItems: {
	            type: 'integer',
	            optional: true
	          },
	          totalQuantity: {
	            type: 'integer',
	            optional: true
	          },
	          totalPrice: {
	            type: 'number',
	            optional: true
	          },
	          generatedTotalPrice: {
	            type: 'number',
	            optional: true
	          },
	          items: {
	            type: 'array',
	            items: {
	              properties: {
	                category: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower'],
	                  optional: true
	                },
	                collection: {
	                  maxLength: 10000,
	                  rules: ['trim'],
	                  optional: false,
	                  def: 'default'
	                },
	                title: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                sku: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower'],
	                  optional: true
	                },
	                productId: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                parentId: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower'],
	                  optional: true
	                },
	                margin: {
	                  type: 'number',
	                  optional: true
	                },
	                price: {
	                  type: 'number'
	                },
	                quantity: {
	                  type: 'integer'
	                },
	                metadata: {
	                  type: 'array',
	                  items: {
	                    properties: {
	                      key: {
	                        maxLength: 10000,
	                        rules: ['trim', 'lower']
	                      },
	                      value: {
	                        maxLength: 10000,
	                        rules: ['trim', 'lower']
	                      }
	                    },
	                    strict: true
	                  },
	                  optional: true
	                }
	              },
	              strict: true
	            }
	          },
	          metadata: {
	            type: 'array',
	            items: {
	              properties: {
	                key: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                value: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                }
	              },
	              strict: true
	            },
	            optional: true
	          }
	        },
	        strict: true
	      },
	      visit: {
	        properties: {
	          customerData: {
	            properties: {
	              visitorId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              sessionId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              loginId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              }
	            },
	            strict: true
	          }
	        },
	        strict: true
	      },
	      metadata: {
	        type: 'array',
	        items: {
	          properties: {
	            key: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            },
	            value: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            }
	          },
	          strict: true
	        },
	        optional: true
	      }
	    },
	    strict: true
	  }
	};

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(17);
	module.exports = {
	  validation: {
	    type: 'object',
	    properties: {
	      clientVersion: {
	        type: 'object',
	        properties: {
	          raw: {
	            type: 'string'
	          },
	          major: {
	            type: 'integer',
	            optional: true
	          },
	          minor: {
	            type: 'integer',
	            optional: true
	          },
	          patch: {
	            type: 'integer',
	            optional: true
	          },
	          prerelease: {
	            type: 'array',
	            items: {
	              type: 'string'
	            },
	            optional: true
	          },
	          build: {
	            type: 'array',
	            items: {
	              type: 'string'
	            },
	            optional: true
	          },
	          version: {
	            type: 'string',
	            optional: true
	          }
	        },
	        strict: true
	      },
	      responseId: {
	        type: 'string',
	        optional: true
	      },
	      eventType: {
	        type: 'string'
	      },
	      customer: {
	        type: 'object',
	        properties: {
	          id: {
	            type: 'string'
	          },
	          area: {
	            type: 'string',
	            optional: false
	          }
	        },
	        strict: true
	      },
	      search: {
	        properties: {
	          origin: {
	            type: 'object',
	            properties: {
	              sayt: {
	                type: 'boolean',
	                optional: false
	              },
	              dym: {
	                type: 'boolean',
	                optional: false
	              },
	              search: {
	                type: 'boolean',
	                optional: false
	              },
	              recommendations: {
	                type: 'boolean',
	                optional: false
	              },
	              autosearch: {
	                type: 'boolean',
	                optional: false
	              },
	              navigation: {
	                type: 'boolean',
	                optional: false
	              },
	              collectionSwitcher: {
	                type: 'boolean',
	                optional: false
	              }
	            },
	            strict: true
	          },
	          id: {
	            type: 'string',
	            optional: false
	          }
	        },
	        type: 'object',
	        optional: false
	      },
	      visit: {
	        type: 'object',
	        properties: {
	          customerData: {
	            type: 'object',
	            properties: {
	              visitorId: {
	                type: 'string'
	              },
	              sessionId: {
	                type: 'string'
	              },
	              loginId: {
	                type: 'string',
	                optional: true
	              }
	            },
	            strict: true
	          }
	        },
	        strict: true
	      },
	      metadata: {
	        type: 'array',
	        items: {
	          type: 'object',
	          properties: {
	            key: {
	              type: 'string'
	            },
	            value: {
	              type: 'string'
	            }
	          },
	          strict: true
	        },
	        optional: true
	      }
	    },
	    strict: true
	  },
	  sanitization: {
	    properties: {
	      clientVersion: {
	        properties: {
	          raw: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          },
	          major: {
	            type: 'integer',
	            optional: true
	          },
	          minor: {
	            type: 'integer',
	            optional: true
	          },
	          patch: {
	            type: 'integer',
	            optional: true
	          },
	          prerelease: {
	            type: 'array',
	            items: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            },
	            optional: true
	          },
	          build: {
	            type: 'array',
	            items: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            },
	            optional: true
	          },
	          version: {
	            maxLength: 10000,
	            rules: ['trim', 'lower'],
	            optional: true
	          }
	        },
	        strict: true
	      },
	      responseId: {
	        maxLength: 10000,
	        rules: ['trim', 'lower'],
	        optional: true
	      },
	      eventType: {
	        maxLength: 10000,
	        rules: ['trim']
	      },
	      customer: {
	        properties: {
	          id: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          },
	          area: {
	            maxLength: 10000,
	            rules: ['trim'],
	            optional: false,
	            def: 'Production'
	          }
	        },
	        strict: true
	      },
	      search: {
	        properties: {
	          origin: {
	            properties: {
	              sayt: {
	                optional: false,
	                def: false
	              },
	              dym: {
	                optional: false,
	                def: false
	              },
	              search: {
	                optional: false,
	                def: false
	              },
	              recommendations: {
	                optional: false,
	                def: false
	              },
	              autosearch: {
	                optional: false,
	                def: false
	              },
	              navigation: {
	                optional: false,
	                def: false
	              },
	              collectionSwitcher: {
	                optional: false,
	                def: false
	              }
	            },
	            strict: true
	          },
	          id: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          }
	        },
	        strict: true
	      },
	      visit: {
	        properties: {
	          customerData: {
	            properties: {
	              visitorId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              sessionId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              loginId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              }
	            },
	            strict: true
	          }
	        },
	        strict: true
	      },
	      metadata: {
	        type: 'array',
	        items: {
	          properties: {
	            key: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            },
	            value: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            }
	          },
	          strict: true
	        },
	        optional: true
	      }
	    },
	    strict: true
	  }
	};

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(17);
	module.exports = {
	  validation: {
	    type: 'object',
	    properties: {
	      clientVersion: {
	        type: 'object',
	        properties: {
	          raw: {
	            type: 'string'
	          },
	          major: {
	            type: 'integer',
	            optional: true
	          },
	          minor: {
	            type: 'integer',
	            optional: true
	          },
	          patch: {
	            type: 'integer',
	            optional: true
	          },
	          prerelease: {
	            type: 'array',
	            items: {
	              type: 'string'
	            },
	            optional: true
	          },
	          build: {
	            type: 'array',
	            items: {
	              type: 'string'
	            },
	            optional: true
	          },
	          version: {
	            type: 'string',
	            optional: true
	          }
	        },
	        strict: true
	      },
	      responseId: {
	        type: 'string',
	        optional: true
	      },
	      eventType: {
	        type: 'string'
	      },
	      customer: {
	        type: 'object',
	        properties: {
	          id: {
	            type: 'string'
	          },
	          area: {
	            type: 'string',
	            optional: false
	          }
	        },
	        strict: true
	      },
	      search: {
	        properties: {
	          origin: {
	            type: 'object',
	            properties: {
	              sayt: {
	                type: 'boolean',
	                optional: false
	              },
	              dym: {
	                type: 'boolean',
	                optional: false
	              },
	              search: {
	                type: 'boolean',
	                optional: false
	              },
	              recommendations: {
	                type: 'boolean',
	                optional: false
	              },
	              autosearch: {
	                type: 'boolean',
	                optional: false
	              },
	              navigation: {
	                type: 'boolean',
	                optional: false
	              },
	              collectionSwitcher: {
	                type: 'boolean',
	                optional: false
	              }
	            },
	            strict: true
	          },
	          id: {
	            type: 'string',
	            optional: true
	          },
	          totalRecordCount: {
	            type: 'integer',
	            optional: false
	          },
	          area: {
	            type: 'string',
	            optional: true
	          },
	          biasingProfile: {
	            type: 'string',
	            optional: true
	          },
	          query: {
	            type: 'string',
	            optional: false
	          },
	          originalQuery: {
	            type: 'string',
	            optional: true
	          },
	          correctedQuery: {
	            type: 'string',
	            optional: true
	          },
	          warnings: {
	            type: 'array',
	            items: {
	              type: 'string'
	            },
	            optional: true
	          },
	          errors: {
	            type: 'string',
	            optional: true
	          },
	          template: {
	            type: 'object',
	            properties: {
	              name: {
	                type: 'string',
	                optional: true
	              },
	              ruleName: {
	                type: 'string',
	                optional: true
	              },
	              _id: {
	                type: 'string',
	                optional: true
	              }
	            },
	            optional: true
	          },
	          pageInfo: {
	            type: 'object',
	            properties: {
	              recordStart: {
	                type: 'integer',
	                optional: false
	              },
	              recordEnd: {
	                type: 'integer',
	                optional: false
	              }
	            },
	            optional: false
	          },
	          relatedQueries: {
	            type: 'array',
	            items: {
	              type: 'string'
	            },
	            optional: true
	          },
	          rewrites: {
	            type: 'array',
	            items: {
	              type: 'string'
	            },
	            optional: true
	          },
	          redirect: {
	            type: 'string',
	            optional: true
	          },
	          siteParams: {
	            type: 'array',
	            items: {
	              type: 'object',
	              properties: {
	                key: {
	                  type: 'string',
	                  optional: true
	                },
	                value: {
	                  type: 'string',
	                  optional: true
	                }
	              }
	            },
	            optional: true
	          },
	          matchStrategy: {
	            type: 'object',
	            properties: {
	              name: {
	                type: 'string',
	                optional: true
	              },
	              rules: {
	                type: 'array',
	                items: {
	                  type: 'object',
	                  properties: {
	                    terms: {
	                      type: 'integer',
	                      optional: true
	                    },
	                    termsGreaterThan: {
	                      type: 'integer',
	                      optional: true
	                    },
	                    mustMatch: {
	                      type: 'integer',
	                      optional: true
	                    },
	                    percentage: {
	                      type: 'boolean',
	                      optional: true
	                    }
	                  }
	                },
	                optional: true
	              }
	            },
	            optional: true
	          },
	          availableNavigation: {
	            type: 'array',
	            items: {
	              type: 'object',
	              properties: {
	                name: {
	                  type: 'string',
	                  optional: false
	                },
	                displayName: {
	                  type: 'string',
	                  optional: true
	                },
	                range: {
	                  type: 'boolean',
	                  optional: true
	                },
	                or: {
	                  type: 'boolean',
	                  optional: true
	                },
	                ignored: {
	                  type: 'boolean',
	                  optional: true
	                },
	                moreRefinements: {
	                  type: 'boolean',
	                  optional: true
	                },
	                _id: {
	                  type: 'string',
	                  optional: true
	                },
	                type: {
	                  type: 'string',
	                  optional: true
	                },
	                metadata: {
	                  type: 'array',
	                  items: {
	                    type: 'object',
	                    properties: {
	                      key: {
	                        type: 'string',
	                        optional: false
	                      },
	                      value: {
	                        type: 'string',
	                        optional: false
	                      }
	                    },
	                    strict: true
	                  },
	                  optional: true,
	                  strict: true
	                },
	                refinements: {
	                  type: 'array',
	                  items: {
	                    type: 'object',
	                    properties: {
	                      type: {
	                        type: 'string',
	                        optional: false
	                      },
	                      _id: {
	                        type: 'string',
	                        optional: true
	                      },
	                      count: {
	                        type: 'integer',
	                        optional: true
	                      },
	                      exclude: {
	                        type: 'boolean',
	                        optional: true
	                      },
	                      value: {
	                        type: 'string',
	                        optional: true
	                      },
	                      high: {
	                        type: 'string',
	                        optional: true
	                      },
	                      low: {
	                        type: 'string',
	                        optional: true
	                      }
	                    }
	                  },
	                  optional: false
	                }
	              }
	            },
	            optional: true
	          },
	          selectedNavigation: {
	            type: 'array',
	            items: {
	              type: 'object',
	              properties: {
	                name: {
	                  type: 'string',
	                  optional: false
	                },
	                displayName: {
	                  type: 'string',
	                  optional: true
	                },
	                range: {
	                  type: 'boolean',
	                  optional: true
	                },
	                or: {
	                  type: 'boolean',
	                  optional: true
	                },
	                ignored: {
	                  type: 'boolean',
	                  optional: true
	                },
	                moreRefinements: {
	                  type: 'boolean',
	                  optional: true
	                },
	                _id: {
	                  type: 'string',
	                  optional: true
	                },
	                type: {
	                  type: 'string',
	                  optional: true
	                },
	                metadata: {
	                  type: 'array',
	                  items: {
	                    type: 'object',
	                    properties: {
	                      key: {
	                        type: 'string',
	                        optional: false
	                      },
	                      value: {
	                        type: 'string',
	                        optional: false
	                      }
	                    },
	                    strict: true
	                  },
	                  optional: true,
	                  strict: true
	                },
	                refinements: {
	                  type: 'array',
	                  items: {
	                    type: 'object',
	                    properties: {
	                      type: {
	                        type: 'string',
	                        optional: false
	                      },
	                      _id: {
	                        type: 'string',
	                        optional: true
	                      },
	                      count: {
	                        type: 'integer',
	                        optional: true
	                      },
	                      exclude: {
	                        type: 'boolean',
	                        optional: true
	                      },
	                      value: {
	                        type: 'string',
	                        optional: true
	                      },
	                      high: {
	                        type: 'string',
	                        optional: true
	                      },
	                      low: {
	                        type: 'string',
	                        optional: true
	                      }
	                    }
	                  },
	                  optional: false
	                }
	              }
	            },
	            optional: true
	          },
	          records: {
	            type: 'array',
	            items: {
	              type: 'object',
	              properties: {
	                allMeta: {
	                  type: 'object',
	                  properties: {
	                    sku: {
	                      type: 'string',
	                      optional: true
	                    },
	                    productId: {
	                      type: 'string',
	                      optional: true
	                    }
	                  },
	                  optional: true
	                },
	                refinementMatches: {
	                  type: 'array',
	                  items: {
	                    type: 'object',
	                    properties: {
	                      name: {
	                        type: 'string',
	                        optional: true
	                      },
	                      values: {
	                        type: 'array',
	                        items: {
	                          type: 'object',
	                          properties: {
	                            value: {
	                              type: 'string',
	                              optional: true
	                            },
	                            count: {
	                              type: 'integer',
	                              optional: true
	                            }
	                          }
	                        },
	                        optional: true
	                      }
	                    }
	                  },
	                  optional: true
	                },
	                _id: {
	                  type: 'string',
	                  optional: true
	                },
	                _u: {
	                  type: 'string',
	                  optional: true
	                },
	                _t: {
	                  type: 'string',
	                  optional: true
	                },
	                collection: {
	                  type: 'string',
	                  optional: true
	                }
	              }
	            },
	            optional: true
	          },
	          didYouMean: {
	            type: 'array',
	            items: {
	              type: 'string'
	            },
	            optional: true
	          },
	          originalRequest: {
	            type: 'object',
	            properties: {
	              collection: {
	                type: 'string',
	                optional: true
	              },
	              area: {
	                type: 'string',
	                optional: true
	              },
	              sessionId: {
	                type: 'string',
	                optional: true
	              },
	              visitorId: {
	                type: 'string',
	                optional: true
	              },
	              biasingProfile: {
	                type: 'string',
	                optional: true
	              },
	              language: {
	                type: 'string',
	                optional: true
	              },
	              customUrlParams: {
	                type: 'array',
	                items: {
	                  type: 'object',
	                  properties: {
	                    key: {
	                      type: 'string',
	                      optional: true
	                    },
	                    value: {
	                      type: 'string',
	                      optional: true
	                    }
	                  }
	                },
	                optional: true
	              },
	              query: {
	                type: 'string',
	                optional: true
	              },
	              refinementQuery: {
	                type: 'string',
	                optional: true
	              },
	              matchStrategyName: {
	                type: 'string',
	                optional: true
	              },
	              matchStrategy: {
	                type: 'object',
	                properties: {
	                  name: {
	                    type: 'string',
	                    optional: true
	                  },
	                  rules: {
	                    type: 'array',
	                    items: {
	                      type: 'object',
	                      properties: {
	                        terms: {
	                          type: 'integer',
	                          optional: true
	                        },
	                        termsGreaterThan: {
	                          type: 'integer',
	                          optional: true
	                        },
	                        mustMatch: {
	                          type: 'integer',
	                          optional: true
	                        },
	                        percentage: {
	                          type: 'boolean',
	                          optional: true
	                        }
	                      }
	                    },
	                    optional: true
	                  }
	                },
	                optional: true
	              },
	              biasing: {
	                type: 'object',
	                properties: {
	                  bringToTop: {
	                    type: 'array',
	                    items: {
	                      type: 'string'
	                    },
	                    optional: true
	                  },
	                  augmentBiases: {
	                    type: 'boolean',
	                    optional: true
	                  },
	                  influence: {
	                    type: 'number',
	                    optional: true
	                  },
	                  biases: {
	                    type: 'array',
	                    items: {
	                      type: 'object',
	                      properties: {
	                        name: {
	                          type: 'string',
	                          optional: true
	                        },
	                        content: {
	                          type: 'string',
	                          optional: true
	                        },
	                        strength: {
	                          type: 'string',
	                          optional: true
	                        }
	                      }
	                    },
	                    optional: true
	                  }
	                },
	                optional: true
	              },
	              skip: {
	                type: 'integer',
	                optional: true
	              },
	              pageSize: {
	                type: 'integer',
	                optional: true
	              },
	              returnBinary: {
	                type: 'boolean',
	                optional: true
	              },
	              disableAutocorrection: {
	                type: 'boolean',
	                optional: true
	              },
	              pruneRefinements: {
	                type: 'boolean',
	                optional: true
	              },
	              sort: {
	                type: 'array',
	                items: {
	                  type: 'object',
	                  properties: {
	                    field: {
	                      type: 'string',
	                      optional: true
	                    },
	                    order: {
	                      type: 'string',
	                      optional: true
	                    }
	                  }
	                },
	                optional: true
	              },
	              fields: {
	                type: 'array',
	                items: {
	                  type: 'string'
	                },
	                optional: true
	              },
	              orFields: {
	                type: 'array',
	                items: {
	                  type: 'string'
	                },
	                optional: true
	              },
	              wildcardSearchEnabled: {
	                type: 'boolean',
	                optional: true
	              },
	              restrictNavigation: {
	                type: 'object',
	                properties: {
	                  name: {
	                    type: 'string',
	                    optional: true
	                  },
	                  count: {
	                    type: 'integer',
	                    optional: true
	                  }
	                },
	                optional: true
	              },
	              includedNavigations: {
	                type: 'array',
	                items: {
	                  type: 'string'
	                },
	                optional: true
	              },
	              excludedNavigations: {
	                type: 'array',
	                items: {
	                  type: 'string'
	                },
	                optional: true
	              },
	              refinements: {
	                type: 'array',
	                items: {
	                  type: 'object',
	                  properties: {
	                    navigationName: {
	                      type: 'string',
	                      optional: true
	                    },
	                    type: {
	                      type: 'string',
	                      optional: true
	                    },
	                    _id: {
	                      type: 'string',
	                      optional: true
	                    },
	                    exclude: {
	                      type: 'boolean',
	                      optional: true
	                    },
	                    value: {
	                      type: 'string',
	                      optional: true
	                    },
	                    high: {
	                      type: 'string',
	                      optional: true
	                    },
	                    low: {
	                      type: 'string',
	                      optional: true
	                    }
	                  }
	                },
	                optional: true
	              }
	            },
	            optional: true
	          }
	        },
	        type: 'object',
	        optional: false
	      },
	      visit: {
	        type: 'object',
	        properties: {
	          customerData: {
	            type: 'object',
	            properties: {
	              visitorId: {
	                type: 'string'
	              },
	              sessionId: {
	                type: 'string'
	              },
	              loginId: {
	                type: 'string',
	                optional: true
	              }
	            },
	            strict: true
	          }
	        },
	        strict: true
	      },
	      metadata: {
	        type: 'array',
	        items: {
	          type: 'object',
	          properties: {
	            key: {
	              type: 'string'
	            },
	            value: {
	              type: 'string'
	            }
	          },
	          strict: true
	        },
	        optional: true
	      }
	    },
	    strict: true
	  },
	  sanitization: {
	    properties: {
	      clientVersion: {
	        properties: {
	          raw: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          },
	          major: {
	            type: 'integer',
	            optional: true
	          },
	          minor: {
	            type: 'integer',
	            optional: true
	          },
	          patch: {
	            type: 'integer',
	            optional: true
	          },
	          prerelease: {
	            type: 'array',
	            items: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            },
	            optional: true
	          },
	          build: {
	            type: 'array',
	            items: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            },
	            optional: true
	          },
	          version: {
	            maxLength: 10000,
	            rules: ['trim', 'lower'],
	            optional: true
	          }
	        },
	        strict: true
	      },
	      responseId: {
	        maxLength: 10000,
	        rules: ['trim', 'lower'],
	        optional: true
	      },
	      eventType: {
	        maxLength: 10000,
	        rules: ['trim']
	      },
	      customer: {
	        properties: {
	          id: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          },
	          area: {
	            maxLength: 10000,
	            rules: ['trim'],
	            optional: false,
	            def: 'Production'
	          }
	        },
	        strict: true
	      },
	      search: {
	        properties: {
	          origin: {
	            properties: {
	              sayt: {
	                optional: false,
	                def: false
	              },
	              dym: {
	                optional: false,
	                def: false
	              },
	              search: {
	                optional: false,
	                def: false
	              },
	              recommendations: {
	                optional: false,
	                def: false
	              },
	              autosearch: {
	                optional: false,
	                def: false
	              },
	              navigation: {
	                optional: false,
	                def: false
	              },
	              collectionSwitcher: {
	                optional: false,
	                def: false
	              }
	            },
	            strict: true
	          },
	          id: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          },
	          totalRecordCount: {
	            type: 'integer'
	          },
	          area: {
	            maxLength: 10000,
	            rules: ['trim']
	          },
	          biasingProfile: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          },
	          query: {
	            maxLength: 10000,
	            rules: ['trim', 'lower'],
	            exec: function exec(schema, post) {
	              if (typeof post === 'string') {
	                // Strip using blacklist
	                post = post.replace(utils.regex.BLACKLIST_STRIPING_REGEX, ' ');

	                // Replace all whitespace combinations with a single space
	                post = post.replace(/\s\s+/g, ' ');

	                post = post.trim();

	                return post;
	              } else {
	                return post;
	              }
	            }
	          },
	          originalQuery: {
	            maxLength: 10000,
	            rules: ['trim', 'lower'],
	            exec: function exec(schema, post) {
	              if (typeof post === 'string') {
	                // Strip using blacklist
	                post = post.replace(utils.regex.BLACKLIST_STRIPING_REGEX, ' ');

	                // Replace all whitespace combinations with a single space
	                post = post.replace(/\s\s+/g, ' ');

	                post = post.trim();

	                return post;
	              } else {
	                return post;
	              }
	            }
	          },
	          correctedQuery: {
	            maxLength: 10000,
	            rules: ['trim', 'lower'],
	            exec: function exec(schema, post) {
	              if (typeof post === 'string') {
	                // Strip using blacklist
	                post = post.replace(utils.regex.BLACKLIST_STRIPING_REGEX, ' ');

	                // Replace all whitespace combinations with a single space
	                post = post.replace(/\s\s+/g, ' ');

	                post = post.trim();

	                return post;
	              } else {
	                return post;
	              }
	            }
	          },
	          warnings: {
	            type: 'array',
	            items: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            }
	          },
	          errors: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          },
	          template: {
	            properties: {
	              name: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              ruleName: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              _id: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              }
	            },
	            strict: true
	          },
	          pageInfo: {
	            properties: {
	              recordStart: {
	                type: 'integer'
	              },
	              recordEnd: {
	                type: 'integer'
	              }
	            },
	            strict: true
	          },
	          relatedQueries: {
	            type: 'array',
	            items: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            }
	          },
	          rewrites: {
	            type: 'array',
	            items: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            }
	          },
	          redirect: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          },
	          siteParams: {
	            type: 'array',
	            items: {
	              properties: {
	                key: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                value: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                }
	              },
	              strict: true
	            }
	          },
	          matchStrategy: {
	            properties: {
	              name: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              rules: {
	                type: 'array',
	                items: {
	                  properties: {
	                    terms: {
	                      type: 'integer'
	                    },
	                    termsGreaterThan: {
	                      type: 'integer'
	                    },
	                    mustMatch: {
	                      type: 'integer'
	                    },
	                    percentage: {}
	                  },
	                  strict: true
	                }
	              }
	            },
	            strict: true
	          },
	          availableNavigation: {
	            type: 'array',
	            items: {
	              properties: {
	                name: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                displayName: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                range: {},
	                or: {},
	                ignored: {},
	                moreRefinements: {},
	                _id: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                type: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                metadata: {
	                  type: 'array',
	                  items: {
	                    properties: {
	                      key: {
	                        maxLength: 10000,
	                        rules: ['trim', 'lower']
	                      },
	                      value: {
	                        maxLength: 10000,
	                        rules: ['trim', 'lower']
	                      }
	                    },
	                    strict: true
	                  }
	                },
	                refinements: {
	                  type: 'array',
	                  items: {
	                    properties: {
	                      type: {
	                        maxLength: 10000,
	                        rules: ['trim', 'lower']
	                      },
	                      _id: {
	                        maxLength: 10000,
	                        rules: ['trim', 'lower']
	                      },
	                      count: {
	                        type: 'integer'
	                      },
	                      exclude: {},
	                      value: {
	                        maxLength: 10000,
	                        rules: ['trim', 'lower']
	                      },
	                      high: {
	                        maxLength: 10000,
	                        rules: ['trim', 'lower']
	                      },
	                      low: {
	                        maxLength: 10000,
	                        rules: ['trim', 'lower']
	                      }
	                    },
	                    strict: true
	                  }
	                }
	              },
	              strict: true
	            }
	          },
	          selectedNavigation: {
	            type: 'array',
	            items: {
	              properties: {
	                name: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                displayName: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                range: {},
	                or: {},
	                ignored: {},
	                moreRefinements: {},
	                _id: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                type: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                metadata: {
	                  type: 'array',
	                  items: {
	                    properties: {
	                      key: {
	                        maxLength: 10000,
	                        rules: ['trim', 'lower']
	                      },
	                      value: {
	                        maxLength: 10000,
	                        rules: ['trim', 'lower']
	                      }
	                    },
	                    strict: true
	                  }
	                },
	                refinements: {
	                  type: 'array',
	                  items: {
	                    properties: {
	                      type: {
	                        maxLength: 10000,
	                        rules: ['trim', 'lower']
	                      },
	                      _id: {
	                        maxLength: 10000,
	                        rules: ['trim', 'lower']
	                      },
	                      count: {
	                        type: 'integer'
	                      },
	                      exclude: {},
	                      value: {
	                        maxLength: 10000,
	                        rules: ['trim', 'lower']
	                      },
	                      high: {
	                        maxLength: 10000,
	                        rules: ['trim', 'lower']
	                      },
	                      low: {
	                        maxLength: 10000,
	                        rules: ['trim', 'lower']
	                      }
	                    },
	                    strict: true
	                  }
	                }
	              },
	              strict: true
	            }
	          },
	          records: {
	            type: 'array',
	            items: {
	              properties: {
	                allMeta: {
	                  properties: {
	                    sku: {
	                      maxLength: 10000,
	                      rules: ['trim', 'lower'],
	                      type: 'string'
	                    },
	                    productId: {
	                      maxLength: 10000,
	                      rules: ['trim', 'lower'],
	                      type: 'string'
	                    }
	                  },
	                  strict: true
	                },
	                refinementMatches: {
	                  type: 'array',
	                  items: {
	                    properties: {
	                      name: {
	                        maxLength: 10000,
	                        rules: ['trim', 'lower']
	                      },
	                      values: {
	                        type: 'array',
	                        items: {
	                          properties: {
	                            value: {
	                              maxLength: 10000,
	                              rules: ['trim', 'lower']
	                            },
	                            count: {
	                              type: 'integer'
	                            }
	                          },
	                          strict: true
	                        }
	                      }
	                    },
	                    strict: true
	                  }
	                },
	                _id: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                _u: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                _t: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                collection: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                }
	              },
	              strict: true
	            }
	          },
	          didYouMean: {
	            type: 'array',
	            items: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            }
	          },
	          originalRequest: {
	            properties: {
	              collection: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              area: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              sessionId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              visitorId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              biasingProfile: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              language: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              customUrlParams: {
	                type: 'array',
	                items: {
	                  properties: {
	                    key: {
	                      maxLength: 10000,
	                      rules: ['trim', 'lower']
	                    },
	                    value: {
	                      maxLength: 10000,
	                      rules: ['trim', 'lower']
	                    }
	                  },
	                  strict: true
	                }
	              },
	              query: {
	                maxLength: 10000,
	                rules: ['trim', 'lower'],
	                exec: function exec(schema, post) {
	                  if (typeof post === 'string') {
	                    // Strip using blacklist
	                    post = post.replace(utils.regex.BLACKLIST_STRIPING_REGEX, ' ');

	                    // Replace all whitespace combinations with a single space
	                    post = post.replace(/\s\s+/g, ' ');

	                    post = post.trim();

	                    return post;
	                  } else {
	                    return post;
	                  }
	                }
	              },
	              refinementQuery: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              matchStrategyName: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              matchStrategy: {
	                properties: {
	                  name: {
	                    maxLength: 10000,
	                    rules: ['trim', 'lower']
	                  },
	                  rules: {
	                    type: 'array',
	                    items: {
	                      properties: {
	                        terms: {
	                          type: 'integer'
	                        },
	                        termsGreaterThan: {
	                          type: 'integer'
	                        },
	                        mustMatch: {
	                          type: 'integer'
	                        },
	                        percentage: {}
	                      },
	                      strict: true
	                    }
	                  }
	                },
	                strict: true
	              },
	              biasing: {
	                properties: {
	                  bringToTop: {
	                    type: 'array',
	                    items: {
	                      maxLength: 10000,
	                      rules: ['trim', 'lower']
	                    }
	                  },
	                  augmentBiases: {},
	                  influence: {
	                    type: 'number'
	                  },
	                  biases: {
	                    type: 'array',
	                    items: {
	                      properties: {
	                        name: {
	                          maxLength: 10000,
	                          rules: ['trim', 'lower']
	                        },
	                        content: {
	                          maxLength: 10000,
	                          rules: ['trim', 'lower']
	                        },
	                        strength: {
	                          maxLength: 10000,
	                          rules: ['trim', 'lower']
	                        }
	                      },
	                      strict: true
	                    }
	                  }
	                },
	                strict: true
	              },
	              skip: {
	                type: 'integer'
	              },
	              pageSize: {
	                type: 'integer'
	              },
	              returnBinary: {},
	              disableAutocorrection: {},
	              pruneRefinements: {},
	              sort: {
	                type: 'array',
	                items: {
	                  properties: {
	                    field: {
	                      maxLength: 10000,
	                      rules: ['trim', 'lower']
	                    },
	                    order: {
	                      maxLength: 10000,
	                      rules: ['trim', 'lower']
	                    }
	                  },
	                  strict: true
	                }
	              },
	              fields: {
	                type: 'array',
	                items: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                }
	              },
	              orFields: {
	                type: 'array',
	                items: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                }
	              },
	              wildcardSearchEnabled: {},
	              restrictNavigation: {
	                properties: {
	                  name: {
	                    maxLength: 10000,
	                    rules: ['trim', 'lower']
	                  },
	                  count: {
	                    type: 'integer'
	                  }
	                },
	                strict: true
	              },
	              includedNavigations: {
	                type: 'array',
	                items: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                }
	              },
	              excludedNavigations: {
	                type: 'array',
	                items: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                }
	              },
	              refinements: {
	                type: 'array',
	                items: {
	                  properties: {
	                    navigationName: {
	                      maxLength: 10000,
	                      rules: ['trim', 'lower']
	                    },
	                    type: {
	                      maxLength: 10000,
	                      rules: ['trim', 'lower']
	                    },
	                    _id: {
	                      maxLength: 10000,
	                      rules: ['trim', 'lower']
	                    },
	                    exclude: {},
	                    value: {
	                      maxLength: 10000,
	                      rules: ['trim', 'lower']
	                    },
	                    high: {
	                      maxLength: 10000,
	                      rules: ['trim', 'lower']
	                    },
	                    low: {
	                      maxLength: 10000,
	                      rules: ['trim', 'lower']
	                    }
	                  },
	                  strict: true
	                }
	              }
	            },
	            strict: true
	          }
	        },
	        strict: true
	      },
	      visit: {
	        properties: {
	          customerData: {
	            properties: {
	              visitorId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              sessionId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              loginId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              }
	            },
	            strict: true
	          }
	        },
	        strict: true
	      },
	      metadata: {
	        type: 'array',
	        items: {
	          properties: {
	            key: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            },
	            value: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            }
	          },
	          strict: true
	        },
	        optional: true
	      }
	    },
	    strict: true
	  }
	};

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(17);
	module.exports = {
	  validation: {
	    type: 'object',
	    properties: {
	      clientVersion: {
	        type: 'object',
	        properties: {
	          raw: {
	            type: 'string'
	          },
	          major: {
	            type: 'integer',
	            optional: true
	          },
	          minor: {
	            type: 'integer',
	            optional: true
	          },
	          patch: {
	            type: 'integer',
	            optional: true
	          },
	          prerelease: {
	            type: 'array',
	            items: {
	              type: 'string'
	            },
	            optional: true
	          },
	          build: {
	            type: 'array',
	            items: {
	              type: 'string'
	            },
	            optional: true
	          },
	          version: {
	            type: 'string',
	            optional: true
	          }
	        },
	        strict: true
	      },
	      eventType: {
	        type: 'string'
	      },
	      customer: {
	        type: 'object',
	        properties: {
	          id: {
	            type: 'string'
	          },
	          area: {
	            type: 'string',
	            optional: false
	          }
	        },
	        strict: true
	      },
	      session: {
	        type: 'object',
	        properties: {
	          previousSessionId: {
	            type: 'string',
	            optional: true
	          },
	          newSessionId: {
	            type: 'string'
	          },
	          previousVisitorId: {
	            type: 'string',
	            optional: true
	          },
	          newVisitorId: {
	            type: 'string'
	          }
	        },
	        strict: true
	      },
	      visit: {
	        type: 'object',
	        properties: {
	          customerData: {
	            type: 'object',
	            properties: {
	              visitorId: {
	                type: 'string'
	              },
	              sessionId: {
	                type: 'string'
	              },
	              loginId: {
	                type: 'string',
	                optional: true
	              }
	            },
	            strict: true
	          }
	        },
	        strict: true
	      },
	      metadata: {
	        type: 'array',
	        items: {
	          type: 'object',
	          properties: {
	            key: {
	              type: 'string'
	            },
	            value: {
	              type: 'string'
	            }
	          },
	          strict: true
	        },
	        optional: true
	      }
	    },
	    strict: true
	  },
	  sanitization: {
	    properties: {
	      clientVersion: {
	        properties: {
	          raw: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          },
	          major: {
	            type: 'integer',
	            optional: true
	          },
	          minor: {
	            type: 'integer',
	            optional: true
	          },
	          patch: {
	            type: 'integer',
	            optional: true
	          },
	          prerelease: {
	            type: 'array',
	            items: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            },
	            optional: true
	          },
	          build: {
	            type: 'array',
	            items: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            },
	            optional: true
	          },
	          version: {
	            maxLength: 10000,
	            rules: ['trim', 'lower'],
	            optional: true
	          }
	        },
	        strict: true
	      },
	      eventType: {
	        maxLength: 10000,
	        rules: ['trim']
	      },
	      customer: {
	        properties: {
	          id: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          },
	          area: {
	            maxLength: 10000,
	            rules: ['trim'],
	            optional: false,
	            def: 'Production'
	          }
	        },
	        strict: true
	      },
	      session: {
	        properties: {
	          previousSessionId: {
	            maxLength: 10000,
	            rules: ['trim', 'lower'],
	            optional: true
	          },
	          newSessionId: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          },
	          previousVisitorId: {
	            maxLength: 10000,
	            rules: ['trim', 'lower'],
	            optional: true
	          },
	          newVisitorId: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          }
	        },
	        strict: true
	      },
	      visit: {
	        properties: {
	          customerData: {
	            properties: {
	              visitorId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              sessionId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              loginId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              }
	            },
	            strict: true
	          }
	        },
	        strict: true
	      },
	      metadata: {
	        type: 'array',
	        items: {
	          properties: {
	            key: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            },
	            value: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            }
	          },
	          strict: true
	        },
	        optional: true
	      }
	    },
	    strict: true
	  }
	};

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(17);
	module.exports = {
	  validation: {
	    type: 'object',
	    properties: {
	      clientVersion: {
	        type: 'object',
	        properties: {
	          raw: {
	            type: 'string'
	          },
	          major: {
	            type: 'integer',
	            optional: true
	          },
	          minor: {
	            type: 'integer',
	            optional: true
	          },
	          patch: {
	            type: 'integer',
	            optional: true
	          },
	          prerelease: {
	            type: 'array',
	            items: {
	              type: 'string'
	            },
	            optional: true
	          },
	          build: {
	            type: 'array',
	            items: {
	              type: 'string'
	            },
	            optional: true
	          },
	          version: {
	            type: 'string',
	            optional: true
	          }
	        },
	        strict: true
	      },
	      eventType: {
	        type: 'string'
	      },
	      customer: {
	        type: 'object',
	        properties: {
	          id: {
	            type: 'string'
	          },
	          area: {
	            type: 'string',
	            optional: false
	          }
	        },
	        strict: true
	      },
	      product: {
	        type: 'object',
	        properties: {
	          category: {
	            type: 'string',
	            optional: true
	          },
	          collection: {
	            type: 'string',
	            optional: false
	          },
	          title: {
	            type: 'string'
	          },
	          sku: {
	            type: 'string',
	            optional: true
	          },
	          productId: {
	            type: 'string'
	          },
	          parentId: {
	            type: 'string',
	            optional: true
	          },
	          margin: {
	            type: 'number',
	            optional: true
	          },
	          price: {
	            type: 'number'
	          },
	          metadata: {
	            type: 'array',
	            items: {
	              type: 'object',
	              properties: {
	                key: {
	                  type: 'string'
	                },
	                value: {
	                  type: 'string'
	                }
	              },
	              strict: true
	            },
	            optional: true
	          }
	        },
	        strict: true
	      },
	      visit: {
	        type: 'object',
	        properties: {
	          customerData: {
	            type: 'object',
	            properties: {
	              visitorId: {
	                type: 'string'
	              },
	              sessionId: {
	                type: 'string'
	              },
	              loginId: {
	                type: 'string',
	                optional: true
	              }
	            },
	            strict: true
	          }
	        },
	        strict: true
	      },
	      metadata: {
	        type: 'array',
	        items: {
	          type: 'object',
	          properties: {
	            key: {
	              type: 'string'
	            },
	            value: {
	              type: 'string'
	            }
	          },
	          strict: true
	        },
	        optional: true
	      }
	    },
	    strict: true
	  },
	  sanitization: {
	    properties: {
	      clientVersion: {
	        properties: {
	          raw: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          },
	          major: {
	            type: 'integer',
	            optional: true
	          },
	          minor: {
	            type: 'integer',
	            optional: true
	          },
	          patch: {
	            type: 'integer',
	            optional: true
	          },
	          prerelease: {
	            type: 'array',
	            items: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            },
	            optional: true
	          },
	          build: {
	            type: 'array',
	            items: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            },
	            optional: true
	          },
	          version: {
	            maxLength: 10000,
	            rules: ['trim', 'lower'],
	            optional: true
	          }
	        },
	        strict: true
	      },
	      eventType: {
	        maxLength: 10000,
	        rules: ['trim']
	      },
	      customer: {
	        properties: {
	          id: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          },
	          area: {
	            maxLength: 10000,
	            rules: ['trim'],
	            optional: false,
	            def: 'Production'
	          }
	        },
	        strict: true
	      },
	      product: {
	        properties: {
	          category: {
	            maxLength: 10000,
	            rules: ['trim', 'lower'],
	            optional: true
	          },
	          collection: {
	            maxLength: 10000,
	            rules: ['trim'],
	            optional: false,
	            def: 'default'
	          },
	          title: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          },
	          sku: {
	            maxLength: 10000,
	            rules: ['trim', 'lower'],
	            optional: true
	          },
	          productId: {
	            maxLength: 10000,
	            rules: ['trim', 'lower']
	          },
	          parentId: {
	            maxLength: 10000,
	            rules: ['trim', 'lower'],
	            optional: true
	          },
	          margin: {
	            type: 'number',
	            optional: true
	          },
	          price: {
	            type: 'number'
	          },
	          metadata: {
	            type: 'array',
	            items: {
	              properties: {
	                key: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                },
	                value: {
	                  maxLength: 10000,
	                  rules: ['trim', 'lower']
	                }
	              },
	              strict: true
	            },
	            optional: true
	          }
	        },
	        strict: true
	      },
	      visit: {
	        properties: {
	          customerData: {
	            properties: {
	              visitorId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              sessionId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              },
	              loginId: {
	                maxLength: 10000,
	                rules: ['trim', 'lower']
	              }
	            },
	            strict: true
	          }
	        },
	        strict: true
	      },
	      metadata: {
	        type: 'array',
	        items: {
	          properties: {
	            key: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            },
	            value: {
	              maxLength: 10000,
	              rules: ['trim', 'lower']
	            }
	          },
	          strict: true
	        },
	        optional: true
	      }
	    },
	    strict: true
	  }
	};

/***/ })
/******/ ]);