## GroupBy Tracking Client
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/75c724f290884b72b305fc4b748bef95)](https://www.codacy.com/app/GroupByInc/gb-tracker-client?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=groupby/gb-tracker-client&amp;utm_campaign=Badge_Grade) [![CircleCI](https://circleci.com/gh/groupby/gb-tracker-client.svg?style=svg)](https://circleci.com/gh/groupby/gb-tracker-client) [![Coverage Status](https://coveralls.io/repos/github/groupby/gb-tracker-client/badge.svg?branch=master)](https://coveralls.io/github/groupby/gb-tracker-client?branch=master)

This can be installed via npm with `npm install --save gb-tracker-client`

Or it can be directly included from our CDN using:
```
<script src="http://cdn.groupbycloud.com/dist/gb-tracker-client-3.2.0.min.js"></scipt>
```

Including it directly from the CDN will create the global variable 
`GbTracker` with the same API as below.

Recommendations API can be found [here](https://github.com/groupby/gb-tracker-client/blob/master/API.md)

### gb-tracker-client API
```javascript
var GbTracker = require('gb-tracker-client');
var gbTracker = new GbTracker('customerId', 'area');

// Must set the visitor at least once before any events are sent
// Should be called on login/logout or any time the visitorId/sessionId change
gbTracker.setVisitor('visitorId', 'sessionId');

// There are four event API's.

// AddToBasket events
gbTracker.sendAddToCartEvent({
 cart: {
   id: 'asfasdf',                     // Optional
   items:[  
     {
        productId:  'asdfasd',
        title:      'super boat',
        price:      100.21,
        quantity:   20,
        collection: 'testcollection',  // Optional: Defaults to 'Default'
        category:   'boats',           // Optional
        sku:        'asdfasf98',       // Optional
        margin:     0.81,              // Optional
        metadata: [                    // Optional
           {
             key: 'some key',
             value: 'some value'
           }
         ]
      }
   ],
   metadata: [                          // Optional
      {
        key: 'some key',
        value: 'some value'
      }
    ]
 },
 metadata: [                            // Optional
   {
     key: 'some key',
     value: 'some value'
   }
 ]
});

// Order events
gbTracker.sendOrderEvent({
 cart: {
   id: 'asfasdf',                     // Optional
   totalItems: 1,                     // Optional
   totalQuantity: 20,                 // Optional
   totalPrice: 1039.90,               // Optional
   items:[  
     {
        productId:  'asdfasd',
        title:      'super boat',
        price:      100.21,
        quantity:   20,
        collection: 'testcollection',  // Optional: Defaults to 'Default'
        category:   'boats',           // Optional
        sku:        'asdfasf98',       // Optional
        margin:     0.81,              // Optional
        metadata: [                    // Optional
           {
             key: 'some key',
             value: 'some value'
           }
         ]
      }
   ],
   metadata: [                          // Optional
      {
        key: 'some key',
        value: 'some value'
      }
    ]
 },
 metadata: [                            // Optional
   {
     key: 'some key',
     value: 'some value'
   }
 ]
});

// Search events
gbTracker.sendSearchEvent({
  search:   {
    origin:           {                       // Optional: Search defaults to true
      recommendations: false,
      dym:             false,
      sayt:            false,
      search:          true
    },
    id: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', // Optional: 40-character search ID
    totalRecordCount: 122,
    area:             'Default',
    biasingProfile:   'ThisBiasingProfile',   // Optional
    query:            'i searched for this',
    pageInfo: {           
      recordStart: 1,
      recordEnd:   24
    },
    matchStrategy: {                          // Optional: matchStrategy returned by searchandiser
      rules: [
        {
          termsGreaterThan: 1,
          mustMatch:        100,
          percentage:       true
        }
      ]
    },
    availableNavigation: [                    // Optional: Array of selectedNavigations returned by searchandiser
      {
        name:        'reg_price',
        displayName: 'Price',
        refinements: [
          {
            type:  'Range',
            count: 3,
            high:  '50',
            low:   '20'
          },
          {
            type:  'Range',
            count: 25,
            high:  '100',
            low:   '50'
          },
          {
            type:  'Range',
            count: 84,
            high:  '150',
            low:   '100'
          },
          {
            type:  'Range',
            count: 10,
            high:  '200',
            low:   '150'
          }
        ],
        metadata: [],
        range:    true,
        or:       false
      }
    ],
    selectedNavigation: [],  // Optional: Array of selectedNavigations returned by searchandiser
    records:            [],  // Optional: Array of records returned by searchandiser
    didYouMean: [
      'I should have searched for this'
    ]
  }
});

// ViewProduct events
gbTracker.sendViewProductEvent({
 product:  {
   productId:  'asdfasd',
   title:      'super boat',
   price:      100.21,
   collection: 'testcollection',  // Optional: Defaults to 'Default'
   category:   'boats',           // Optional
   sku:        'asdfasf98',       // Optional
   margin:     0.81,              // Optional
   metadata: [                    // Optional
      {
        key: 'some key',
        value: 'some value'
      }
    ]
 },
 metadata: [                            // Optional
   {
     key: 'some key',
     value: 'some value'
   }
 ]
});

// There are also navigation events, which are sent silently when page or URL changes

```
