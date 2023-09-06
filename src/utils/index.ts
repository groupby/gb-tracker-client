import qs from 'query-string';
import { SLDs } from '../slds';

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

/**
 * When we set the visitor ID cookie, we want to set it on the apex domain, not the specific domain. This allows all
 * domains the customer has associated with the apex domain to share a visitor ID value. We consider this to not
 * violate privacy because presumably, any subdomains are owned by the same customer that owns the apex domain. They
 * presumably already have the ability to track shoppers accross their websites. We're matching that capability, but
 * going no further. For example, we aren't tracking shoppers accross different apex domains.
 * @param window An object conforming the Window interface of web browsers.
 */
export function getApexDomain(window: Window): string {
    const host = window.location.hostname;

    if (host.indexOf('.') < 0) {
        // No . so do no split.
        return host;
    }

    const split = host.split('.');
    const hostLength = split.length;
    const apex =  `${split[hostLength - 2]}.${split[hostLength - 1]}`;

    if (SLDs.indexOf(apex) >= 0) {
        return `${split[hostLength - 3]}.${apex}`;
    }
    return apex;
};
