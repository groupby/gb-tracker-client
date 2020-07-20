import qs from 'query-string';

// AMP-related utils separate to isolate AMP HTML Authors copyright notice.

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
function decodeAmpLinkerParam(value: string, atob: any): string {
    const base64UrlDecodeSubs = { '-': '+', '_': '/', '.': '=' };

    function stringToBytes(str) {
        const bytes = new Uint8Array(str.length);
        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i);
            if (charCode > 255) {
                throw new Error('Characters must be in range [0,255]');
            }
            bytes[i] = charCode;
        }
        return bytes;
    }    

    function base64UrlDecodeToBytes(str) {
        console.log(`str = ${str}`);
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
 * string params. The function "atob" is provided so that unit tests in a
 * Node.js environment can test this function.
 * @param documentLocationSearch The "document.location.search" string. Can be an empty string (if no query string params).
 */
export function visitorIdFromAmpLocationSearch(documentLocationSearch: string, atob: any): string {
    const qParams = qs.parse(documentLocationSearch);

    if (!qParams.gbi) {
        throw new Error('gbi query string param not found');
    }

    const split = qParams.gbi.split('*');

    if (split.length !== 4) {
        throw new Error('query string param did not have 4 components');
    }

    const encodedVisitorId = split[3];

    if (!encodedVisitorId) {
        throw new Error('no ')
    }

    return decodeAmpLinkerParam(encodedVisitorId, atob);
}
