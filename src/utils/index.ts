/**
 * Breaks down strings until they fit in a maximum length. The algorithm
 * will try splitting the string every n (maxLength) characters. After
 * splitting, we will pass the chunks through the optional encoder and check
 * the length again - if the length exceeds the maximum length after being
 * encoded, we will recursively split the blob in half until it fits.
 * The optional encoder will ensure that even if the string gets encoded, the
 * resulting string will be smaller than the maximum length).
 */
export function chunkString(blob: string, maxLength: number, encode: ((e: string) => string) = ((e) => e)): string[] {
  const hasEncoder = !!encode;
  const chunkedSize = Math.ceil(blob.length / maxLength);
  const chunked = new Array(chunkedSize);

  const splitChunks = (b: string): string[] => {
    if (encode(b).length <= maxLength || b.length <= 1) {
      return [b];
    }
    const limit = Math.floor(b.length / 2);
    const firstChunk = b.substr(0, limit);
    const secondChunk = b.substr(limit);
    return [...splitChunks(firstChunk), ...splitChunks(secondChunk)];
  };

  for (let i = 0; i < chunkedSize; i++) {
    chunked[i] = blob.substr(i * maxLength, maxLength);
  }

  if (hasEncoder) {
    return chunked
      .map((e) => splitChunks(e))
      .reduce((acc, chunk) => [...acc, ...chunk], []);
  }

  return chunked;
}

/**
 * Splits a string into smaller pieces of len length, but will not separate
 * escaped characters like %7B
 */
const ESCAPE_SEQUENCE_SIZE = 3;
export function chunkEscapedString(str: string, len: number): string[] {
  const chunked = [];

  while (str.length > 0) {
    const substr = str.substring(0, len);
    const lastEscape = substr.lastIndexOf('%');
    const sliceIndex = (lastEscape > 0 && len - lastEscape < ESCAPE_SEQUENCE_SIZE) ? lastEscape : len;
    const chunk = str.slice(0, sliceIndex);
    chunked.push(chunk);
    str = str.slice(sliceIndex);
  }

  return chunked;
}

/**
 * Get unique elements of an array
 */
export function getUnique(array: any[]): any[] {
  const u: Record<any, any> = {};
  const a: any[] = [];
  for (const item of array) {
    if (u.hasOwnProperty(item)) {
      continue;
    }
    a.push(item);
    u[item] = 1;
  }
  return a;
}

/**
 * Helper to deep copy an object
 */
export function deepCopy(o: any): any {
  if (o === undefined || o === null) {
    return null;
  }
  return JSON.parse(JSON.stringify(o));
}

/**
 * Recursively merge object, giving the last one precedence
 */
export function merge(target: Record<any, any>, ...sources: Record<any, any>[]): Record<any, any> {
  for (const source of sources) {
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
  }

  return target;
}

/**
 * Returns the version of Internet Explorer or a -1 (indicating the use of another browser).
 */
export function getInternetExplorerVersion(navigatorAppName: string, userAgent: string): number {
  let rv = -1; // Return value assumes failure.
  if (navigatorAppName === 'Microsoft Internet Explorer') {
    const ua = userAgent;
    const re = new RegExp('MSIE ([0-9]{1,}[.0-9]{0,})');
    if (re.exec(ua) != null) {
      rv = parseFloat(RegExp.$1);
    }
  }
  return rv;
}

/**
 * Returns true if a string starts with one of the strings in an array
 */
export function startsWithOneOf(target: string, array: string[]): boolean {
  const len = parseInt(array.length as any, 10) || 0;
  if (len === 0) {
    return false;
  }

  let k = 0;
  let currentElement;
  while (k < len) {
    currentElement = array[k];
    if (target.startsWith && target.startsWith(currentElement)) {
      return true;
    }
    k++;
  }

  return false;
}
