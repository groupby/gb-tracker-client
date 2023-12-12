## View product
For sending details of which product (or SKU within a product) the shopper is viewing details of

```typescript
import {ViewProductEvent} from "./models";

const event: ViewProductEvent = {
    product: {
        productId: 'boat111', 
        category: 'boats', 
        collection: 'boats', 
        title: 'black boat', 
        sku: 'boat111_1', 
        price: 100.21
    }
};

tracker.sendViewProductEvent(event);
```

## Home page view
For sending details of products (or SKU within a product) displayed on home page

```typescript
import {HomePageViewEvent} from "./models";

const event: HomePageViewEvent = {
    products: [
        {
            productId: 'boat111', 
            category: 'boats', 
            collection: 'boats', 
            title: 'black boat', 
            sku: 'boat111_1', 
            price: 100.21
        },
        {
            productId: 'boat112', 
            category: 'boats', 
            collection: 'boats', 
            title: 'white boat', 
            sku: 'boat112_1', 
            price: 100.21
        }
    ]
};
tracker.sendHomePageViewEvent(event);
```

## Search
Event type is used in case of:
- Sends details of the search in case other than GroupBy search API is used
- For performing an A/B test between client's existing search engine and GroupBy Search

```typescript
import {SearchEvent} from "./models";

const event: SearchEvent = {
    search:
        {
            id: '1',
            totalRecordCount: 2,
            query: 'Boats',
            records: [
                {
                    _id: 'boat111', 
                    _u: 'https://boats.com/boat111', 
                    _t: 'black boat'
                },
                {
                    _id: 'boat112', 
                    _u: 'https://boats.com/boat112', 
                    _t: 'white boat'
                }
            ],
            pageInfo: {recordStart: 1, recordEnd: 2},
            selectedNavigation: [
                {'name': 'type', 'displayName': 'Type', 'refinements': [{'type': 'value', 'value': 'boats'}]}
            ],
            origin: {}
        }
};
tracker.sendSearchEvent(event);
```

## Auto search
After performing a search using a GroupBy search API, this is used for sending details of the search to GroupBy's beacon API. The details are sent from the web browser using this event instead of being retrieved internally by GroupBy so that client tracking works correctly and aligns with the rest of the event types which must be sent from the client

```typescript
import {AutoSearchEvent} from "./models";

const event: AutoSearchEvent = {
    search: {
        id: '1',
        origin: {search: true}
    }
};
tracker.sendAutoSearchEvent(event);
```

## Add to cart
For sending details of which products (or SKUs within products) the shopper is adding to their cart

You must only include the products or SKUs that the shopper is adding to their cart during this event, not the products or SKUs the cart has after this event occurs

```typescript
import {AddToCartEvent} from "./models";

const event: AddToCartEvent = {
    cart: {
        items: [
            {
                productId: 'boat111',
                category: 'boats',
                collection: 'boats',
                title: 'black boat',
                sku: 'boat111_1',
                price: 100.21,
                quantity: 1
            },
            {
                productId: 'boat112',
                category: 'boats',
                collection: 'boats',
                title: 'white boat',
                sku: 'boat112_1',
                price: 100.21,
                quantity: 1
            }
        ]
    }
};
tracker.sendAddToCartEvent(event);
```

## Add to cart
For sending details of which products (or SKUs within products) the shopper is adding to their cart

You must only include the products or SKUs that the shopper is adding to their cart during this event, not the products or SKUs the cart has after this event occurs

```typescript
import {AddToCartEvent} from "./models";

const event: AddToCartEvent = {
    cart: {
        items: [
            {
                productId: 'boat111',
                category: 'boats',
                collection: 'boats',
                title: 'black boat',
                sku: 'boat111_1',
                price: 100.21,
                quantity: 1
            },
            {
                productId: 'boat112',
                category: 'boats',
                collection: 'boats',
                title: 'white boat',
                sku: 'boat112_1',
                price: 100.21,
                quantity: 1
            }
        ]
    }
};
tracker.sendAddToCartEvent(event);
```

## Remove from cart
For sending details of which products (or SKUs within products) the shopper is removing from their cart.

You must only include the products or SKUs that the shopper is removing from their cart during this event, not the products or SKUs the cart has after this event occurs.

```typescript
import {RemoveFromCartEvent} from "./models";

const event: RemoveFromCartEvent = {
    cart: {
        items: [
            {
                productId: 'boat111',
                category: 'boats',
                collection: 'boats',
                title: 'black boat',
                sku: 'boat111_1',
                price: 100.21,
                quantity: 1
            },
            {
                productId: 'boat112',
                category: 'boats',
                collection: 'boats',
                title: 'white boat',
                sku: 'boat112_1',
                price: 100.21,
                quantity: 1
            }
        ]
    }
};
tracker.sendRemoveFromCartEvent(event);
```

## Order
For sending details of which products (or SKUs within products) the shopper is ordering.

```typescript
import {OrderEvent} from "./models";

const event: OrderEvent = {
    cart: {
        items: [
            {
                productId: 'boat111',
                category: 'boats',
                collection: 'boats',
                title: 'black boat',
                sku: 'boat111_1',
                price: 100.21,
                quantity: 1
            },
            {
                productId: 'boat112',
                category: 'boats',
                collection: 'boats',
                title: 'white boat',
                sku: 'boat112_1',
                price: 100.21,
                quantity: 1
            }
        ]
    }
};
tracker.sendOrderEvent(event);
```
