# GroupBy Tracker Client

This is the JavaScript SDK used to send beacons to GroupBy. It can only run in the browser. A bundled UMD build is available from our CDN (see GroupBy docs for CDN link) and a CommonJS build is available for linking into NPM build processes with a bundler. E.g. React, Angular.

Docs: https://docs.groupbyinc.com/documentation.html?e=wisdom&b=searchandiser&topic=100_EventTracking/00_Installation.md

## Usage with NPM

To import and use the tracker, and types:

```typescript
import { GbTracker } from 'gb-tracker-client';

// all beacon types in 'models'
import { AddToCartEvent } from 'gb-tracker-client/models';

const tracker = new GbTracker('customer_id', 'area');

const a: AddToCartEvent = { ... };
tracker.sendAddToCartEvent(a);
```

## Testing

Run `npm test`.

## Testing manually

The directory `example-server` contains our "ref-rec" app, an Express.js app that will serve the built tracker and provide a GUI for sending beacons to a test customer and area.

Run `npm run startExampleServer`. It will complete a browser build, copy the build bundle into the example server's public directory, and start the server on port `3000`.

## Recreating validation/sanitization schemas

Run `npm run generateSchemas`. This will grab the schema-inspector schemas from `@groupby/beacon-models` and process them using the `buildSchemas.ts` helper script to remove schemas related to the portions of the beacons not passed as arguments by the consumer. E.g. `generated`.

Note that this doesn't need to be performed manually for releasing, only for generating source code during development. Also, a future refactor of the beacons to have types that only describe the argument portion of beacons can get us to a point where we don't need to do this step, because we'll be able to import only the schemas we need.

## Compiling and releasing a new version

Perform the NPM release and browser release separately:

### NPM

1. Run `npm run buildForNpm`. It will run the other needed scripts automatically.
2. Increment the version appropriately. Preferably, use a tool like **release** (https://www.npmjs.com/package/release).
3. Run `npm publish` (privileged only).

### Browser

1. Run `npm run buildForBrowser`. It will run the other needed scripts automatically.
1. Run `./shipit.sh` (privileged only). This will clone GroupBy repos such as `cdn`, add the built code to them, and push to remote, triggering our CDN deployment process.
