/**
 * Helper to split string by length
 * @param str
 * @param len
 * @returns {Array}
 */
const chunkString = function (str, len) {
  const size   = Math.ceil(str.length / len);
  const ret    = new Array(size);
  let offset = null;

  for (let i = 0; i < size; i++) {
    offset = i * len;
    ret[i] = str.substring(offset, offset + len);
  }

  return ret;
};

const ESCAPE_SEQUENCE_SIZE = 3;

const chunkEscapedString = function (str, len) {
  const chunked = [];

  while (str.length > 0) {
    const substr     = str.substring(0, len);
    const lastEscape = substr.lastIndexOf('%');
    const sliceIndex = (lastEscape > 0 && len - lastEscape < ESCAPE_SEQUENCE_SIZE) ? lastEscape : len;

    const chunk = str.slice(0, sliceIndex);

    if (chunk.length > len) {
      console.log(`Chunk of size: ${ chunk.length } exceeds size: ${ len}`);
    }

    chunked.push(chunk);
    str = str.slice(sliceIndex);
  }

  return chunked;
};

/**
 * Get unique elements of an array
 * @param array
 * @returns {Array}
 */
const getUnique = function (array) {
  const u = {};
  const a = [];
  for (let i = 0, l = array.length; i < l; ++i) {
    if (u.hasOwnProperty(array[i])) {
      continue;
    }
    a.push(array[i]);
    u[array[i]] = 1;
  }
  return a;
};

/**
 * Helper to deep copy an object
 * @param o
 */
const deepCopy = function (o) {
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
const merge = function (target, source) {
  if (typeof target !== 'object') {
    target = {};
  }

  for (const property in source) {
    if (source.hasOwnProperty(property)) {
      const sourceProperty = source[property];

      if (typeof sourceProperty === 'object') {
        target[property] = merge(target[property], sourceProperty);
        continue;
      }

      target[property] = sourceProperty;
    }
  }

  for (let a = 2, l = arguments.length; a < l; a++) {
    merge(target, arguments[a]);
  }

  return target;
};


/**
 * Returns the version of Internet Explorer or a -1
 * (indicating the use of another browser).
 * @returns {number}
 */
const getInternetExplorerVersion = function (navigatorAppName, userAgent) {
  let rv = -1; // Return value assumes failure.
  if (navigatorAppName == 'Microsoft Internet Explorer') {
    const ua = userAgent;
    const re = new RegExp('MSIE ([0-9]{1,}[\.0-9]{0,})');
    if (re.exec(ua) != null) rv = parseFloat(RegExp.$1);
  }
  return rv;
};

const startsWithOneOf = function (target, array) {
  const len = parseInt(array.length, 10) || 0;
  if (len === 0) {
    return false;
  }

  let k = 0;

  let currentElement = null;
  while (k < len) {
    currentElement = array[k];
    if (target.startsWith && target.startsWith(currentElement)) {
      return true;
    }
    k++;
  }

  return false;
};

module.exports = {
  chunkString:                chunkString,
  chunkEscapedString:         chunkEscapedString,
  deepCopy:                   deepCopy,
  merge:                      merge,
  getInternetExplorerVersion: getInternetExplorerVersion,
  getUnique:                  getUnique,
  startsWithOneOf:            startsWithOneOf
};