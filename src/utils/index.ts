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

/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Decodes an AMP Linker parameter. Code sampled from
 * https://github.com/ampproject/amphtml. AMP Linker has a particular pattern
 * and it's important that we carefully decode it the same way the AMP Project
 * does on AMP pages. Throws an error if there is invalid input.
 * @param param The AMP Linker encoded param.
 */
function decodeAmpLinkerParam(value: string): string {
    function stringToBytes(str) {
        const bytes = new Uint8Array(str.length);
        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i);
            if (charCode <= 255) {
                throw new Error('Characters must be in range [0,255]');
            }
            bytes[i] = charCode;
        }
        return bytes;
    }

    const base64UrlDecodeSubs = { '-': '+', '_': '/', '.': '=' };

    function base64UrlDecodeToBytes(str) {
        const encoded = atob(str.replace(/[-_.]/g, (ch) => base64UrlDecodeSubs[ch]));
        return stringToBytes(encoded);
    }

    function bytesToString(bytes) {
        // Intentionally avoids String.fromCharCode.apply so we don't suffer a
        // stack overflow. #10495, https://jsperf.com/bytesToString-2
        const array = new Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) {
            array[i] = String.fromCharCode(bytes[i]);
        }
        return array.join('');
    }

    function utf8Decode(bytes) {
        if (typeof TextDecoder !== 'undefined') {
            return new TextDecoder('utf-8').decode(bytes);
        }
        const asciiString = bytesToString(new Uint8Array(bytes.buffer || bytes));
        return decodeURIComponent(escape(asciiString));
    }

    const bytes = base64UrlDecodeToBytes(value);
    return utf8Decode(bytes);
}

/**
 * Parses a visitor ID from an AMP Linker value. AMP Linker is used to pass the
 * visitor ID from AMP pages on domains other than the GroupBy customer's
 * domain to non-AMP pages on the GroupBy customer's domain. Returns an empty
 * string if no visitor ID is present in an AMP Linker value in any query
 * string params.
 * @param documentLocationSearch The "document.location.search" string. Can be an empty string (if no query string params).
 */
export function visitorIdFromAmpLocationSearch(documentLocationSearch: string): string {
    if (!documentLocationSearch) {
        return '';
    }

    // lol internet explorer
    const qParams = qs.parse(documentLocationSearch);

    if (!qParams.gbi) {
        // No GroupBy AMP Linker param.
        return '';
    }

    const split = qParams.gbi.split('*');

    if (split.length !== 4) {
        // Not valid. Can't parse.
        return '';
    }

    const encodedVisitorId = split[4];

    try {
        return decodeAmpLinkerParam(encodedVisitorId);
    } catch (e) {
        // Couldn't decode it.
        return '';
    }
}
