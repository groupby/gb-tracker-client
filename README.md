# GroupBy Tracker Client

![Node.js CI badge](https://github.com/groupby/gb-tracker-client/actions/workflows/node.js.yml/badge.svg)
![CodeQL static code analytics badge](https://github.com/groupby/gb-tracker-client/actions/workflows/codeql-analysis.yml/badge.svg)

This is the JavaScript SDK used to send beacons to GroupBy. It can only run in the browser. A bundled UMD build is available from our CDN (see GroupBy docs for CDN link) and a CommonJS build is available for linking into NPM build processes with a bundler. E.g. React, Angular.

## Usage from CDN

Add the CDN `<script>` to each page, above where the tracker is instantiated and used:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <script src="http://cdn.groupbycloud.com/gb-tracker-client-<major_version>.min.js"></script>
    <script>
        var tracker = new GbTracker('customer_id', 'area');
        tracker.autoSetVisitor();

        tracker.sendAddToCartEvent({ ... });
    </script>
</head>
<body>
</body>
</html>
```

## Usage with NPM

To import and use the tracker:

```javascript
import { GbTracker } from 'gb-tracker-client';

const tracker = new GbTracker('customer_id', 'area');
tracker.autoSetVisitor();

tracker.sendAddToCartEvent({ ... });
```

If you're using TypeScript, you can also use the types for each event type. Each
function has a corresponding TypeScript type that can be imported:

```typescript
import { GbTracker } from 'gb-tracker-client';
import { AddToCartEvent } from 'gb-tracker-client/models';

const tracker = new GbTracker('customer_id', 'area');
tracker.autoSetVisitor();

const a: AddToCartEvent = { ... };
tracker.sendAddToCartEvent(a);
```

## Options

The constructor for the tracker client has a third, optional parameter for providing options:

```typescript
const tracker = new GbTracker('customer_id', 'area', {
    overrideUrl: '<some_url>' // Optional, overrides the URL the beacon is sent to. Useful for testing.
});
```

## Shopper tracking

The first party cookie `gbi_visitorId` is set with an empiry time of 1 year that is extended each time the shopper visits again. This is used to anonymously track the shopper.

### 5.0.0 changes

**IMPORTANT**

As of version 5.0.0, the way shopper tracking works has changed and includes cross-domain support. Shoppers will be tracked across your domains if cross-domain rules are met (see next section). Tracking on domains whose apex domain has a two-level suffix is supported from version 5.1.2. Examples:

- `.com` -  You can use version **5.0.0** or higher.
- `.co.uk` - You can use version **5.1.2** or higher.

### Cross-domain rules

For shoppers to be tracked across your domains, the domains must share the same apex domain. Examples:
  
- `a.example.com` and `b.example.com`
- `a.example.com` and `example.com`
- `example.com` and `a.example.com`

Starting with version 5.1.2, many two-level domain suffixes such as `.co.uk` are also supported.
If your domain has a multi-level suffix that is not in the [list of supported domain suffixes](src/slds.ts), please contact support@groupbyinc.com for assistance.

### Upgrading from versions 3 or 4 and visitor ID re-use

If you upgrade from 3 or 4 to 5, the visitor ID values generated by version 3 or 4 of the tracker client will be re-used. Whichever domain the shopper visits next once you start using version 5, the visitor ID generated for that domain will be re-used as the visitor ID for the apex domain, thereafter shared between each of your domains.

For example, if a shopper performed the following events, the visitor ID `abc` would be re-used:

- Visits `www.example.com`, at which point version 3 or 4 sets the visitor ID to `abc`.
- Performs a search.
- Views a product and adds it to their cart (where they're brought to `checkout.example.com`), at which point version 3 or 4 sets the visitor ID to `bcd`.
- Decides not to follow through with purchasing the product.
- Waits a while, but less than a year, during which time you upgrade to version 5.
- Visits the site again, clicks their cart (at which point version 5 replaces the visitor ID `bcd` with `abc`), and completes the purchase.

## More Usage Details

See the docs for more detailed information about implementing beacons:

https://docs.groupbycloud.com/gb-docs/gb-implementation/beacons/overview
