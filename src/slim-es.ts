/**
 * This is a temporary file to allow NPM consumers to import using ES module
 * import syntax. The library exports with module.exports and ES, so that
 * StoreFront can upgrade with non-breaking changes as of 3.6.0 and then switch
 * to ES imports for TypeScript tooling support at their own pace. Later, this
 * will be removed for 4.0.0 and ES export syntax will be the only exports.
 */

import { TrackerFactory } from "./core";

// When require is done, there's no type information. The type is manually
// applied now.
const GbTracker: TrackerFactory = require('./slim');

// The exported object has type information.
export {
    GbTracker
};
