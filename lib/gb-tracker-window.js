(function (w) {
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = require('./gb-tracker-full');
  }

  w.GbTracker = require('./gb-tracker-full');
})(window);
