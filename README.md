## GroupBy Tracking Client

This can be installed via npm with `npm install --save gb-tracker-client`

Or it can be directly included from our CDN using:
```
<script src="http://cdn.groupbycloud.com/dist/gb-tracker-client-canary.min.js"></scipt>
```

Including it directly from the CDN will create the global variable 
`_GbTracker` with the same API as below.

### API
```javascript
const _GbTracker = require('gb-tracker-client');
const gbTracker = new _GbTracker('customerId', 'area');

// Must set the visitor at least once before any events are sent
// Should be called on login/logout or any time the visitorId/sessionId change
gbTracker.setVisitor('visitorId', 'sessionId');

// There are four event API's.

// AddToBasket events
gbTracker.sendAddToBasketEvent({
 product:  {
   id:         'asdfasd',
   title:      'super boat',
   price:      100.21,
   qty:        20,
   collection: 'testcollection',  // Optional: Defaults to 'Default'
   category:   'boats',           // Optional
   sku:        'asdfasf98',       // Optional
   margin:     0.81               // Optional
 }
});

// Order events
gbTracker.sendOrderEvent({
 products:  [
   {
     id:         'asdfasd',
     title:      'super boat',
     price:      100.21,
     qty:        20,
     collection: 'testcollection',  // Optional: Defaults to 'Default'
     category:   'boats',           // Optional
     sku:        'asdfasf98',       // Optional
     margin:     0.81               // Optional
   },
   {
     id:         'asdfasd',
     title:      'super boat',
     price:      100.21,
     qty:        20,
     collection: 'testcollection',  // Optional: Defaults to 'Default'
     category:   'boats',           // Optional
     sku:        'asdfasf98',       // Optional
     margin:     0.123              // Optional
   }
 ]
});

// Search events
gbTracker.sendSearchEvent({
 search:   {
   origin:           {              // Optional  
     recommendations: false,
     dym:             false,
     sayt:            false,
     search:          true
   },
   searchTerm:       'searchy searchface',
   
   // Provided in search response from API
   searchUuid:       'e30a4611-64b0-49a1-ad56-ab8fa2ffcc10'    
 }
});

// ViewProduct events
gbTracker.sendViewProductEvent({
 product:  {
   id:         'asdfasd',
   title:      'super boat',
   price:      100.21,
   collection: 'testcollection',  // Optional: Defaults to 'Default'
   category:   'boats',           // Optional
   sku:        'asdfasf98',       // Optional
   margin:     0.81               // Optional
 }
});

// There are also navigation events, which are sent silently when page or URL changes

```
