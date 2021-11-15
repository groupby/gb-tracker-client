# GroupBy Tracker Client

![example workflow](https://github.com/groupby/gb-tracker-client/actions/workflows/node.js.yml/badge.svg)

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
    <script src="http://cdn.groupbycloud.com/gb-tracker-client-4.min.js"></script>
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

## More Usage Details

See the docs for more detailed information about implementing beacons:

https://docs.groupbycloud.com/gb-docs/gb-implementation/beacons/overview
