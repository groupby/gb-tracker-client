(function(w) {
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = require('./gb-tracker-core');
  }

  w.GbTracker = require('./gb-tracker-core');
})(window);
