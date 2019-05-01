// Entry point for bundlers preparing a version of the tracker for web 
// browsers.
(function (w: any) {
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = require('.');
  }

  w.GbTracker = require('.');
})(window);
