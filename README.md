# GroupBy Tracker Client

[![CircleCI](https://circleci.com/gh/groupby/gb-tracker-client.svg?style=svg)](https://circleci.com/gh/groupby/gb-tracker-client)

This is the JavaScript SDK used to send beacons to GroupBy. It can only run in the browser. A bundled UMD build is available from our CDN (see GroupBy docs for CDN link) and a CommonJS build is available for linking into NPM build processes with a bundler. E.g. React, Angular.

Docs: https://docs.groupbyinc.com/documentation.html?e=wisdom&b=searchandiser&topic=100_EventTracking/00_OverviewAndInstallation.md

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
    <script src="http://cdn.groupbycloud.com/gb-tracker-client-3.min.js"></script>
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

To import and use the tracker, and types:

```typescript
import { GbTracker } from 'gb-tracker-client';

// all beacon types in 'models'
import { AddToCartEvent } from 'gb-tracker-client/models';

const tracker = new GbTracker('customer_id', 'area');
tracker.autoSetVisitor();

const a: AddToCartEvent = { ... };
tracker.sendAddToCartEvent(a);
```
