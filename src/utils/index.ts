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
