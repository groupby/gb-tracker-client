(function (w) {
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = require('./bin/gb-tracker-client');
  }

  if (w) {
    w.GbTracker = require('./bin/gb-tracker-client');
  }
})(window);