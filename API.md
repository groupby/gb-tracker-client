#API

Assume all API calls are prefixed with `<customerId>.groupbycloud.com/wisdom/v2`

## General Request Format
All requests to the V2 API follow the same basic format. If they require parameters, those are supplied via POST data
in the following format:

```javascript
{
  window: 'week',       // Optional: (day, week, month) previous time ending now, over which to gather results
  size: 10,             // Optional: number of results to return
  target: 'productId',  // Optional: (productId, sku) field on product data to aggregate over
  type: 'order',        // Optional: (order, viewProduct, addToCart) event type to base recommendations on
  queries: {            // Optional: restrict results with partial matches against these fields
    product: {
      title: string,
      category: string
    },
    search: {
      query: string
    }
  },
  filters: {            // Optional: restrict results with exact matches or exclusions against these fields
    must: {
      product: {
        title: string,
        category: string,
        collection: string,
        sku: string,
        productId: string,
        margin: number,        
        price: number,   
        quantity: number
      },
      search: {
        query: string,
        origin: {
          sayt: boolean,
          dym: boolean,
          search: boolean,
          recommendations: boolean
        },
        totalRecordCount: number, 
        pageInfo: {
          recordStart: number,   
          recordEnd: number       
        },
        selectedNavigation: {
          name: string,
          displayName: string,
          refinements: {
            type: string,
            count: number,
            value: string,
            low: string,
            high: string
          }
        },
        availableNavigation: {}
      },
      visit: {
        generated: {
          language: string,
          geo: {
            country: string,
            region: string,
            city: string,
            location: {
              distance: '12km', 
              center: {
                lat: latitude,
                lon: longitude
              }
            }
          }
        }
      }
    },
    mustNot: {}
  }
}
```

Any filtering fields marked as `number` above allow greater-than/less-than type range queries in combination.
Or an `exact` can be used for an exact match.

```javascript
{
  gt: 0,
  gte: 0,
  lt: 100,
  lte: 100,
  exact: 100
}
```

## Recommendations API

### POST /recommendations/products/_getTrending
Get products that are overrepresented in the window specified with comparison to a larger background set.

- `type` can be `order`, `viewProduct`, or `addToCart`
- `target` can be `sku`, or `productId`
- only takes `product` and `visit` filters and queries

### POST /recommendations/products/_getPopular
Get products that are the most commonly seen in the window specified.

- `type` can be `order`, `viewProduct`, or `addToCart`
- `target` can be `sku`, or `productId`
- only takes `product` and `visit` filters and queries
 
### POST /recommendations/searches/_getTrending
Get search queries that are overrepresented in the window specified with comparison to a larger background set.

- only takes `search` and `visit` filters and queries

### POST /recommendations/searches/_getPopular
Get search queries that are the most commonly seen in the window specified.

- only takes `search` and `visit` filters and queries

### POST /recommendations/refinements/_getPopular
Get refinements that are the most commonly seen in the window specified.

- only takes `search` and `visit` filters and queries

## Stats API

### POST /stats/_getProductViews
Get a list of the most popularly viewed products and how many times they were viewed. Views by bots (googlebot, bingbot, etc) will be filtered out by default.

- `target` can be `sku`, or `productId`
- only takes `product` and `visit` filters and queries

### POST /stats/_getProductOrders
Get a list of the most popularly ordered products and how many times they were ordered. 

- `target` can be `sku`, or `productId`
- only takes `product` and `visit` filters and queries

### POST /stats/_getProductCartAdds
Get a list of the product most commonly added to cart and how many times they were added. 

- `target` can be `sku`, or `productId`
- only takes `product` and `visit` filters and queries

## Events API
Useful for checking on the status of your beaconing code.

All of these act within the specified window, defaults to `day`. Filters and queries can be applied to narrow the count.

### GET or POST /events
Returns the counts for all event types.

### GET or POST /events/addToCart
Returns count and last 10 events for addToCart.

### GET or POST /events/order
Returns count and last 10 events for order.

### GET or POST /events/search
Returns count and last 10 events for search

### GET or POST /events/sessionChange
Returns count and last 10 events for sessionChange

### GET or POST /events/viewProduct
Returns count and last 10 events for viewProduct