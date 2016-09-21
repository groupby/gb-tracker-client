var SENT_TIMEOUT = 5000;

var app = angular.module('formExample', []);

var chance = new Chance();

var getUuid = function () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

var sendEvent = function (scope, sentTimeout, tracker, eventName) {
  scope.sent = false;
  sentTimeout && clearTimeout(sentTimeout);

  try {
    scope.event = JSON.parse(scope.eventString);
  } catch (error) {
    console.error(error.message);
    scope.error = error.message;
    return;
  }

  scope.eventString = JSON.stringify(scope.event, null, 2);
  scope.error       = '';
  scope.sent        = true;

  tracker.setInvalidEventCallback(function (event, error) {
    sentTimeout && clearTimeout(sentTimeout);
    scope.error = error;
  });

  sentTimeout = setTimeout(function () {
    scope.$apply(function () {
      scope.sent  = false;
      sentTimeout = null;
    });
  }, SENT_TIMEOUT);

  tracker[eventName](scope.event);
};

app.service('tracker', function () {
  var tracker  = null;
  var customer = {};

  this.initialize = function (customerId, area, key, pixelPath) {
    tracker             = new window.GbTracker(customerId, area, pixelPath);
    customer.customerId = customerId;
    customer.area       = area;
    customer.key        = key;

    tracker.setVisitor('testvisitor', 'testsession');
  };

  this.isInitialized = function () {
    return tracker !== null;
  };

  this.getCustomer = function () {
    return customer;
  };

  this.setInvalidEventCallback = function (callback) {
    tracker.setInvalidEventCallback(callback);
  };

  this.setVisitor = function (visitorId, sessionId) {
    if (!tracker) {
      console.error('Set customer ID, area, and key first');
      return;
    }

    tracker.setVisitor(visitorId, sessionId);
  };

  this.sendAddToCartEvent = function (event) {
    if (!tracker) {
      console.error('Set customer ID, area, and key first');
      return
    }

    tracker.sendAddToCartEvent(event);
  };

  this.sendOrderEvent = function (event) {
    if (!tracker) {
      console.error('Set customer ID, area, and key first');
      return
    }

    tracker.sendOrderEvent(event);
  };

  this.sendSearchEvent = function (event) {
    if (!tracker) {
      console.error('Set customer ID, area, and key first');
      return
    }

    tracker.sendSearchEvent(event);
  };

  this.sendAutoSearchEvent = function (event) {
    if (!tracker) {
      console.error('Set customer ID, area, and key first');
      return
    }

    tracker.sendAutoSearchEvent(event);
  };

  this.sendViewProductEvent = function (event) {
    if (!tracker) {
      console.error('Set customer ID, area, and key first');
      return
    }

    tracker.sendViewProductEvent(event);
  };
});

app.controller('SelectEventController', [
  '$scope',
  function (scope) {
    scope.eventTypes    = [
      'addToCart',
      'order',
      'autoSearch',
      'search',
      'viewProduct'
    ];
    scope.selectedEvent = scope.eventTypes[0];
  }
]);

app.controller('SetCustomerController', [
  '$scope',
  'tracker',
  function (scope, tracker) {
    scope.customerId    = '';
    scope.area          = 'RecommendationsSandbox';
    scope.key           = '';
    scope.pixelPath     = '';
    scope.allowOverride = false;

    scope.init = function () {
      tracker.initialize(scope.customerId, scope.area, scope.key, scope.pixelPath);
    };

    scope.override = function () {
      scope.allowOverride = !scope.allowOverride;
    };

    scope.isReady = tracker.isInitialized;
  }
]);

app.controller('SetVisitorController', [
  '$scope',
  'tracker',
  function (scope, tracker) {

    scope.isReady    = tracker.isInitialized;
    scope.visitorSet = true;
  }
]);

app.controller('AddToCartController', [
  '$scope',
  'tracker',
  function (scope, tracker) {
    var sentTimeout = null;

    scope.randomize = function () {
      scope.event = {
        cart: {
          id:    getUuid(),
          items: [
            {
              productId:  getUuid(),
              category:   chance.word(),
              collection: chance.word(),
              title:      chance.word(),
              sku:        getUuid(),
              price:      chance.floating({
                min:   0,
                max:   100,
                fixed: 2
              }),
              quantity:   chance.integer({
                min: 1,
                max: 20
              })
            },
            {
              productId:  getUuid(),
              category:   chance.word(),
              collection: chance.word(),
              title:      chance.word(),
              sku:        getUuid(),
              price:      chance.floating({
                min:   0,
                max:   100,
                fixed: 2
              }),
              quantity:   chance.integer({
                min: 1,
                max: 20
              })
            }
          ]
        }
      };
    };

    scope.randomize();

    scope.eventString = JSON.stringify(scope.event, null, 2);
    scope.error       = '';

    scope.send = function () {
      sendEvent(scope, sentTimeout, tracker, 'sendAddToCartEvent');
    }
  }
]);

app.controller('OrderController', [
  '$scope',
  'tracker',
  function (scope, tracker) {
    var sentTimeout = null;

    scope.randomize = function () {
      scope.event = {
        cart: {
          id:    getUuid(),
          items: [
            {
              productId:  getUuid(),
              category:   chance.word(),
              collection: chance.word(),
              title:      chance.word(),
              sku:        getUuid(),
              price:      chance.floating({
                min:   0,
                max:   100,
                fixed: 2
              }),
              quantity:   chance.integer({
                min: 1,
                max: 20
              })
            },
            {
              productId:  getUuid(),
              category:   chance.word(),
              collection: chance.word(),
              title:      chance.word(),
              sku:        getUuid(),
              price:      chance.floating({
                min:   0,
                max:   100,
                fixed: 2
              }),
              quantity:   chance.integer({
                min: 1,
                max: 20
              })
            }
          ]
        }
      };
    };

    scope.randomize();

    scope.eventString = JSON.stringify(scope.event, null, 2);
    scope.error       = '';

    scope.send = function () {
      sendEvent(scope, sentTimeout, tracker, 'sendOrderEvent');
    }
  }
]);

app.controller('SearchController', [
  '$scope',
  'tracker',
  function (scope, tracker) {
    var sentTimeout = null;

    scope.randomize = function () {
      scope.event = {
        search: {
          totalRecordCount:    chance.integer({
            min: 1,
            max: 20
          }),
          pageInfo:            {
            recordEnd:   chance.integer({
              min: 1,
              max: 20
            }),
            recordStart: chance.integer({
              min: 1,
              max: 20
            })
          },
          selectedNavigation:  [
            {
              name:        chance.word(),
              displayName: chance.word() + ' ' + chance.word(),
              or:          false,
              refinements: [
                {
                  type:  'value',
                  value: chance.word(),
                  count: chance.integer({
                    min: 1,
                    max: 500
                  })
                }
              ]
            },
            {
              name:        chance.word(),
              displayName: chance.word() + ' ' + chance.word(),
              or:          false,
              refinements: [
                {
                  type:  'value',
                  value: chance.word(),
                  count: chance.integer({
                    min: 1,
                    max: 500
                  })
                }
              ]
            }
          ],
          availableNavigation: [
            {
              name:        chance.word(),
              displayName: chance.word() + ' ' + chance.word(),
              or:          false,
              refinements: [
                {
                  type:  'value',
                  value: chance.word(),
                  count: chance.integer({
                    min: 1,
                    max: 500
                  })
                }
              ]
            },
            {
              name:        chance.word(),
              displayName: chance.word() + ' ' + chance.word(),
              or:          false,
              refinements: [
                {
                  type:  'value',
                  value: chance.word(),
                  count: chance.integer({
                    min: 1,
                    max: 500
                  })
                }
              ]
            }
          ],
          origin:              {
            search:          true,
            dym:             false,
            sayt:            false,
            recommendations: false
          },
          query:               chance.word() + ' ' + chance.word() + ' ' + chance.word() + ' ' + chance.word()
        }
      };
    };

    scope.randomize();

    scope.eventString = JSON.stringify(scope.event, null, 2);
    scope.error       = '';

    scope.send = function () {
      sendEvent(scope, sentTimeout, tracker, 'sendSearchEvent');
    }
  }
]);

app.controller('AutoSearchController', [
  '$scope',
  'tracker',
  function (scope, tracker) {
    var sentTimeout = null;

    scope.randomize = function () {
      scope.event = {
        responseId: getUuid(),
        search:     {
          origin: {
            search:          true,
            dym:             false,
            sayt:            false,
            recommendations: false
          }
        }
      };
    };

    scope.randomize();

    scope.eventString = JSON.stringify(scope.event, null, 2);
    scope.error       = '';

    scope.send = function () {
      sendEvent(scope, sentTimeout, tracker, 'sendAutoSearchEvent');
    }
  }
]);

app.controller('ViewProductController', [
  '$scope',
  'tracker',
  function (scope, tracker) {
    var sentTimeout = null;

    scope.randomize = function () {
      scope.event = {
        product: {
          productId:  getUuid(),
          category:   chance.word(),
          collection: chance.word(),
          title:      chance.word(),
          sku:        getUuid(),
          price:      chance.floating({
            min:   0,
            max:   100,
            fixed: 2
          }),
          quantity:   chance.integer({
            min: 1,
            max: 20
          })
        }
      };
    };

    scope.randomize();

    scope.eventString = JSON.stringify(scope.event, null, 2);
    scope.error       = '';

    scope.send = function () {
      sendEvent(scope, sentTimeout, tracker, 'sendViewProductEvent');
    }
  }
]);