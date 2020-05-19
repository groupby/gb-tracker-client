// Entry point for bundlers preparing a version of the tracker for web 
// browsers.

// Since this is the entry point for the browser, the polyfills are loaded here.
import "core-js/stable";
import "regenerator-runtime/runtime";

(function (w: any) {
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = require('.');
  }

  w.GbTracker = require('.');
})(window);
