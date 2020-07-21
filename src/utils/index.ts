import qs from 'query-string';

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
 * Parses a visitor ID from an AMP Linker value. AMP Linker is used to pass the
 * visitor ID from AMP pages on domains other than the GroupBy customer's
 * domain to non-AMP pages on the GroupBy customer's domain. Returns an empty
 * string if no visitor ID is present in an AMP Linker value in any query
 * string params.
 * @param href The href of the page with the AMP Linker value in it.
 */
export function visitorIdFromAmpHrefManual(href: string): string {
    // lol internet explorer
    const stringIncludes = (str: string, substr: string): boolean => {
        return str.indexOf(substr) !== -1;
    }

    const isGbiParam = (qParam: string) => {
        return stringIncludes(qParam, 'gbi');
    };

    // Check for no query string parameters.
    if (!stringIncludes(href, '?')) {
        return '';
    }

    // There are query string parameters. Get them.
    const qParams = href.substring(href.indexOf('?') + 1, href.length);

    let gbiParam: string;

    const multipleParams = qParams.indexOf('&') !== -1;

    if (multipleParams) {
        // Split and then look for a single gbi param.
        for (const qParam of qParams.split('&')) {
            if (isGbiParam(qParam)) {
                gbiParam = qParam;
                break;
            }
        }
    } else {
        // Check the single param to see if it's a gbi param.
        const qParam = qParams;
        if (isGbiParam(qParam)) {
            gbiParam = qParam;
        }
    }

    // If no gbi param found, AMP Linker wasn't used for GroupBy.
    if (!gbiParam) {
        return '';
    }

    // Otherwise, the gbi param was found. Parse it.
    // WIP
    return '';
}
