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
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var uuid = __webpack_require__(2);
	var diff = __webpack_require__(3).diff;
	var inspector = __webpack_require__(4);
	var utils = __webpack_require__(5);
	var LZString = __webpack_require__(6);

	var VERSION = __webpack_require__(7).version;
	var Cookies = __webpack_require__(8);

	var SCHEMAS = {
	  addToCart: __webpack_require__(9),
	  order: __webpack_require__(11),
	  autoSearch: __webpack_require__(12),
	  search: __webpack_require__(13),
	  sessionChange: __webpack_require__(14),
	  viewProduct: __webpack_require__(15)
	};

	// Info on path length limitations: http://stackoverflow.com/a/812962
	var MAX_PATH_LENGTH = 4000; // Thanks NGINX
	var MAX_PATHNAME_LENGTH = 100; // '/v2/pixel/?random=0.5405421565044588&m=' plus extra for luck
	var MAX_SEGMENT_COUNT = 100;

	var overridenPixelUrl = null;

	var SET_FROM_COOKIES = 'setFromCookies';
	var NOT_SET_FROM_COOKIES = 'notSetFromCookies';
	var SESSION_TIMEOUT_SEC = 15 * 60;
	var SESSION_COOKIE_KEY = 'gbi_sessionId';
	var VISITOR_COOKIE_KEY = 'gbi_visitorId';

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

	    visitorId = visitorId && typeof visitorId === 'number' ? visitorId + '' : visitorId;
	    sessionId = sessionId && typeof sessionId === 'number' ? sessionId + '' : sessionId;

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
	      Cookies.set(VISITOR_COOKIE_KEY, visit.customerData.visitorId, { expires: Infinity });
	    }
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

	    if (window.DEBUG) {
	      // eslint-disable-next-line
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
	    var params = '?random\x3d' + Math.random(); // To bust the cache
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

	module.exports = Tracker;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("uuid");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("deep-diff");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("schema-inspector");

/***/ },
/* 5 */
/***/ function(module, exports) {

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
	  var u = {},
	      a = [];
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

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("lz-string/libs/lz-string.min.js");

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = {
		"name": "gb-tracker-client",
		"version": "3.3.3",
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
		"main": "index.js",
		"scripts": {
			"test": "gulp test",
			"coverage:codacy": "cat ./coverage/lcov.info | codacy-coverage"
		},
		"author": "Eric Hacke",
		"license": "MIT",
		"devDependencies": {
			"chai": "^3.5.0",
			"codacy-coverage": "^2.0.0",
			"gulp": "^3.9.1",
			"gulp-eslint": "^3.0.1",
			"gulp-exec": "^2.1.3",
			"gulp-if": "^2.0.2",
			"gulp-istanbul": "^1.1.1",
			"gulp-mocha": "^3.0.1",
			"gulp-util": "^3.0.7",
			"istanbul": "^0.4.3",
			"jsdom": "^9.9.1",
			"lodash": "^4.16.6",
			"moment": "^2.17.1",
			"stream-combiner2": "^1.1.1",
			"stringify-object": "3.0.0",
			"supertest": "^2.0.1",
			"supertest-as-promised": "^4.0.2",
			"webpack": "^1.13.3",
			"webpack-node-externals": "^1.5.4",
			"webpack-stream": "^3.2.0"
		},
		"dependencies": {
			"babel-core": "^6.21.0",
			"babel-loader": "^6.2.10",
			"babel-preset-latest": "^6.16.0",
			"cookies-js": "^1.2.3",
			"deep-diff": "^0.3.4",
			"json-loader": "^0.5.4",
			"lz-string": "^1.4.4",
			"mocha": "^3.1.2",
			"schema-inspector": "^1.6.8",
			"uuid": "^2.0.3"
		}
	};

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("cookies-js");

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(10);
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

/***/ },
/* 10 */
/***/ function(module, exports) {

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

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(10);
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

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(10);
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
	        optional: false
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

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(10);
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

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(10);
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

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(10);
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

/***/ }
/******/ ]);