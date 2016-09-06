window._gb_tracker = new window._GbTracker('eric', 'testarea');

var app = angular.module('formExample', []);

var chance = new Chance();

var getUuid = function () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

app.service('tracker', function () {
  var tracker = null;
  var apiKey  = null;

  this.initialize = function (customerId, area, key) {
    tracker = new new window._GbTracker(customerId, area);
    apiKey  = key;
  };

  this.isInitialized = function () {
    return !!tracker;
  };

  this.setVisitor = function (visitorId, sessionId) {
    if (!tracker) {
      console.error('Set customer ID, area, and key first');
      return
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

  this.sendViewProductEvent = function (event) {
    if (!tracker) {
      console.error('Set customer ID, area, and key first');
      return
    }

    tracker.sendViewProductEvent(event);
  };
});

app.controller('SetCustomerController', [
  '$scope',
  'tracker',
  function (scope, tracker) {
    scope.customerId = '';
    scope.area       = 'Default';
    scope.key        = '';

    scope.init = function () {
      tracker.initialize(scope.customerId, scope.area, scope.key);
    }
  }
]);

app.controller('SetVisitorController', [
  '$scope',
  'tracker',
  function (scope, tracker) {
    scope.visitorId = getUuid();
    scope.sessionId = getUuid();

    scope.isReady = tracker.isInitialized;

    scope.show = false;

    scope.toggle = function () {
      scope.show = !scope.show;
    };

    scope.send = function () {
      console.log('setting visitorID: ' + scope.visitorId + ' sessionId: ' + scope.sessionId);
      tracker.setVisitor(scope.visitorId, scope.sessionId);
    };
  }
]);

app.controller('AddToCartController', [
  '$scope',
  'tracker',
  function (scope, tracker) {

    scope.randomize = function () {
      scope.event = {
        product: {
          id:         getUuid(),
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

    scope.isReady = tracker.isInitialized;

    scope.show = false;

    scope.toggle = function () {
      scope.show = !scope.show;
    };

    scope.error = '';

    scope.send = function () {
      try {
        scope.event = JSON.parse(scope.eventString);
      } catch (error) {
        console.error(error.message);
        scope.error = error.message;
        return;
      }

      scope.eventString = JSON.stringify(scope.event, null, 2);

      console.log('sending: ', JSON.stringify(scope.event, null, 2));
      tracker.sendAddToCartEvent(scope.event);
    };
  }
]);

app.controller('OrderController', [
  '$scope',
  'tracker',
  function (scope, tracker) {
    scope.event = {
      products: [
        {
          id:         'asdfasd',
          category:   'boats',
          collection: 'kayaksrus',
          title:      'kayak',
          sku:        'asdfasf98',
          price:      100.21,
          qty:        2
        },
        {
          id:         'rrr',
          category:   'boats',
          collection: 'kayaksrus',
          title:      'kayak',
          sku:        'asdfasf98',
          price:      55.55,
          qty:        2
        }
      ]
    };

    scope.isReady = tracker.isInitialized;

    scope.show = false;

    scope.toggle = function () {
      scope.show = !scope.show;
    };

    scope.send = function () {
      console.log('sending: ', JSON.stringify(scope.event, null, 2));
      tracker.sendOrderEvent(scope.event);
    };
  }
]);

app.controller('SearchController', [
  '$scope',
  'tracker',
  function (scope, tracker) {
    scope.event = {
      search: {
        totalRecordCount: 10,
        recordEnd:        10,
        recordStart:      5,
        refinements:      [
          {
            refinement: {
              name:  'refined 1',
              value: 'refinedValue'
            }
          }
        ],
        origin:           {},
        searchResponse:   'asdfasdf',
        searchTerm:       'searchy searchface'
      }
    };

    scope.isReady = tracker.isInitialized;

    scope.show = false;

    scope.toggle = function () {
      scope.show = !scope.show;
    };

    scope.send = function () {
      console.log('sending: ', JSON.stringify(scope.event, null, 2));
      tracker.sendSearchEvent(scope.event);
    };
  }
]);

app.controller('ViewProductController', [
  '$scope',
  'tracker',
  function (scope, tracker) {
    scope.event = {
      product: {
        id:         'asdfasd',
        category:   'boats',
        collection: 'kayaksrus',
        title:      'kayak',
        sku:        'asdfasf98',
        price:      100.21
      }
    };

    scope.isReady = tracker.isInitialized;

    scope.show = false;

    scope.toggle = function () {
      scope.show = !scope.show;
    };

    scope.send = function () {
      console.log('sending: ', JSON.stringify(scope.event, null, 2));
      tracker.sendViewProductEvent(scope.event);
    };
  }
]);