import { expect } from 'chai';
import { visitorIdFromAmpLocationSearch } from '../src/amputils';

import atob2 from 'atob';

describe('visitorIdFromAmpLocationSearch', () => {
    it('should return a visitor ID from an href "search" portion with a visitor ID encoded in an AMP Linker value, ignoring non-GroupBy AMP Linker params', () => {
        const search = "?gbi=1*1u74ubq*gbivid*LU55Q2M3TkQyT2Y2VU5rMjlNekxpMXJjQ2g0MEYtNnRjbFhoaFhzLTQ0NDVYc0pXVWhiclFvNUNUbFNUMDFjSA..&_gl=1*18t1sx1*_ga*YW1wLXR0LXVWeHEzMjFzRExFcGVuYndNQWp5bDVUbm9ZSWo0eEZqR251TkFCazBMSE5oWjVHdVZpUm9qXzJvdXpaaDM.";

        const visitorId = visitorIdFromAmpLocationSearch(search, atob2);

        expect(() => visitorIdFromAmpLocationSearch(search, atob2)).to.not.throw;
        expect(visitorId).to.not.be.null;
        expect(visitorId).to.not.be.undefined;
        expect(visitorId).to.eql('-NyCc7ND2Of6UNk29MzLi1rcCh40F-6tclXhhXs-4445XsJWUhbrQo5CTlST01cH');
    });

    it('should throw an error given an href "search" portion with a non-GroupBy AMP Linker param', () => {
        const search = "?_gl=1*18t1sx1*_ga*YW1wLXR0LXVWeHEzMjFzRExFcGVuYndNQWp5bDVUbm9ZSWo0eEZqR251TkFCazBMSE5oWjVHdVZpUm9qXzJvdXpaaDM.";

        expect(() => visitorIdFromAmpLocationSearch(search, atob2)).to.throw;
    });

    it('should throw an error given an href "search" portion with query string params but no AMP Linker params', () => {
        const search = "?hello=world";

        expect(() => visitorIdFromAmpLocationSearch(search, atob2)).to.throw;
    });

    it('should throw an error given an href "search" portion with no query string params', () => {
        const search = "";

        expect(() => visitorIdFromAmpLocationSearch(search, atob2)).to.throw;
    });
});
