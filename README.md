## GroupBy Tracking Client
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/75c724f290884b72b305fc4b748bef95)](https://www.codacy.com/app/GroupByInc/gb-tracker-client?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=groupby/gb-tracker-client&amp;utm_campaign=Badge_Grade) [![CircleCI](https://circleci.com/gh/groupby/gb-tracker-client.svg?style=svg)](https://circleci.com/gh/groupby/gb-tracker-client) [![Coverage Status](https://coveralls.io/repos/github/groupby/gb-tracker-client/badge.svg?branch=master)](https://coveralls.io/github/groupby/gb-tracker-client?branch=master)

This can be installed via npm with `npm install --save gb-tracker-client`

Or it can be directly included from our CDN using:
```html
<!-- Always the latest non-breaking changes -->
<script src="http://cdn.groupbycloud.com/dist/gb-tracker-client-3.min.js"></script>
```

Including it directly from the CDN will create the global variable 
`GbTracker` with the same API as below.

Recommendations Request and API documentation can be found [here](http://docs.recommendations.groupbyinc.com/documentation.html?e=wisdom&topic=150_recommendations/01_RecommendationsRequests.md&cid=) (Requires your GroupBy documentation login)

### gb-tracker-client API
```javascript
var GbTracker = require('gb-tracker-client');
var gbTracker = new GbTracker('customerId', 'area');

// Automatically sets visitor and session from cookies
// Should be called on login/logout. Can be called without an argument if the user is anonymous
gbTracker.autoSetVisitor('someLoginId'); // login ID is optional

// There are six event API's.

// Auto Search events
gbTracker.sendAutoSearchEvent({
  search:   {
    origin:           {                       // Required: Search defaults to true
      recommendations: false,
      dym:             false,
      sayt:            false,
      search:          true,
      autosearch:      false,
      navigation:      false,
      collectionSwitcher: false
    },
    id: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', // Required: Search ID
  },
  metadata: [                            // Optional
    {
      key: 'some key',
      value: 'some value'
    }
  ]
});

// NOTE: The 'sendSearchEvent' function is still available, but deprecated. 
// Please use 'sendAutoSearchEvent' instead as shown above.

// AddToCart events
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


// ViewCart events
gbTracker.sendViewCartEvent({
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

// RemoveFromCart events
gbTracker.sendRemoveFromCartEvent({
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

```
