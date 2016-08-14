window._gb_tracker = new window._GbTracker('testcustomer', 'testarea');
window._gb_tracker.setVisitor('visitor', 'session');

var app = angular.module('formExample', []);

app.controller('SetPathController', [
  '$scope',
  function (scope) {
    scope.path   = 'http://localhost:8001/pixel/';
    window._GbTracker.__overridePixelPath(scope.path);
    scope.update = function () {
      window._GbTracker.__overridePixelPath(scope.path);
    }
  }
]);

app.controller('AddToBasketController', [
  '$scope',
  function (scope) {
    scope.event = {
      product:  {
        id:         'asdfasd',
        category:   'boats',
        collection: 'kayaksrus',
        title:      'kayak',
        sku:        'asdfasf98',
        price:      100.21,
        qty: 2
      }
    };

    scope.send = function () {
      console.log('sending: ', JSON.stringify(scope.event, null, 2));
      window._gb_tracker.sendAddToBasketEvent(scope.event);
    };
  }
]);

app.controller('OrderController', [
  '$scope',
  function (scope) {
    scope.event = {
      products: [
        {
          id:         'asdfasd',
          category:   'boats',
          collection: 'kayaksrus',
          title:      'kayak',
          sku:        'asdfasf98',
          price:      100.21,
          qty: 2
        },
        {
          id:         'rrr',
          category:   'boats',
          collection: 'kayaksrus',
          title:      'kayak',
          sku:        'asdfasf98',
          price:      55.55,
          qty: 2
        }
      ]
    };

    scope.send = function () {
      console.log('sending: ', JSON.stringify(scope.event, null, 2));
      window._gb_tracker.sendOrderEvent(scope.event);
    };
  }
]);

app.controller('SearchController', [
  '$scope',
  function (scope) {
    scope.event = {
      search:   {
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

    scope.send = function () {
      console.log('sending: ', JSON.stringify(scope.event, null, 2));
      window._gb_tracker.sendSearchEvent(scope.event);
    };
  }
]);

app.controller('ViewProductController', [
  '$scope',
  function (scope) {
    scope.event = {
      product:   {
        id:         'asdfasd',
        category:   'boats',
        collection: 'kayaksrus',
        title:      'kayak',
        sku:        'asdfasf98',
        price:      100.21
      }
    };

    scope.send = function () {
      console.log('sending: ', JSON.stringify(scope.event, null, 2));
      window._gb_tracker.sendViewProductEvent(scope.event);
    };
  }
]);