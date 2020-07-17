const expect = require('chai').expect;
const { visitorIdFromAmpLocationSearch } = require('../dist/amputils');

const atob = require('atob');

describe('visitorIdFromAmpLocationSearch', () => {
    it('should return a visitor ID from an href with a visitor ID encoded in an AMP Linker value, ignoring non-GroupBy AMP Linker params', () => {
        const search = "?gbi=1*1u74ubq*gbivid*LU55Q2M3TkQyT2Y2VU5rMjlNekxpMXJjQ2g0MEYtNnRjbFhoaFhzLTQ0NDVYc0pXVWhiclFvNUNUbFNUMDFjSA..&_gl=1*18t1sx1*_ga*YW1wLXR0LXVWeHEzMjFzRExFcGVuYndNQWp5bDVUbm9ZSWo0eEZqR251TkFCazBMSE5oWjVHdVZpUm9qXzJvdXpaaDM.";

        const visitorId = visitorIdFromAmpLocationSearch(search, atob);

        expect(() => visitorIdFromAmpLocationSearch(search, atob)).to.not.throw;
        expect(visitorId).to.not.be.null;
        expect(visitorId).to.not.be.undefined;
        expect(visitorId).to.eql('-NyCc7ND2Of6UNk29MzLi1rcCh40F-6tclXhhXs-4445XsJWUhbrQo5CTlST01cH');
    });
});
