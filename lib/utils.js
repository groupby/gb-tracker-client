/**
 * Helper to split string by length
 * @param str
 * @param len
 * @returns {Array}
 */
var chunkString = function (str, len) {
  var size   = Math.ceil(str.length / len);
  var ret    = new Array(size);
  var offset = null;

  for (var i = 0; i < size; i++) {
    offset = i * len;
    ret[i] = str.substring(offset, offset + len);
  }

  return ret;
};

/**
 * Helper to deep copy an object
 * @param o
 */
var deepCopy = function (o) {
  if (o === undefined || o === null) {
    return null;
  }
  return JSON.parse(JSON.stringify(o));
};

/**
 * Recursively merge object, giving the last one precedence
 * @param target
 * @param source
 * @returns {*}
 */
var merge = function (target, source) {
  if (typeof target !== 'object') {
    target = {};
  }

  for (var property in source) {
    if (source.hasOwnProperty(property)) {
      var sourceProperty = source[property];

      if (typeof sourceProperty === 'object') {
        target[property] = merge(target[property], sourceProperty);
        continue;
      }

      target[property] = sourceProperty;
    }
  }

  for (var a = 2, l = arguments.length; a < l; a++) {
    merge(target, arguments[a]);
  }

  return target;
};


/**
 * Returns the version of Internet Explorer or a -1
 * (indicating the use of another browser).
 * @returns {number}
 */
var getInternetExplorerVersion = function (navigatorAppName, userAgent) {
  var rv = -1; // Return value assumes failure.
  if (navigatorAppName == 'Microsoft Internet Explorer') {
    var ua = userAgent;
    var re = new RegExp('MSIE ([0-9]{1,}[\.0-9]{0,})');
    if (re.exec(ua) != null)
      rv = parseFloat(RegExp.$1);
  }
  return rv;
};

module.exports = {
  chunkString:                chunkString,
  deepCopy:                   deepCopy,
  merge:                      merge,
  getInternetExplorerVersion: getInternetExplorerVersion
};